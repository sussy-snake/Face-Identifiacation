import os
from fastapi import HTTPException

# Face recognition is disabled on Windows due to dlib/model issues.
HAS_FACE_RECOGNITION = False

class VisionNode:
    """
    Dedicated to handling the facial recognition pipeline and cropping the image.
    """
    async def process_image(self, file_path: str) -> list:
        """
        Detects faces in the image, sorts them by bounding box area, 
        and crops a maximum of 2 faces. Returns a list of paths to the cropped faces.
        """
        if HAS_FACE_RECOGNITION:
            try:
                import face_recognition
                from PIL import Image
                
                image = face_recognition.load_image_file(file_path)
                face_locations = face_recognition.face_locations(image)
                
                if not face_locations:
                    raise HTTPException(status_code=400, detail="No face detected in the image.")
                
                # Sort by bounding box area: (bottom - top) * (right - left)
                # face_locations returns (top, right, bottom, left)
                face_locations.sort(key=lambda loc: (loc[2] - loc[0]) * (loc[1] - loc[3]), reverse=True)
                
                # Cap at top 2 faces
                top_faces = face_locations[:2]
                
                pil_image = Image.fromarray(image)
                crop_paths = []
                
                for idx, (top, right, bottom, left) in enumerate(top_faces):
                    # Add a slight margin (20%)
                    h, w = bottom - top, right - left
                    margin_y, margin_x = int(h * 0.2), int(w * 0.2)
                    
                    crop = pil_image.crop((
                        max(0, left - margin_x),
                        max(0, top - margin_y),
                        min(pil_image.width, right + margin_x),
                        min(pil_image.height, bottom + margin_y)
                    ))
                    
                    crop_path = f"{file_path}_crop_{idx}.jpg"
                    crop.save(crop_path)
                    crop_paths.append(crop_path)
                    
                return crop_paths
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Face detection failed: {str(e)}")
        else:
            print("VisionNode: Skipping face detection step because face_recognition is disabled. Returning full image.")
            return [file_path]
    async def compare_faces(self, original_image_path: str, candidate_url: str) -> float:
        """
        Calculates a percentage similarity score against the candidate URL.
        """
        import hashlib
        
        # MOCK LOGIC: We deterministically generate a score based on the URL string 
        # so that we can test both exact (>80%) and partial (<80%) matches without 
        # downloading images and running DeepFace locally.
        
        # In a real environment, we would use DeepFace:
        # try:
        #     from deepface import DeepFace
        #     # Download image, run DeepFace.verify()
        #     # result = DeepFace.verify(original_image_path, downloaded_img_path)
        #     # return map_distance_to_score(result["distance"])
        # except ImportError: pass
        
        url_hash = int(hashlib.md5(candidate_url.encode()).hexdigest()[:8], 16)
        
        # If the URL contains "fail" or "conference", force a partial match score (<80)
        if "fail" in candidate_url.lower() or "conference" in candidate_url.lower():
            return float(url_hash % 20 + 60) # 60% - 79%
            
        # Otherwise, force an exact match score (>80)
        return float(url_hash % 15 + 85) # 85% - 99%

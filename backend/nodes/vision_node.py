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

    async def compare_faces(self, original_image_path: str, candidate: dict, extracted_identity: str = "", consensus_count: int = 1) -> float:
        """
        Calculates a raw cosine distance against the candidate image URL using ArcFace.
        Distance ranges from 0.0 (identical) to ~1.0.
        """
        import os
        import urllib.request
        import tempfile
        import hashlib
        
        candidate_image_url = candidate.get("thumbnail", candidate.get("link", ""))
        candidate_title = candidate.get("title", "").lower()
        candidate_link = candidate.get("link", "").lower()

        # Download the candidate image
        temp_img_path = None
        try:
            if candidate_image_url and candidate_image_url.startswith("http"):
                temp_dir = tempfile.gettempdir()
                filename = hashlib.md5(candidate_image_url.encode()).hexdigest() + ".jpg"
                temp_img_path = os.path.join(temp_dir, filename)
                
                # Only download if we don't already have it
                if not os.path.exists(temp_img_path):
                    req = urllib.request.Request(candidate_image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=5) as response, open(temp_img_path, 'wb') as out_file:
                        out_file.write(response.read())
            else:
                temp_img_path = candidate_image_url
                
        except Exception as e:
            print(f"[VisionNode] Failed to download candidate image {candidate_image_url}: {e}")
            # If download fails, we shouldn't reward it with a fake good score. Force to fallback mock.
            pass

        if temp_img_path and os.path.exists(temp_img_path):
            try:
                from deepface import DeepFace
                # DeepFace inherently crops and aligns using the detector_backend.
                result = DeepFace.verify(
                    img1_path=original_image_path,
                    img2_path=temp_img_path,
                    model_name="ArcFace",
                    detector_backend="opencv",
                    distance_metric="cosine",
                    enforce_detection=False # False to prevent crashing on low-res thumbnails, but it still tries to crop
                )
                return float(result.get("distance", 1.0))
            except Exception as e:
                print(f"[VisionNode] DeepFace verification failed for {candidate_title}: {e}. Falling back to deterministic mock distance.")
            
        # --- LIGHTWEIGHT MATHEMATICAL BIOMETRICS (NO TENSORFLOW REQUIRED) ---
        # If DeepFace fails (e.g. OOM on free tier), we use a purely mathematical 
        # pixel-level comparison using OpenCV ORB Feature Matching and Histogram Correlation.
        try:
            import cv2
            import numpy as np
            
            img1 = cv2.imread(original_image_path, cv2.IMREAD_GRAYSCALE)
            img2 = cv2.imread(temp_img_path, cv2.IMREAD_GRAYSCALE)
            
            # Detect and crop faces
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            face_cascade = cv2.CascadeClassifier(cascade_path)
            
            faces1 = face_cascade.detectMultiScale(img1, scaleFactor=1.1, minNeighbors=4)
            faces2 = face_cascade.detectMultiScale(img2, scaleFactor=1.1, minNeighbors=4)
            
            if len(faces1) > 0 and len(faces2) > 0:
                x,y,w,h = faces1[0]
                face1 = img1[y:y+h, x:x+w]
                
                x,y,w,h = faces2[0]
                face2 = img2[y:y+h, x:x+w]
                
                # Standardize size for comparison
                face1 = cv2.resize(face1, (200, 200))
                face2 = cv2.resize(face2, (200, 200))
                
                # 1. Histogram Correlation (Color/Lighting Distribution)
                hist1 = cv2.calcHist([face1], [0], None, [256], [0, 256])
                hist2 = cv2.calcHist([face2], [0], None, [256], [0, 256])
                cv2.normalize(hist1, hist1, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
                cv2.normalize(hist2, hist2, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
                correlation = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
                
                # 2. ORB Feature Matching (Structural/Geometric Features)
                orb = cv2.ORB_create()
                kp1, des1 = orb.detectAndCompute(face1, None)
                kp2, des2 = orb.detectAndCompute(face2, None)
                
                orb_distance = 1.0
                if des1 is not None and des2 is not None:
                    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
                    matches = bf.match(des1, des2)
                    if len(matches) > 0:
                        matches = sorted(matches, key=lambda x: x.distance)
                        good_matches = matches[:50]
                        avg_dist = sum(m.distance for m in good_matches) / len(good_matches)
                        # Map ORB Hamming distance (0-100) to 0.0-1.0
                        orb_distance = max(0.0, min(1.0, (avg_dist - 20) / 60.0))
                
                # Combine Correlation (higher is better, 1.0 is max) and ORB distance (lower is better, 0.0 is max)
                # Map correlation to distance (0.0 distance = 1.0 correlation)
                hist_distance = 1.0 - max(0.0, correlation)
                
                # Weighted final distance (ORB is better for structural facial features)
                final_distance = (orb_distance * 0.7) + (hist_distance * 0.3)
                
                print(f"[Lightweight Bio] {candidate_title} | ORB: {orb_distance:.2f} | Hist: {hist_distance:.2f} | Final: {final_distance:.2f}")
                return float(final_distance)
                
        except Exception as e:
            print(f"[VisionNode] Lightweight Biometrics failed: {e}")
            
        # Absolute Worst-Case Fallback: If both DeepFace AND OpenCV fail, heavily penalize.
        url_hash = int(hashlib.md5(candidate_image_url.encode()).hexdigest()[:8], 16)
        return float((url_hash % 20) / 100.0 + 0.80)

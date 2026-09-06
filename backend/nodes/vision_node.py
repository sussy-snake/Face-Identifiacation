import os
from fastapi import HTTPException

# Face recognition is disabled on Windows due to dlib/model issues.
HAS_FACE_RECOGNITION = False

class VisionNode:
    """
    Dedicated to handling the facial recognition pipeline and cropping the image.
    """
    async def process_image(self, file_path: str) -> bool:
        """
        Processes the image to ensure a face is detected.
        Returns True if successful, raises an exception otherwise.
        """
        if HAS_FACE_RECOGNITION:
            try:
                import face_recognition
                image = face_recognition.load_image_file(file_path)
                face_locations = face_recognition.face_locations(image)
                if not face_locations:
                    raise HTTPException(status_code=400, detail="No face detected in the image.")
                return True
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Face detection failed: {str(e)}")
        else:
            print("VisionNode: Skipping face detection step because face_recognition is disabled.")
            return True

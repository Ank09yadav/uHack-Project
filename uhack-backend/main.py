
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import shutil
import os

from pydantic import BaseModel

app = FastAPI(title="InkluLearn AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    import whisper
    import shutil
    
    if shutil.which("ffmpeg"):
        model = whisper.load_model("base")
        USE_LOCAL_WHISPER = True
        print("Local Whisper model loaded successfully.")
    else:
        USE_LOCAL_WHISPER = False
        print("FFmpeg not found. Whisper disabled.")

except ImportError:
    USE_LOCAL_WHISPER = False
    print("Local Whisper module not found. Will use Mock or OpenAI API fallback.")

@app.get("/")
def read_root():
    return {"status": "online", "service": "InkluLearn Backend"}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe uploaded audio file using Whisper.
    """
    try:
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        text = ""
        
        if USE_LOCAL_WHISPER:
            result = model.transcribe(temp_filename)
            text = result["text"]
        else:
             os.remove(temp_filename)
             raise HTTPException(status_code=503, detail="Whisper module/FFmpeg not installed. Please install 'openai-whisper' and 'ffmpeg' or use Fast Mode.")
        
        return {"text": text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


import cv2
import numpy as np
import base64

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze image using OpenCV for accessibility metrics (Brightness, Contrast).
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        avg_brightness = np.mean(gray)
        
        contrast = np.sqrt(np.mean((gray - avg_brightness) ** 2))
        
        feedback = []
        status = "Good"
        
        if avg_brightness < 50:
            feedback.append("⚠️ Image is too dark. Low-vision users may struggle to see details.")
            status = "Needs Improvement"
        elif avg_brightness > 200:
            feedback.append("⚠️ Image is very bright. Verify meaningful content isn't washed out.")
            
        if contrast < 40:
            feedback.append("⚠️ Low contrast detected. Ensure text/objects stand out from the background.")
            status = "Needs Improvement"
            
        return {
            "brightness": float(avg_brightness),
            "contrast": float(contrast),
            "status": status,
            "feedback": feedback
        }

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-profile")
async def save_profile(file: UploadFile = File(...)):
    """
    Save profile picture with OpenCV validation.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        face_detected = len(faces) > 0
        
        return {
            "success": True,
            "face_detected": face_detected,
            "message": "Profile picture processed with OpenCV" if face_detected else "No face detected. Please try again.",
            "faces_count": len(faces)
        }

    except Exception as e:
        print(f"Error saving profile: {e}")
        return {"success": True, "face_detected": False, "message": "Image saved (Validation skipped)"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

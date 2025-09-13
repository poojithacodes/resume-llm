import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from . import models
from .db import engine, SessionLocal
from .parsers import parse_resume        # Resume parsing
from .llm_utils import analyze_resume    # Gemini LLM analysis

# -------------------------------
# Create DB tables
# -------------------------------
models.Base.metadata.create_all(bind=engine)

# -------------------------------
# Initialize FastAPI
# -------------------------------
app = FastAPI(title="Resume Analyzer API", version="0.6")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static_uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -------------------------------
# Database helper
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------
# Health check
# -------------------------------
@app.get("/ping")
def ping():
    return {"status": "ok"}


# -------------------------------
# Upload resume endpoint
# -------------------------------
@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):
    filename = file.filename
    save_path = os.path.join(UPLOAD_DIR, filename)

    # Handle duplicate filenames
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(save_path):
        filename = f"{base}_{counter}{ext}"
        save_path = os.path.join(UPLOAD_DIR, filename)
        counter += 1

    # Save file
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Parse resume
    parsed_data = parse_resume(save_path)
    text = parsed_data.get("raw_text", "")
    if not text.strip():
        text = "No readable text found in resume."

    # Debugging log: check what text Gemini sees
    print("\n=== Extracted Resume Text (first 500 chars) ===")
    print(text[:500])
    print("===============================================\n")

    # Create DB record
    db = next(get_db())
    resume = models.Resume(
        filename=filename,
        name=parsed_data.get("name"),
        email=parsed_data.get("email"),
        phone=parsed_data.get("phone"),
        core_skills=", ".join(parsed_data.get("skills", [])),
        raw_text=text
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Gemini analysis
    analysis = analyze_resume(text)

    # Always convert to strings for assignment format
    resume.resume_rating = analysis.get("resume_rating")
    resume.improvement_areas = analysis.get("improvement_areas", "")
    resume.upskill_suggestions = analysis.get("upskill_suggestions", "")

    db.commit()
    db.refresh(resume)

    # Return API response
    return {
        "id": resume.id,
        "filename": resume.filename,
        "name": resume.name,
        "email": resume.email,
        "phone": resume.phone,
        "core_skills": resume.core_skills,
        "resume_rating": resume.resume_rating,
        "improvement_areas": resume.improvement_areas,
        "upskill_suggestions": resume.upskill_suggestions
    }


# -------------------------------
# List all resumes
# -------------------------------
@app.get("/api/resumes")
def list_resumes():
    db = next(get_db())
    rows = db.query(models.Resume).order_by(models.Resume.upload_time.desc()).all()
    results = [{
        "id": r.id,
        "filename": r.filename,
        "name": r.name,
        "email": r.email,
        "phone": r.phone,
        "core_skills": r.core_skills,
        "resume_rating": r.resume_rating,
        "improvement_areas": r.improvement_areas,
        "upskill_suggestions": r.upskill_suggestions
    } for r in rows]
    return results


# -------------------------------
# Get single resume details
# -------------------------------
@app.get("/api/resume/{resume_id}")
def get_resume(resume_id: int):
    db = next(get_db())
    r = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {
        "id": r.id,
        "filename": r.filename,
        "name": r.name,
        "email": r.email,
        "phone": r.phone,
        "core_skills": r.core_skills,
        "soft_skills": r.soft_skills,
        "resume_rating": r.resume_rating,
        "improvement_areas": r.improvement_areas,
        "upskill_suggestions": r.upskill_suggestions,
        "raw_text": r.raw_text
    }


# -------------------------------
# Download resume file
# -------------------------------
@app.get("/api/download/{resume_id}")
def download_resume(resume_id: int):
    db = next(get_db())
    r = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    if not r:
        raise HTTPException(status_code=404)
    file_path = os.path.join(UPLOAD_DIR, r.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404)
    return FileResponse(file_path, filename=r.filename)




# -------------------------------
# NEW: Delete all resumes
# -------------------------------
@app.delete("/api/resumes")
def clear_resumes():
    db = next(get_db())
    resumes = db.query(models.Resume).all()

    # remove all files
    for r in resumes:
        file_path = os.path.join(UPLOAD_DIR, r.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        db.delete(r)

    db.commit()
    return {"message": "All resumes deleted"}


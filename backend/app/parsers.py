# backend/app/parsers.py
import re
from typing import Dict
import pdfplumber
import docx

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a text-based PDF using pdfplumber.
    """
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from DOCX using python-docx.
    """
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text.strip()

def parse_resume(file_path: str) -> Dict:
    """
    Extracts basic information (name, email, phone, skills, raw_text) from resume.
    """
    text = ""
    if file_path.endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        text = extract_text_from_docx(file_path)

    if not text.strip():
        text = "No readable text found in resume."

    # Extract email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    email = email_match.group(0) if email_match else None

    # Extract phone
    phone_match = re.search(r'(\+?\d[\d\s\-\(\)]{7,}\d)', text)
    phone = phone_match.group(0) if phone_match else None

    # Very basic name extraction (first non-empty line assumption)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    name = lines[0] if lines else None

    # Skills (basic keyword search)
    skills_list = [
        "python", "java", "c++", "react", "django", "flask", "fastapi",
        "sql", "javascript", "aws", "docker", "kubernetes"
    ]
    skills_found = [skill for skill in skills_list if re.search(rf"\b{skill}\b", text, re.IGNORECASE)]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills_found,
        "raw_text": text
    }

# backend/app/llm_utils.py
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file!")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-1.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

def analyze_resume(resume_text: str) -> dict:
    """
    Sends resume text to Gemini and returns structured feedback.
    """
    prompt = f"""
You are an expert resume reviewer. Analyze the following resume text:

{resume_text}

Return ONLY valid JSON in this format:
{{
    "resume_rating": 0-10,
    "improvement_areas": ["list of improvement points"],
    "upskill_suggestions": ["list of relevant skills"]
}}
"""

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        # Clean response if wrapped in ```json ... ```
        if "```" in content:
            content = content.replace("```json", "").replace("```", "").strip()

        print("\n=== Gemini Raw Response ===")
        print(content[:500])  # Debug
        print("===========================\n")

        #  Parse JSON safely
        analysis = json.loads(content)

        # Convert lists to strings for DB
        return {
            "resume_rating": analysis.get("resume_rating", 5),
            "improvement_areas": "; ".join(analysis.get("improvement_areas", [])),
            "upskill_suggestions": "; ".join(analysis.get("upskill_suggestions", []))
        }

    except Exception as e:
        print(f" Gemini API error: {e}")
        return {
            "resume_rating": 5,
            "improvement_areas": "Could not generate analysis",
            "upskill_suggestions": ""
        }

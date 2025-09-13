from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from .db import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    upload_time = Column(DateTime(timezone=True), server_default=func.now())
    raw_text = Column(Text, nullable=True)

    # example structured fields (we'll expand later)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    core_skills = Column(JSON, nullable=True)
    soft_skills = Column(JSON, nullable=True)
    resume_rating = Column(Integer, nullable=True)
    improvement_areas = Column(Text, nullable=True)
    upskill_suggestions = Column(Text, nullable=True)

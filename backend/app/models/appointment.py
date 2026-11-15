from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    scheduled_by_name = Column(String(100), nullable=False)   # Name of member who scheduled
    doctor_name = Column(String(120), nullable=False)         # "Dr. Sarah Adams"
    specialty = Column(String(100), nullable=False)           # "Cardiologist", "Endocrinologist", etc.
    clinic_or_hospital = Column(String(200), nullable=False)  # "City Memorial Hospital, Room 302"
    appointment_datetime = Column(String(30), nullable=False, index=True) # "2026-11-18T10:30"
    
    contact_phone = Column(String(40), nullable=True)         # Clinic desk phone
    purpose_or_reason = Column(String(255), nullable=True)    # "Quarterly Diabetes Check"
    preparation_notes = Column(Text, nullable=True)           # "Fast 8 hours prior"
    status = Column(String(20), nullable=False, default="upcoming") # "upcoming", "completed", "cancelled"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("ElderlyProfile", backref="appointments")
    user = relationship("User")

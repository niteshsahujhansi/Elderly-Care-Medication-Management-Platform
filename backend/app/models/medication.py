from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False, index=True)

    # Core details
    name = Column(String(120), nullable=False)          # e.g., "Metformin"
    dosage = Column(String(60), nullable=False)         # e.g., "500 mg" or "1 tablet"

    # Timing & Slot
    time_slot = Column(String(20), nullable=False)      # 'morning', 'afternoon', 'evening', 'night'
    exact_time = Column(String(10), default="08:00")    # e.g., "08:00", "13:00", "19:00", "21:30"
    frequency = Column(String(40), default="daily")     # 'daily', 'twice_daily', 'as_needed', 'weekly'

    # Instructions & Medical Purpose
    instructions = Column(String(255), nullable=True)   # e.g., "Take with food"
    purpose = Column(String(150), nullable=True)        # e.g., "Blood sugar control"

    # Visual Pill Aids
    pill_shape = Column(String(30), default="Round")    # 'Round', 'Oval', 'Capsule', 'Liquid'
    pill_color = Column(String(30), default="White")    # 'White', 'Blue', 'Yellow', 'Pink', 'Red'

    # Duration & Inventory
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)        # null for chronic/ongoing
    inventory_count = Column(Integer, nullable=True)    # pills remaining

    is_active = Column(Boolean, default=True)           # active prescription
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("ElderlyProfile", backref="medications")

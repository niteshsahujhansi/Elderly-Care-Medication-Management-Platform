from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base

class AdherenceLog(Base):
    __tablename__ = "adherence_logs"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id", ondelete="CASCADE"), nullable=False, index=True)
    logged_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    logged_by_name = Column(String(100), nullable=False)      # "Robert Jenkins" or "Nurse Elena"
    log_date = Column(String(20), nullable=False, index=True) # "YYYY-MM-DD"
    time_slot = Column(String(20), nullable=False)            # 'morning', 'afternoon', 'evening', 'night'
    status = Column(String(20), nullable=False, default="taken") # 'taken', 'skipped'
    logged_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(String(255), nullable=True)                # e.g., "Felt dizzy", "Doctor asked to pause"

    profile = relationship("ElderlyProfile", backref="adherence_logs")
    medication = relationship("Medication", backref="adherence_logs")
    user = relationship("User")

    __table_args__ = (
        UniqueConstraint("profile_id", "medication_id", "log_date", "time_slot", name="uq_profile_med_date_slot"),
        Index("idx_adherence_profile_date", "profile_id", "log_date"),
    )

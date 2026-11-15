from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    recipient_email = Column(String(120), nullable=False)
    recipient_name = Column(String(100), nullable=False)
    alert_type = Column(String(40), nullable=False)  # "missed_dose_alert", "upcoming_dose_reminder", "appointment_reminder", "test_alert"
    subject = Column(String(200), nullable=False)
    message_content = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="sent")  # "sent", "simulated", "failed"
    is_read = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("ElderlyProfile", backref="notification_logs")
    user = relationship("User")

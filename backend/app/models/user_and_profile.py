from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email_or_phone = Column(String(120), unique=True, index=True, nullable=False)
    passcode = Column(String(20), nullable=False)  # 6-digit numeric PIN (e.g., "123456")
    default_role = Column(String(20), default="family")  # 'senior', 'family', 'caregiver', 'other'
    created_at = Column(DateTime, default=datetime.utcnow)

    memberships = relationship("CareCircleMember", back_populates="user", cascade="all, delete-orphan")


class ElderlyProfile(Base):
    __tablename__ = "elderly_profiles"

    id = Column(Integer, primary_key=True, index=True)
    circle_code = Column(String(10), unique=True, index=True, nullable=False)  # Universal 6-digit code
    name = Column(String(100), nullable=False)  # Patient full name

    # Rich optional healthcare fields
    date_of_birth = Column(String(20), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    primary_phone = Column(String(30), nullable=True)
    emergency_phone = Column(String(30), nullable=True)
    emergency_contact_name = Column(String(100), nullable=True)
    primary_physician_name = Column(String(100), nullable=True)
    primary_physician_phone = Column(String(30), nullable=True)
    hospital_preference = Column(String(150), nullable=True)
    allergies = Column(Text, nullable=True)
    chronic_conditions = Column(Text, nullable=True)
    dietary_restrictions = Column(String(150), nullable=True)
    mobility_status = Column(String(50), nullable=True)
    preferred_language = Column(String(50), default="English", nullable=True)
    room_or_address = Column(String(200), nullable=True)
    insurance_provider = Column(String(100), nullable=True)
    insurance_policy_number = Column(String(50), nullable=True)
    special_care_instructions = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("CareCircleMember", back_populates="profile", cascade="all, delete-orphan")


class CareCircleMember(Base):
    __tablename__ = "care_circle_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False)
    role_in_circle = Column(String(20), nullable=False)  # 'senior', 'family', 'caregiver', 'other'
    notify_email = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="memberships")
    profile = relationship("ElderlyProfile", back_populates="members")

    __table_args__ = (
        UniqueConstraint("user_id", "profile_id", name="uq_user_profile_circle"),
        Index("idx_member_user_profile", "user_id", "profile_id"),
    )

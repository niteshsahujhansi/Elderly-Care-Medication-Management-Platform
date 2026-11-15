from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

# --- User & Auth Schemas ---
class UserSignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email_or_phone: str = Field(..., min_length=3, max_length=120)
    passcode: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")
    default_role: str = Field("family")

class UserLoginRequest(BaseModel):
    email_or_phone: str
    passcode: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email_or_phone: str
    default_role: str
    created_at: datetime

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Elderly Profile Schemas ---
class ElderlyProfileCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    primary_phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    primary_physician_name: Optional[str] = None
    primary_physician_phone: Optional[str] = None
    hospital_preference: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    mobility_status: Optional[str] = None
    preferred_language: Optional[str] = "English"
    room_or_address: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    special_care_instructions: Optional[str] = None
    role_in_circle: str = "family"

class ElderlyProfileUpdate(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    primary_phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    primary_physician_name: Optional[str] = None
    primary_physician_phone: Optional[str] = None
    hospital_preference: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    mobility_status: Optional[str] = None
    preferred_language: Optional[str] = None
    room_or_address: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    special_care_instructions: Optional[str] = None

class ElderlyProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    circle_code: str
    name: str
    date_of_birth: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    primary_phone: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    primary_physician_name: Optional[str] = None
    primary_physician_phone: Optional[str] = None
    hospital_preference: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    mobility_status: Optional[str] = None
    preferred_language: Optional[str] = "English"
    room_or_address: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    special_care_instructions: Optional[str] = None
    created_at: datetime


# --- Care Circle Connections Schemas ---
class JoinCareCircleRequest(BaseModel):
    circle_code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")
    role_in_circle: str = "family"

class AccessibleProfileSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    profile_id: int
    circle_code: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    role_in_circle: str
    notify_email: bool

class CircleMemberDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    name: str
    email_or_phone: str
    role_in_circle: str
    notify_email: bool
    joined_at: datetime

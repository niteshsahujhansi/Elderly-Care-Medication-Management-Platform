from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class AppointmentCreate(BaseModel):
    profile_id: int
    doctor_name: str = Field(..., min_length=2, max_length=120)
    specialty: str = Field(..., min_length=2, max_length=100)
    clinic_or_hospital: str = Field(..., min_length=2, max_length=200)
    appointment_datetime: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$")
    contact_phone: Optional[str] = None
    purpose_or_reason: Optional[str] = None
    preparation_notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    clinic_or_hospital: Optional[str] = None
    appointment_datetime: Optional[str] = None
    contact_phone: Optional[str] = None
    purpose_or_reason: Optional[str] = None
    preparation_notes: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(upcoming|completed|cancelled)$")

class AppointmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_id: int
    scheduled_by_name: str
    doctor_name: str
    specialty: str
    clinic_or_hospital: str
    appointment_datetime: str
    contact_phone: Optional[str] = None
    purpose_or_reason: Optional[str] = None
    preparation_notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

class AppointmentListSummary(BaseModel):
    upcoming: List[AppointmentResponse]
    past_or_completed: List[AppointmentResponse]
    total_upcoming: int

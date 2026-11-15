from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class MedicationCreate(BaseModel):
    profile_id: int
    name: str = Field(..., min_length=2, max_length=120)
    dosage: str = Field(..., min_length=1, max_length=60)
    time_slot: str = Field(..., pattern="^(morning|afternoon|evening|night)$")
    exact_time: Optional[str] = "08:00"
    frequency: Optional[str] = "daily"
    instructions: Optional[str] = "Take with food"
    purpose: Optional[str] = None
    pill_shape: Optional[str] = "Round"
    pill_color: Optional[str] = "White"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    inventory_count: Optional[int] = None

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    time_slot: Optional[str] = None
    exact_time: Optional[str] = None
    frequency: Optional[str] = None
    instructions: Optional[str] = None
    purpose: Optional[str] = None
    pill_shape: Optional[str] = None
    pill_color: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    inventory_count: Optional[int] = None
    is_active: Optional[bool] = None

class MedicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_id: int
    name: str
    dosage: str
    time_slot: str
    exact_time: str
    frequency: str
    instructions: Optional[str] = None
    purpose: Optional[str] = None
    pill_shape: Optional[str] = "Round"
    pill_color: Optional[str] = "White"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    inventory_count: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

class SlotGroupedMedications(BaseModel):
    morning: List[MedicationResponse]
    afternoon: List[MedicationResponse]
    evening: List[MedicationResponse]
    night: List[MedicationResponse]
    total_count: int


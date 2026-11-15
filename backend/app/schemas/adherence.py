from datetime import datetime
from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict, Field

class AdherenceLogCreate(BaseModel):
    profile_id: int
    medication_id: int
    status: str = Field(..., pattern="^(taken|skipped)$")
    log_date: Optional[str] = None  # Defaults to today (YYYY-MM-DD)
    time_slot: str = Field(..., pattern="^(morning|afternoon|evening|night)$")
    notes: Optional[str] = None

class AdherenceLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_id: int
    medication_id: int
    logged_by_name: str
    log_date: str
    time_slot: str
    status: str
    logged_at: datetime
    notes: Optional[str] = None

class TodayDoseItem(BaseModel):
    medication_id: int
    name: str
    dosage: str
    time_slot: str
    exact_time: str
    instructions: Optional[str] = None
    purpose: Optional[str] = None
    pill_shape: Optional[str] = "Round"
    pill_color: Optional[str] = "White"
    status: str = "pending"  # 'pending', 'taken', 'skipped'
    log_id: Optional[int] = None
    logged_at: Optional[datetime] = None
    logged_by_name: Optional[str] = None
    notes: Optional[str] = None

class TodayAdherenceSummary(BaseModel):
    date: str
    profile_id: int
    total_doses: int
    taken_count: int
    skipped_count: int
    pending_count: int
    compliance_percentage: int
    slots: Dict[str, List[TodayDoseItem]]

class DayComplianceStat(BaseModel):
    date: str
    day_name: str  # "Mon", "Tue", etc.
    total: int
    taken: int
    skipped: int
    percentage: int

class WeeklyAdherenceHistory(BaseModel):
    profile_id: int
    average_compliance: int
    days: List[DayComplianceStat]

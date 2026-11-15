from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field

class SendTestAlertRequest(BaseModel):
    profile_id: int
    alert_type: str = Field("missed_dose_alert", pattern="^(missed_dose_alert|upcoming_dose_reminder|appointment_reminder)$")
    target_email: Optional[str] = None

class TriggerCheckAlertsRequest(BaseModel):
    profile_id: int

class NotificationLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    profile_id: int
    recipient_email: str
    recipient_name: str
    alert_type: str
    subject: str
    message_content: str
    status: str
    is_read: bool = False
    sent_at: datetime

class UnreadCountResponse(BaseModel):
    unread_count: int

class AlertScanResult(BaseModel):
    profile_id: int
    scanned_at: datetime
    alerts_dispatched: int
    overdue_doses_found: int
    details: List[str]

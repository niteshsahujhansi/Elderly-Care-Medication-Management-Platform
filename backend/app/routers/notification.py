from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_and_profile import User, CareCircleMember, ElderlyProfile
from app.models.medication import Medication
from app.models.adherence import AdherenceLog
from app.models.appointment import Appointment
from app.models.notification import NotificationLog
from app.schemas.notification import (
    SendTestAlertRequest,
    TriggerCheckAlertsRequest,
    NotificationLogResponse,
    AlertScanResult,
    UnreadCountResponse,
)
from app.routers.auth import get_current_user
from app.services.email_service import send_email_notification

router = APIRouter(prefix="/api/notifications", tags=["Proactive Email Reminders & Alerts"])


def verify_circle_membership(
    profile_id: int, user_id: int, db: Session, require_write: bool = False
) -> CareCircleMember:
    """Helper to verify user belongs to the care circle and has write rights if needed."""
    membership = (
        db.query(CareCircleMember)
        .filter(
            CareCircleMember.user_id == user_id,
            CareCircleMember.profile_id == profile_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this elderly person's care circle.",
        )
    if require_write and membership.role_in_circle == "other":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only viewers cannot trigger or scan alert notifications.",
        )
    return membership


@router.post("/test-alert", response_model=NotificationLogResponse)
def send_test_alert(
    payload: SendTestAlertRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    On-demand trigger to test and preview email alert delivery for hackathon judges & caregivers.
    """
    verify_circle_membership(payload.profile_id, current_user.id, db, require_write=True)

    profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    recipient_email = payload.target_email or current_user.email_or_phone
    # If phone was used as identifier, create sample alert email
    if "@" not in recipient_email:
        recipient_email = f"{current_user.name.lower().replace(' ', '')}@demo.care"

    # Fetch context data
    first_med = (
        db.query(Medication)
        .filter(Medication.profile_id == profile.id, Medication.is_active == True)
        .first()
    )
    med_name = first_med.name if first_med else "Metformin"
    dosage = first_med.dosage if first_med else "500 mg"
    instructions = first_med.instructions if first_med else "Take after meal with water"
    time_str = first_med.exact_time if first_med else "08:00 AM"

    first_appt = (
        db.query(Appointment)
        .filter(Appointment.profile_id == profile.id, Appointment.status == "upcoming")
        .first()
    )

    if payload.alert_type == "missed_dose_alert":
        subject = f"🚨 URGENT: Missed Medication Alert for {profile.name} ({med_name})"
    elif payload.alert_type == "upcoming_dose_reminder":
        subject = f"⏰ Medication Reminder: {profile.name}'s Routine ({med_name})"
    else:
        doc = first_appt.doctor_name if first_appt else "Dr. Sarah Adams"
        subject = f"🩺 Doctor Appointment Notice for {profile.name}: {doc}"

    context = {
        "senior_name": profile.name,
        "recipient_name": current_user.name,
        "med_name": med_name,
        "dosage": dosage,
        "time_str": time_str,
        "instructions": instructions,
        "emergency_phone": profile.emergency_phone or profile.primary_phone,
        "slot": first_med.time_slot if first_med else "morning",
        "medications_summary": f"{med_name} ({dosage})",
        "doctor_name": first_appt.doctor_name if first_appt else "Dr. Sarah Adams",
        "specialty": first_appt.specialty if first_appt else "Cardiologist",
        "hospital": first_appt.clinic_or_hospital if first_appt else "City Memorial Hospital",
        "date_str": first_appt.appointment_datetime if first_appt else "Wednesday at 10:30 AM",
        "prep_notes": first_appt.preparation_notes if first_appt else "Fast 8 hours prior",
    }

    send_result = send_email_notification(
        recipient_email=recipient_email,
        subject=subject,
        alert_type=payload.alert_type,
        context=context,
    )

    log_entry = NotificationLog(
        profile_id=profile.id,
        recipient_user_id=current_user.id,
        recipient_email=recipient_email,
        recipient_name=current_user.name,
        alert_type=payload.alert_type,
        subject=subject,
        message_content=send_result["content"],
        status=send_result["status"],
        sent_at=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return NotificationLogResponse.model_validate(log_entry)


@router.post("/scan-alerts", response_model=AlertScanResult)
def scan_and_dispatch_alerts(
    payload: TriggerCheckAlertsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Automated check: Scans today's medication routine and upcoming visits.
    Finds overdue doses (pending) and dispatches alert emails to all subscribed circle members.
    """
    verify_circle_membership(payload.profile_id, current_user.id, db, require_write=True)

    profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # 1. Fetch active medications
    meds = (
        db.query(Medication)
        .filter(Medication.profile_id == profile.id, Medication.is_active == True)
        .all()
    )

    # 2. Fetch today's logged doses
    logs = (
        db.query(AdherenceLog)
        .filter(AdherenceLog.profile_id == profile.id, AdherenceLog.log_date == today_str)
        .all()
    )
    logged_med_ids = {l.medication_id for l in logs}

    # 3. Find pending doses
    pending_meds = [m for m in meds if m.id not in logged_med_ids]

    # 4. Find subscribed circle members (notify_email == True)
    subscribers = (
        db.query(CareCircleMember, User)
        .join(User, CareCircleMember.user_id == User.id)
        .filter(
            CareCircleMember.profile_id == profile.id,
            CareCircleMember.notify_email == True,
        )
        .all()
    )

    alerts_count = 0
    details = []

    for med in pending_meds:
        subject = f"🚨 Overdue Medication Alert: {profile.name} - {med.name} ({med.dosage})"
        context = {
            "senior_name": profile.name,
            "recipient_name": "Caregiver",
            "med_name": med.name,
            "dosage": med.dosage,
            "time_str": med.exact_time,
            "instructions": med.instructions,
            "emergency_phone": profile.emergency_phone,
        }

        for membership, user in subscribers:
            recipient_email = user.email_or_phone
            if "@" not in recipient_email:
                recipient_email = f"{user.name.lower().replace(' ', '')}@demo.care"

            context["recipient_name"] = user.name
            result = send_email_notification(
                recipient_email=recipient_email,
                subject=subject,
                alert_type="missed_dose_alert",
                context=context,
            )

            db.add(
                NotificationLog(
                    profile_id=profile.id,
                    recipient_user_id=user.id,
                    recipient_email=recipient_email,
                    recipient_name=user.name,
                    alert_type="missed_dose_alert",
                    subject=subject,
                    message_content=result["content"],
                    status=result["status"],
                    sent_at=datetime.utcnow(),
                )
            )
            alerts_count += 1
            details.append(f"Dispatched overdue alert for '{med.name}' to {user.name} ({recipient_email})")

    db.commit()

    return AlertScanResult(
        profile_id=profile.id,
        scanned_at=datetime.utcnow(),
        alerts_dispatched=alerts_count,
        overdue_doses_found=len(pending_meds),
        details=details if details else ["All scheduled medications for today are up-to-date or already logged."],
    )


@router.get("/history", response_model=List[NotificationLogResponse])
def get_notification_history(
    profile_id: int = Query(...),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns recent notification and email alert history for the elderly profile.
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    logs = (
        db.query(NotificationLog)
        .filter(NotificationLog.profile_id == profile_id)
        .order_by(NotificationLog.sent_at.desc())
        .limit(limit)
        .all()
    )

    return [NotificationLogResponse.model_validate(l) for l in logs]


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_notification_count(
    profile_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns unread in-app notification count for the active elderly profile.
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    unread_count = (
        db.query(NotificationLog)
        .filter(
            NotificationLog.profile_id == profile_id,
            NotificationLog.is_read == False,
        )
        .count()
    )
    return UnreadCountResponse(unread_count=unread_count)


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Marks a single in-app notification as read.
    """
    log = db.query(NotificationLog).filter(NotificationLog.id == notification_id).first()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    verify_circle_membership(log.profile_id, current_user.id, db, require_write=False)

    log.is_read = True
    db.commit()
    return {"success": True, "message": "Notification marked as read."}


@router.put("/read-all")
def mark_all_notifications_as_read(
    profile_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Marks all notifications for this profile as read.
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    db.query(NotificationLog).filter(
        NotificationLog.profile_id == profile_id,
        NotificationLog.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}


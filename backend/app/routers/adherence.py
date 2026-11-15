from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_and_profile import User, CareCircleMember, ElderlyProfile
from app.models.medication import Medication
from app.models.adherence import AdherenceLog
from app.schemas.adherence import (
    AdherenceLogCreate,
    AdherenceLogResponse,
    TodayDoseItem,
    TodayAdherenceSummary,
    DayComplianceStat,
    WeeklyAdherenceHistory,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/adherence", tags=["Adherence & Real-Time Logging"])


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
            detail="Read-only viewers cannot log or reset medication adherence.",
        )
    return membership


@router.get("/today", response_model=TodayAdherenceSummary)
def get_today_adherence(
    profile_id: int = Query(...),
    target_date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns today's medication routine with real-time adherence state (taken/skipped/pending)
    for each dose, plus overall daily compliance statistics.
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    effective_date = target_date or datetime.utcnow().strftime("%Y-%m-%d")

    # 1. Fetch all active medications for this profile
    meds = (
        db.query(Medication)
        .filter(Medication.profile_id == profile_id, Medication.is_active == True)
        .order_by(Medication.exact_time.asc())
        .all()
    )

    # 2. Fetch logs for this profile on target_date
    logs = (
        db.query(AdherenceLog)
        .filter(
            AdherenceLog.profile_id == profile_id,
            AdherenceLog.log_date == effective_date,
        )
        .all()
    )
    # Map logs by (medication_id, time_slot)
    log_map = {(log.medication_id, log.time_slot): log for log in logs}

    slots = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "night": [],
    }

    taken_count = 0
    skipped_count = 0
    pending_count = 0

    for med in meds:
        slot = med.time_slot if med.time_slot in slots else "morning"
        log = log_map.get((med.id, med.time_slot))

        if log:
            dose_status = log.status
            log_id = log.id
            logged_at = log.logged_at
            logged_by_name = log.logged_by_name
            notes = log.notes
            if dose_status == "taken":
                taken_count += 1
            else:
                skipped_count += 1
        else:
            dose_status = "pending"
            log_id = None
            logged_at = None
            logged_by_name = None
            notes = None
            pending_count += 1

        dose_item = TodayDoseItem(
            medication_id=med.id,
            name=med.name,
            dosage=med.dosage,
            time_slot=med.time_slot,
            exact_time=med.exact_time,
            instructions=med.instructions,
            purpose=med.purpose,
            pill_shape=med.pill_shape or "Round",
            pill_color=med.pill_color or "White",
            status=dose_status,
            log_id=log_id,
            logged_at=logged_at,
            logged_by_name=logged_by_name,
            notes=notes,
        )
        slots[slot].append(dose_item)

    total_doses = len(meds)
    compliance_percentage = (
        round((taken_count / total_doses) * 100) if total_doses > 0 else 100
    )

    return TodayAdherenceSummary(
        date=effective_date,
        profile_id=profile_id,
        total_doses=total_doses,
        taken_count=taken_count,
        skipped_count=skipped_count,
        pending_count=pending_count,
        compliance_percentage=compliance_percentage,
        slots=slots,
    )


@router.post("/log", response_model=AdherenceLogResponse)
def log_adherence_dose(
    payload: AdherenceLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    1-Click logger for doses (taken / skipped).
    Creates or updates the adherence log for the given medication, date, and slot.
    """
    verify_circle_membership(payload.profile_id, current_user.id, db, require_write=True)

    # Verify medication exists and belongs to profile
    medication = (
        db.query(Medication)
        .filter(
            Medication.id == payload.medication_id,
            Medication.profile_id == payload.profile_id,
        )
        .first()
    )
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found for this profile.",
        )

    effective_date = payload.log_date or datetime.utcnow().strftime("%Y-%m-%d")

    # Upsert check
    existing_log = (
        db.query(AdherenceLog)
        .filter(
            AdherenceLog.profile_id == payload.profile_id,
            AdherenceLog.medication_id == payload.medication_id,
            AdherenceLog.log_date == effective_date,
            AdherenceLog.time_slot == payload.time_slot,
        )
        .first()
    )

    if existing_log:
        existing_log.status = payload.status
        existing_log.logged_by_user_id = current_user.id
        existing_log.logged_by_name = current_user.name
        existing_log.logged_at = datetime.utcnow()
        existing_log.notes = payload.notes
        db.commit()
        db.refresh(existing_log)
        return AdherenceLogResponse.model_validate(existing_log)

    new_log = AdherenceLog(
        profile_id=payload.profile_id,
        medication_id=payload.medication_id,
        logged_by_user_id=current_user.id,
        logged_by_name=current_user.name,
        log_date=effective_date,
        time_slot=payload.time_slot,
        status=payload.status,
        logged_at=datetime.utcnow(),
        notes=payload.notes,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return AdherenceLogResponse.model_validate(new_log)


@router.delete("/reset/{log_id}")
def reset_adherence_dose(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reverts a logged dose back to 'pending' state (undo accidental log).
    """
    log = db.query(AdherenceLog).filter(AdherenceLog.id == log_id).first()
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adherence log not found.",
        )

    verify_circle_membership(log.profile_id, current_user.id, db, require_write=True)

    db.delete(log)
    db.commit()
    return {"success": True, "message": "Dose reset to pending successfully."}


@router.get("/history", response_model=WeeklyAdherenceHistory)
def get_adherence_history(
    profile_id: int = Query(...),
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns adherence compliance history for the last N days (defaults to 7 days).
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    meds_count = (
        db.query(Medication)
        .filter(Medication.profile_id == profile_id, Medication.is_active == True)
        .count()
    )

    today = datetime.utcnow().date()
    day_stats: List[DayComplianceStat] = []
    total_percentage_sum = 0

    for i in range(days - 1, -1, -1):
        target_d = today - timedelta(days=i)
        date_str = target_d.strftime("%Y-%m-%d")
        day_name = target_d.strftime("%a")

        logs = (
            db.query(AdherenceLog)
            .filter(
                AdherenceLog.profile_id == profile_id,
                AdherenceLog.log_date == date_str,
            )
            .all()
        )

        taken_count = sum(1 for l in logs if l.status == "taken")
        skipped_count = sum(1 for l in logs if l.status == "skipped")
        total_doses = max(meds_count, len(logs))

        pct = round((taken_count / total_doses) * 100) if total_doses > 0 else 100
        total_percentage_sum += pct

        day_stats.append(
            DayComplianceStat(
                date=date_str,
                day_name=day_name,
                total=total_doses,
                taken=taken_count,
                skipped=skipped_count,
                percentage=pct,
            )
        )

    avg_compliance = round(total_percentage_sum / len(day_stats)) if day_stats else 100

    return WeeklyAdherenceHistory(
        profile_id=profile_id,
        average_compliance=avg_compliance,
        days=day_stats,
    )

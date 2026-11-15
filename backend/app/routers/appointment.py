from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_and_profile import User, CareCircleMember, ElderlyProfile
from app.models.appointment import Appointment
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentListSummary,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/appointments", tags=["Medical Appointments Management"])


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
            detail="Read-only viewers cannot create, edit, or delete appointments.",
        )
    return membership


@router.get("", response_model=List[AppointmentResponse])
def get_appointments(
    profile_id: int = Query(...),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves appointments for the specified elderly profile.
    Can be filtered by status (upcoming, completed, cancelled).
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    query = db.query(Appointment).filter(Appointment.profile_id == profile_id)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Appointment.status == status_filter.lower())

    if status_filter == "upcoming":
        query = query.order_by(Appointment.appointment_datetime.asc())
    else:
        query = query.order_by(Appointment.appointment_datetime.desc())

    appointments = query.all()
    return [AppointmentResponse.model_validate(a) for a in appointments]


@router.get("/summary", response_model=AppointmentListSummary)
def get_appointments_summary(
    profile_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves appointments partitioned into Upcoming and Past/Completed for clean dashboard rendering.
    """
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    upcoming_apps = (
        db.query(Appointment)
        .filter(
            Appointment.profile_id == profile_id,
            Appointment.status == "upcoming",
        )
        .order_by(Appointment.appointment_datetime.asc())
        .all()
    )

    past_apps = (
        db.query(Appointment)
        .filter(
            Appointment.profile_id == profile_id,
            Appointment.status.in_(["completed", "cancelled"]),
        )
        .order_by(Appointment.appointment_datetime.desc())
        .all()
    )

    return AppointmentListSummary(
        upcoming=[AppointmentResponse.model_validate(a) for a in upcoming_apps],
        past_or_completed=[AppointmentResponse.model_validate(a) for a in past_apps],
        total_upcoming=len(upcoming_apps),
    )


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Schedules a new doctor appointment for an elderly profile.
    """
    verify_circle_membership(payload.profile_id, current_user.id, db, require_write=True)

    # Verify profile exists
    profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == payload.profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Elderly profile not found.",
        )

    new_appointment = Appointment(
        profile_id=payload.profile_id,
        scheduled_by_user_id=current_user.id,
        scheduled_by_name=current_user.name,
        doctor_name=payload.doctor_name,
        specialty=payload.specialty,
        clinic_or_hospital=payload.clinic_or_hospital,
        appointment_datetime=payload.appointment_datetime,
        contact_phone=payload.contact_phone,
        purpose_or_reason=payload.purpose_or_reason,
        preparation_notes=payload.preparation_notes,
        status="upcoming",
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return AppointmentResponse.model_validate(new_appointment)


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment_by_id(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Gets single appointment details.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    verify_circle_membership(appointment.profile_id, current_user.id, db, require_write=False)
    return AppointmentResponse.model_validate(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Updates appointment details or marks status (upcoming, completed, cancelled).
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    verify_circle_membership(appointment.profile_id, current_user.id, db, require_write=True)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)
    return AppointmentResponse.model_validate(appointment)


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes an appointment permanently.
    """
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found.",
        )

    verify_circle_membership(appointment.profile_id, current_user.id, db, require_write=True)

    db.delete(appointment)
    db.commit()
    return {"success": True, "message": "Appointment deleted successfully."}

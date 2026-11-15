from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_and_profile import User, CareCircleMember, ElderlyProfile
from app.models.medication import Medication
from app.schemas.medication import (
    MedicationCreate,
    MedicationUpdate,
    MedicationResponse,
    SlotGroupedMedications,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/medications", tags=["Medications Management"])


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
            detail="Read-only viewers cannot add, edit, or delete medications.",
        )
    return membership


@router.get("", response_model=List[MedicationResponse])
def get_medications(
    profile_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)
    
    meds = (
        db.query(Medication)
        .filter(Medication.profile_id == profile_id, Medication.is_active == True)
        .order_by(Medication.exact_time.asc())
        .all()
    )
    return [MedicationResponse.model_validate(m) for m in meds]


@router.get("/grouped", response_model=SlotGroupedMedications)
def get_grouped_medications(
    profile_id: int = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_circle_membership(profile_id, current_user.id, db, require_write=False)

    meds = (
        db.query(Medication)
        .filter(Medication.profile_id == profile_id, Medication.is_active == True)
        .order_by(Medication.exact_time.asc())
        .all()
    )

    grouped = {
        "morning": [],
        "afternoon": [],
        "evening": [],
        "night": [],
    }

    for m in meds:
        slot = m.time_slot.lower()
        if slot in grouped:
            grouped[slot].append(MedicationResponse.model_validate(m))
        else:
            grouped["morning"].append(MedicationResponse.model_validate(m))

    return SlotGroupedMedications(
        morning=grouped["morning"],
        afternoon=grouped["afternoon"],
        evening=grouped["evening"],
        night=grouped["night"],
        total_count=len(meds),
    )


@router.post("", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(
    req: MedicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_circle_membership(req.profile_id, current_user.id, db, require_write=True)

    new_med = Medication(
        profile_id=req.profile_id,
        name=req.name.strip(),
        dosage=req.dosage.strip(),
        time_slot=req.time_slot.lower(),
        exact_time=req.exact_time or "08:00",
        frequency=req.frequency or "daily",
        instructions=req.instructions,
        purpose=req.purpose,
        pill_shape=req.pill_shape or "Round",
        pill_color=req.pill_color or "White",
        start_date=req.start_date,
        end_date=req.end_date,
        inventory_count=req.inventory_count,
        is_active=True,
    )
    db.add(new_med)
    db.commit()
    db.refresh(new_med)
    return MedicationResponse.model_validate(new_med)


@router.get("/{medication_id}", response_model=MedicationResponse)
def get_medication_detail(
    medication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    verify_circle_membership(med.profile_id, current_user.id, db, require_write=False)
    return MedicationResponse.model_validate(med)


@router.put("/{medication_id}", response_model=MedicationResponse)
def update_medication(
    medication_id: int,
    req: MedicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    verify_circle_membership(med.profile_id, current_user.id, db, require_write=True)

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(med, field) and value is not None:
            if field == "time_slot":
                value = value.lower()
            setattr(med, field, value)

    db.commit()
    db.refresh(med)
    return MedicationResponse.model_validate(med)


@router.delete("/{medication_id}")
def delete_medication(
    medication_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    med = db.query(Medication).filter(Medication.id == medication_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")

    verify_circle_membership(med.profile_id, current_user.id, db, require_write=True)

    db.delete(med)
    db.commit()
    return {"success": True, "message": f"Medication '{med.name}' was removed."}


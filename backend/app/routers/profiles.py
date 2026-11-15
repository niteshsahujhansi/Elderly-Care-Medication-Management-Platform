import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user_and_profile import User, ElderlyProfile, CareCircleMember
from app.schemas.auth_and_profile import (
    ElderlyProfileCreate,
    ElderlyProfileUpdate,
    ElderlyProfileResponse,
    JoinCareCircleRequest,
    AccessibleProfileSummary,
    CircleMemberDetail,
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/profiles", tags=["Elderly Profiles & Care Circles"])


def generate_unique_circle_code(db: Session) -> str:
    """Generates a unique 6-digit numeric circle code."""
    for _ in range(100):
        code = str(random.randint(100000, 999999))
        existing = db.query(ElderlyProfile).filter(ElderlyProfile.circle_code == code).first()
        if not existing:
            return code
    raise HTTPException(status_code=500, detail="Unable to generate unique circle code")


@router.post("", response_model=ElderlyProfileResponse, status_code=status.HTTP_201_CREATED)
def create_elderly_profile(
    req: ElderlyProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    code = generate_unique_circle_code(db)

    profile = ElderlyProfile(
        circle_code=code,
        name=req.name.strip(),
        date_of_birth=req.date_of_birth,
        age=req.age,
        gender=req.gender,
        blood_group=req.blood_group,
        primary_phone=req.primary_phone,
        emergency_phone=req.emergency_phone,
        emergency_contact_name=req.emergency_contact_name,
        primary_physician_name=req.primary_physician_name,
        primary_physician_phone=req.primary_physician_phone,
        hospital_preference=req.hospital_preference,
        allergies=req.allergies,
        chronic_conditions=req.chronic_conditions,
        dietary_restrictions=req.dietary_restrictions,
        mobility_status=req.mobility_status,
        preferred_language=req.preferred_language or "English",
        room_or_address=req.room_or_address,
        insurance_provider=req.insurance_provider,
        insurance_policy_number=req.insurance_policy_number,
        special_care_instructions=req.special_care_instructions,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # Automatically connect the creator to the care circle
    creator_membership = CareCircleMember(
        user_id=current_user.id,
        profile_id=profile.id,
        role_in_circle=req.role_in_circle or current_user.default_role or "family",
        notify_email=True,
    )
    db.add(creator_membership)
    db.commit()

    return ElderlyProfileResponse.model_validate(profile)


@router.get("/my", response_model=List[AccessibleProfileSummary])
def get_my_accessible_profiles(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all elderly profiles the logged-in user has access to."""
    memberships = (
        db.query(CareCircleMember)
        .filter(CareCircleMember.user_id == current_user.id)
        .all()
    )

    results = []
    for m in memberships:
        p = m.profile
        if p:
            results.append(
                AccessibleProfileSummary(
                    profile_id=p.id,
                    circle_code=p.circle_code,
                    name=p.name,
                    age=p.age,
                    gender=p.gender,
                    blood_group=p.blood_group,
                    role_in_circle=m.role_in_circle,
                    notify_email=m.notify_email,
                )
            )
    return results


@router.post("/join")
def join_care_circle(
    req: JoinCareCircleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Joins an elderly profile's care circle using the 6-digit circle code."""
    code = req.circle_code.strip()
    profile = db.query(ElderlyProfile).filter(ElderlyProfile.circle_code == code).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No care circle found with 6-digit code '{code}'. Please verify the code.",
        )

    existing_member = (
        db.query(CareCircleMember)
        .filter(
            CareCircleMember.user_id == current_user.id,
            CareCircleMember.profile_id == profile.id,
        )
        .first()
    )
    if existing_member:
        # Update role if changed
        existing_member.role_in_circle = req.role_in_circle
        db.commit()
        return {
            "success": True,
            "message": f"Updated role in {profile.name}'s care circle to '{req.role_in_circle}'",
            "profile": {
                "profile_id": profile.id,
                "circle_code": profile.circle_code,
                "name": profile.name,
                "role_in_circle": req.role_in_circle,
            },
        }

    new_member = CareCircleMember(
        user_id=current_user.id,
        profile_id=profile.id,
        role_in_circle=req.role_in_circle,
        notify_email=True,
    )
    db.add(new_member)
    db.commit()

    return {
        "success": True,
        "message": f"Successfully joined {profile.name}'s care circle as '{req.role_in_circle}'",
        "profile": {
            "profile_id": profile.id,
            "circle_code": profile.circle_code,
            "name": profile.name,
            "role_in_circle": req.role_in_circle,
        },
    }


@router.get("/{profile_id}", response_model=ElderlyProfileResponse)
def get_profile_details(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify authorization
    membership = (
        db.query(CareCircleMember)
        .filter(
            CareCircleMember.user_id == current_user.id,
            CareCircleMember.profile_id == profile_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this elderly person's care circle.",
        )

    profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return ElderlyProfileResponse.model_validate(profile)


@router.put("/{profile_id}", response_model=ElderlyProfileResponse)
def update_profile(
    profile_id: int,
    req: ElderlyProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify authorization
    membership = (
        db.query(CareCircleMember)
        .filter(
            CareCircleMember.user_id == current_user.id,
            CareCircleMember.profile_id == profile_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this care circle.",
        )
    if membership.role_in_circle == "other":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Read-only viewers cannot update the elderly profile.",
        )

    profile = db.query(ElderlyProfile).filter(ElderlyProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(profile, field) and value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ElderlyProfileResponse.model_validate(profile)


@router.get("/{profile_id}/members", response_model=List[CircleMemberDetail])
def get_circle_members(
    profile_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Verify authorization
    membership = (
        db.query(CareCircleMember)
        .filter(
            CareCircleMember.user_id == current_user.id,
            CareCircleMember.profile_id == profile_id,
        )
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this care circle.",
        )

    members = (
        db.query(CareCircleMember)
        .filter(CareCircleMember.profile_id == profile_id)
        .all()
    )

    results = []
    for m in members:
        u = m.user
        if u:
            results.append(
                CircleMemberDetail(
                    user_id=u.id,
                    name=u.name,
                    email_or_phone=u.email_or_phone,
                    role_in_circle=m.role_in_circle,
                    notify_email=m.notify_email,
                    joined_at=m.joined_at,
                )
            )
    return results

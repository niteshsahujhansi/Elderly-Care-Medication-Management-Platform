import hashlib
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.database import get_db
from app.models.user_and_profile import User
from app.schemas.auth_and_profile import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthTokenResponse,
)

SECRET_KEY = "elderly-care-hackathon-secret-jwt-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_passcode(pin: str) -> str:
    return hashlib.sha256(pin.strip().encode()).hexdigest()

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> User:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
            )
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signup(req: UserSignupRequest, db: Session = Depends(get_db)):
    identifier = req.email_or_phone.strip().lower()
    existing_user = db.query(User).filter(User.email_or_phone == identifier).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email or phone already exists.",
        )
    
    new_user = User(
        name=req.name.strip(),
        email_or_phone=identifier,
        passcode=hash_passcode(req.passcode),
        default_role=req.default_role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "name": new_user.name})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    identifier = req.email_or_phone.strip().lower()
    hashed = hash_passcode(req.passcode)

    user = (
        db.query(User)
        .filter(User.email_or_phone == identifier, User.passcode == hashed)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or 6-digit passcode.",
        )

    token = create_access_token({"sub": str(user.id), "name": user.name})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.post("/demo-login/{persona}", response_model=AuthTokenResponse)
def demo_login(persona: str, db: Session = Depends(get_db)):
    persona_map = {
        "grandpa": "robert@demo.care",
        "sarah": "sarah@demo.care",
        "elena": "elena@demo.care",
        "tom": "tom@demo.care",
    }
    target_email = persona_map.get(persona.lower())
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown demo persona '{persona}'. Options: grandpa, sarah, elena, tom",
        )
    
    user = db.query(User).filter(User.email_or_phone == target_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo user not found. Please run the seeder script first.",
        )
    
    token = create_access_token({"sub": str(user.id), "name": user.name})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

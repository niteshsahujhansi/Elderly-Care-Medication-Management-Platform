import sys
import os

# Ensure the backend directory is in the Python search path so 'import app...' always works
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models.user_and_profile import User, ElderlyProfile, CareCircleMember
from app.models.medication import Medication
from app.models.adherence import AdherenceLog
from app.models.appointment import Appointment
from app.models.notification import NotificationLog
from app.routers import (
    auth_router,
    profiles_router,
    medications_router,
    adherence_router,
    appointment_router,
    notification_router,
)
from app.utils.seeder import seed_database

# Initialize database tables and auto-seed demo data if fresh deployment
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Startup seeder notice: {e}")

app = FastAPI(
    title="Elderly Care & Medication Management Platform API",
    version="1.0.0",
    description="Backend API for elderly healthcare management, medication tracking, and care circle collaboration.",
)

# Resilient URL normalization middleware (handles accidental double slashes or missing /api prefix)
@app.middleware("http")
async def normalize_api_path(request, call_next):
    path = request.url.path
    if path.startswith("//"):
        path = "/" + path.lstrip("/")
        request.scope["path"] = path

    known_prefixes = ("/auth", "/profiles", "/medications", "/adherence", "/appointments", "/notifications")
    if any(path.startswith(p) for p in known_prefixes):
        request.scope["path"] = f"/api{path}"

    response = await call_next(request)
    return response

# CORS Middleware (Permissive for local development & Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(medications_router)
app.include_router(adherence_router)
app.include_router(appointment_router)
app.include_router(notification_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to the Elderly Care & Medication Management Platform API",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Elderly Care API",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

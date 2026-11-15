from app.routers.auth import router as auth_router
from app.routers.profiles import router as profiles_router
from app.routers.medications import router as medications_router
from app.routers.adherence import router as adherence_router
from app.routers.appointment import router as appointment_router
from app.routers.notification import router as notification_router

__all__ = [
    "auth_router",
    "profiles_router",
    "medications_router",
    "adherence_router",
    "appointment_router",
    "notification_router",
]

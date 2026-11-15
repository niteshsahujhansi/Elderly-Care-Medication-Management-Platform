from app.routers.auth import router as auth_router
from app.routers.profiles import router as profiles_router
from app.routers.medications import router as medications_router

__all__ = ["auth_router", "profiles_router", "medications_router"]

from fastapi import APIRouter

from app.api.v1 import admin, auth, courses, enrollments, progress, quizzes, users

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentification"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
api_v1_router.include_router(courses.router, prefix="/courses", tags=["Formations"])
api_v1_router.include_router(
    enrollments.router, prefix="/enrollments", tags=["Inscriptions"]
)
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Progression"])
api_v1_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quiz"])
api_v1_router.include_router(admin.router, prefix="/admin", tags=["Administration"])

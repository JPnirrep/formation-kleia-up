from fastapi import APIRouter

from app.api.v1 import (
    admin,
    admin_resource,
    admin_stats,
    admin_video,
    auth,
    certificates,
    courses,
    enrollments,
    progress,
    quizzes,
    uploads,
    users,
    videos,
    resources,
    badges,
    journal,
)

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentification"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
api_v1_router.include_router(courses.router, prefix="/courses", tags=["Formations"])
api_v1_router.include_router(
    enrollments.router, prefix="/enrollments", tags=["Inscriptions"]
)
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Progression"])
api_v1_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quiz"])
api_v1_router.include_router(
    certificates.router, prefix="/certificates", tags=["Certificats"]
)
api_v1_router.include_router(
    videos.router, prefix="/videos", tags=["Vidéos (apprenant)"]
)
api_v1_router.include_router(
    resources.router, prefix="/resources", tags=["Ressources (apprenant)"]
)
api_v1_router.include_router(
    badges.router, prefix="/badges", tags=["Badges (apprenant)"]
)
api_v1_router.include_router(
    journal.router, prefix="/journal", tags=["Journal (apprenant)"]
)
api_v1_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_v1_router.include_router(
    admin_video.router, prefix="/admin", tags=["Administration"]
)
api_v1_router.include_router(
    admin_stats.router, prefix="/admin", tags=["Administration"]
)
api_v1_router.include_router(
    admin_resource.router, prefix="/admin", tags=["Administration"]
)
api_v1_router.include_router(uploads.router, prefix="", tags=["Fichiers"])

from fastapi import APIRouter


from app.api.v1 import brevo
from app.api.v1 import (
    admin,
    admin_quiz,
    admin_resource,
    admin_stats,
    admin_video,
    ai,
    auth,
    badges,
    certificates,
    courses,
    enrollments,
    gamification,
    journal,
    progress,
    quizzes,
    uploads,
    users,
    videos,
    resources,
)

# lessons_router is defined in resources.py alongside the resources router
from app.api.v1.resources import lessons_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentification"])
api_v1_router.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
api_v1_router.include_router(courses.router, prefix="/courses", tags=["Formations"])
api_v1_router.include_router(
    lessons_router, prefix="/lessons", tags=["Leçons"]
)
api_v1_router.include_router(
    enrollments.router, prefix="/enrollments", tags=["Inscriptions"]
)
api_v1_router.include_router(progress.router, prefix="/progress", tags=["Progression"])
api_v1_router.include_router(
    gamification.router, prefix="/gamification", tags=["Gamification"]
)
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
api_v1_router.include_router(
    ai.router, prefix="/ai", tags=["IA"]
)
api_v1_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_v1_router.include_router(
    admin_quiz.router, prefix="/admin", tags=["Administration"]
)
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

api_v1_router.include_router(brevo.router, prefix="/brevo", tags=["Brevo"])

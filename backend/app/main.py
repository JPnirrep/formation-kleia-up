from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "https://formation.kleia-up.fr",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(401)
    async def unauthorized_handler(request: Request, exc):
        return JSONResponse(
            status_code=401,
            content={"detail": "Non authentifié. Veuillez vous connecter."},
        )

    @app.exception_handler(403)
    async def forbidden_handler(request: Request, exc):
        return JSONResponse(
            status_code=403,
            content={"detail": "Accès refusé. Vous n'avez pas les droits nécessaires."},
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return JSONResponse(
            status_code=404,
            content={"detail": "Ressource non trouvée."},
        )

    @app.exception_handler(422)
    async def validation_handler(request: Request, exc):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors() if hasattr(exc, "errors") else str(exc)},
        )

    @app.exception_handler(500)
    async def internal_handler(request: Request, exc):
        return JSONResponse(
            status_code=500,
            content={"detail": "Erreur interne du serveur."},
        )

    @app.get("/api/health")
    async def health_check():
        return {
            "status": "ok",
            "version": settings.VERSION,
            "timestamp": datetime.utcnow().isoformat(),
        }

    # Import et enregistrement des routers
    from app.api.v1.router import api_v1_router

    app.include_router(api_v1_router)

    return app


app = create_app()

from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from typing import override

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class ForceCorsMiddleware(BaseHTTPMiddleware):
    """Middleware qui garantit les headers CORS sur TOUTES les reponses, meme les erreurs."""

    @override
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.method == "OPTIONS":
            response = Response(status_code=200)
        else:
            response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response


def create_app() -> FastAPI:
    if settings.JWT_SECRET == "" or settings.JWT_SECRET == "change-me-in-production":
        import warnings

        warnings.warn(
            "\u26a0\ufe0f JWT_SECRET not configured! Using default insecure key.",
            RuntimeWarning,
        )

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Middleware CORS forcé en premier (le plus externe)
    app.add_middleware(ForceCorsMiddleware)

    # Double couche : CORSMiddleware standard pour les réponses normales
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Les decorateurs FastAPI enregistrent ces fonctions aupres du routeur,
    # donc Pyright ne les voit pas comme "accedees" — on ignore ce faux positif.

    @app.exception_handler(401)
    async def unauthorized_handler(_request: Request, _exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        return JSONResponse(
            status_code=401,
            content={"detail": "Non authentifié. Veuillez vous connecter."},
        )

    @app.exception_handler(403)
    async def forbidden_handler(_request: Request, _exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        return JSONResponse(
            status_code=403,
            content={"detail": "Accès refusé. Vous n'avez pas les droits nécessaires."},
        )

    @app.exception_handler(404)
    async def not_found_handler(_request: Request, _exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        return JSONResponse(
            status_code=404,
            content={"detail": "Ressource non trouvée."},
        )

    @app.exception_handler(422)
    async def validation_handler(  # pyright: ignore[reportUnusedFunction]
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
        )

    @app.exception_handler(500)
    async def internal_handler(_request: Request, _exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        return JSONResponse(
            status_code=500,
            content={"detail": "Erreur interne du serveur."},
        )

    @app.get("/api/health")
    async def health_check() -> dict[str, str]:  # pyright: ignore[reportUnusedFunction]
        return {
            "status": "ok",
            "version": settings.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Import et enregistrement des routers
    from app.api.v1.router import api_v1_router

    app.include_router(api_v1_router)

    return app


app = create_app()

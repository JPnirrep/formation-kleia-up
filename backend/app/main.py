from collections.abc import Awaitable, Callable
from datetime import datetime, timezone
from typing import override

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from sqlalchemy.exc import IntegrityError


import os


ALLOWED_CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,https://formation.kleia-up.fr",
).split(",")


class ForceCorsMiddleware(BaseHTTPMiddleware):
    """Middleware CORS — ajoute les headers sur TOUTES les réponses."""

    @override
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.method == "OPTIONS":
            response = Response(status_code=200)
        else:
            response = await call_next(request)

        origin = request.headers.get("origin", "")
        if origin in ALLOWED_CORS_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            # Fallback: first allowed origin
            response.headers["Access-Control-Allow-Origin"] = ALLOWED_CORS_ORIGINS[0]

        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        )
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"
        return response


def create_app() -> FastAPI:
    if settings.JWT_SECRET in ("", "change-me-in-production", "your-secret-key"):
        raise RuntimeError(
            "JWT_SECRET is not configured! Set a strong random secret in .env.\n"
            "Generate with: python3 -c \"import secrets; print(secrets.token_hex(32))\""
        )

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # Middleware CORS forcé (gère toutes les réponses, y compris les erreurs)
    app.add_middleware(ForceCorsMiddleware)

    @app.get("/api/health")
    async def health_check() -> dict[str, str]:  # pyright: ignore[reportUnusedFunction]
        return {
            "status": "ok",
            "version": settings.VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Redirection /docs → /api/docs (hors middleware pour éviter le bug 500)
    @app.get("/docs", include_in_schema=False)
    async def docs_redirect():  # pyright: ignore[reportUnusedFunction]
        return RedirectResponse(url="/api/docs")

    @app.get("/openapi.json", include_in_schema=False)
    async def openapi_redirect():  # pyright: ignore[reportUnusedFunction]
        return RedirectResponse(url="/api/openapi.json")

    # Exception handlers
    @app.exception_handler(401)
    @app.exception_handler(401)
    async def unauthorized_handler(_request: Request, exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        detail = (
            getattr(exc, "detail", "Non authentifié. Veuillez vous connecter.")
            if hasattr(exc, "detail")
            else "Non authentifié. Veuillez vous connecter."
        )
        return JSONResponse(
            status_code=401,
            content={"detail": detail},
        )

    @app.exception_handler(403)
    async def forbidden_handler(_request: Request, exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        detail = (
            getattr(exc, "detail", "Accès refusé.")
            if hasattr(exc, "detail")
            else "Accès refusé."
        )
        return JSONResponse(
            status_code=403,
            content={"detail": detail},
        )

    @app.exception_handler(404)
    async def not_found_handler(_request: Request, exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        detail = (
            getattr(exc, "detail", "Ressource non trouvée.")
            if hasattr(exc, "detail")
            else "Ressource non trouvée."
        )
        return JSONResponse(
            status_code=404,
            content={"detail": detail},
        )

    @app.exception_handler(422)
    async def validation_handler(  # pyright: ignore[reportUnusedFunction]
        _request: Request, exc: RequestValidationError | HTTPException
    ) -> JSONResponse:
        detail = exc.errors() if hasattr(exc, "errors") else {"msg": str(exc.detail)}
        return JSONResponse(
            status_code=422,
            content={"detail": detail},
        )

    @app.exception_handler(500)
    async def internal_handler(_request: Request, _exc: Exception) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        return JSONResponse(
            status_code=500,
            content={"detail": "Erreur interne du serveur."},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_handler(_request: Request, _exc: IntegrityError) -> JSONResponse:  # pyright: ignore[reportUnusedFunction]
        """Convertit les violations UNIQUE en 409 Conflict."""
        return JSONResponse(
            status_code=409,
            content={"detail": "Cette opération viole une contrainte d'unicité (doublon)."},
        )

    # Import et enregistrement des routers
    from app.api.v1.router import api_v1_router

    app.include_router(api_v1_router)

    return app


app = create_app()

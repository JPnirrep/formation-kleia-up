# CHANGELOG_AGENT — Actions des agents

## [2026-05-11] Phase 0 — Fondations
- Structure du projet, contrats (AGENT.md, SYSTEM_CONTRACT.md, DoD)
- ADR 001 : Stack technique
- Docker Compose, Nginx, CI/CD
- React/Vite/Tailwind + design system Kleia-up
- Maquette 7 pages mockup

## [2026-05-11] Phase 1 — Backend & API
- FastAPI + SQLAlchemy 2.0 async (14 modèles, 32 endpoints)
- Auth JWT + Google OAuth + RBAC
- Alembic migrations, SQLite dev local

## [2026-05-11] Phase 2 — Connexion Frontend ↔ Backend
- API layer frontend (fetch JWT, 7 modules)
- Hook useApi générique, AuthContext
- Pages connectées : Catalogue, Détail formation, Dashboard, Login
- Proxy Vite /api/* → :8000 (zero CORS)
- Seed data : 4 formations, 2 users, 13 modules

## [2026-05-11] Audit V1 — 17 corrections critiques
- Backend : progress.py crash, password None, quiz nullslast()/endpoints
- Frontend : type errors, CourseCard HTML, quiz types, 404 page
- Infra : Docker build path, Nginx service, CI/CD migration

## [2026-05-11] Audit V2 — 13 corrections sécurité + UX
- Backend : refresh token, rate limiting auth, dead code
- Frontend : ProtectedRoute, ErrorBoundary, AbortController, Profile API
- Utils partagés, hardcoded colors → theme tokens

## [2025-07-14] Audit V4 — Full-stack project audit + corrections infrastructure
- Audit complet du projet : adhérence stack, dépendances, Docker, environnement
- `Dockerfile.backend` : installation depuis `pyproject.toml` (source unique de vérité) au lieu de `requirements.txt`
- `Dockerfile.backend` : ajout `HEALTHCHECK` via `/api/health`
- `Dockerfile.frontend` : `HEALTHCHECK` déjà présent, validé
- `docker-compose.yml` : toutes les conditions `depends_on` passées de `service_started` à `service_healthy`
- `docker-compose.yml` : consolidation du `env_file` db/backend vers un unique `./deploy/.env`
- `deploy/.env.example` : template documenté avec toutes les variables requises
- `backend/app/main.py` : 30 warnings Pyright corrigés (annotations de type, `@override`, `RequestValidationError`, directives `pyright: ignore`)
- Chaîne de démarrage garantie : db (healthy) → backend (healthy) → frontend (healthy) → nginx

## [2026-05-11] Audit V3 — 13 corrections qualité + pagination
- Backend : pagination users/enrollments, UUID Create schemas
- Frontend : AdminDashboard API, boutons fonctionnels, mark complete API
- Imports @/ alias, dead code cleanup

## Leçons apprises → LESSONS.md
14 patterns de bugs documentés pour ne plus les reproduire.

## Point de reprise — 2026-05-11 17:15
- 110+ fichiers, 6 commits
- 43 anomalies corrigées sur 139 détectées
- Plateforme opérationnelle sur localhost:5173 et :8000
- Mot de code : "agora go"
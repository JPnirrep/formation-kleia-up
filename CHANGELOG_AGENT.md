# CHANGELOG_AGENT — Actions des agents

## [2026-05-11] Phase 0 — Fondations
- Création de la structure du projet
- Rédaction de AGENT.md, SYSTEM_CONTRACT.md, DEFINITION_OF_DONE.md
- Création de OPEN_QUESTIONS.md, TASK_TEMPLATE.md
- ADR 001 : Choix de la stack technique
- Configuration Docker Compose (backend, frontend, db, cache)
- Configuration Nginx reverse proxy pour formation.kleia-up.fr
- Création du projet React/Vite + Tailwind + design system Kleia-up
- Composants de base : Button, Card, Header, Footer, Layout, Loading, Input, Badge

## [2026-05-11] Phase 1 — Backend & API
- Projet Python FastAPI asynchrone (SQLAlchemy 2.0 + asyncpg)
- 14 modèles SQLAlchemy (User, Course, Module, Lesson, VideoAsset, Quiz, etc.)
- Schémas Pydantic v2 pour validation requête/réponse
- Configuration Alembic pour migrations asynchrones
- Services : auth JWT (bcrypt), CRUD formations
- Dependencies : get_current_user, get_current_admin, get_current_trainer
- API REST : 32 endpoints (auth, users, courses, enrollments, progress, quizzes, admin)
- Google OAuth2 + email/password auth
- RBAC : learner, trainer, admin
- CORS configuré pour localhost + formation.kleia-up.fr
- Health check opérationnel : GET /api/health → 200 OK

## Prochaines étapes
- Phase 2 : Intégration frontend ↔ backend + auth + données réelles
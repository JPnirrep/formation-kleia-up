# AGORA — Point d'étape Phase 0

**Date :** 2026-05-11
**Projet :** Plateforme formations Kleia-up (formation.kleia-up.fr)
**Stack :** FastAPI + React/Vite + PostgreSQL 15 + Redis 7 + Docker

---

## ✅ Terminé (Phase 0 — Fondations)

... (existing content)...

---

## ✅ Terminé (Phase 1 — Backend & Domaine)

### Backend Python — FastAPI + SQLAlchemy 2.0
- Projet Python structuré (`pyproject.toml`, `requirements.txt`)
- Config via Pydantic Settings (DB, JWT, OAuth, S3, Redis)
- Base de données asynchrone (asyncpg + SQLAlchemy async)
- 14 tables SQLAlchemy (toutes les entités du domaine)
- Schémas Pydantic v2 pour validation (Create, Update, Read)
- Migration Alembic configurée (async)

### API REST — 32 endpoints
| Groupe | Endpoints | Description |
|---|---|---|
| Auth | 4 | Google OAuth, login, register, profil |
| Users | 3 | CRUD utilisateurs (admin) |
| Courses | 4 | Catalogue, détail, modules, leçons |
| Enrollments | 2 | Inscriptions (my + admin grant) |
| Progress | 3 | Progression cours, leçon, vidéo |
| Quizzes | 3 | Quiz, tentative, historique |
| Admin | 10 | CRUD formations/modules/leçons/quiz |
| Health | 1 | Health check |

### Services & Sécurité
- JWT access + refresh tokens
- Google OAuth2 verification
- RBAC (learner, trainer, admin)
- Hachage bcrypt des mots de passe
- CORS configuré (localhost + formation.kleia-up.fr)

---

## 🔜 Prochaine étape (Phase 2 — Frontend intégration)
- Connecter le frontend React à l'API backend
- Authentification Google OAuth côté frontend
- Remplacer les données mock par les vraies données API

### Tickets à exécuter
1. **Ticket 2** — Modèle de données SQLAlchemy + migrations Alembic
   - Entités : User, Course, Module, Lesson, VideoAsset, Quiz, Question, Attempt, Enrollment, Progress, Certificate
2. **Ticket 3** — Authentification Google OAuth2 + JWT + RBAC (learner/trainer/admin)
3. **Ticket 5** — Back-office API CRUD (formations, modules, leçons, quiz)
4. **Ticket 4** — API catalogue exposée (GET formations, détail)

---

## 🚀 Pour reprendre le travail

```bash
# 1. Démarrer le frontend
cd ~/Documents/GitHub/formation-kleia-up/frontend
npm run dev
# → http://localhost:5173

# 2. Lire les specs avant de coder
less spec/domain/ENTITIES.md
less spec/domain/RULES.md
less spec/domain/STATES.md

# 3. Consulter les décisions
cat adr/001-stack-choice.md
cat AGENT.md

# 4. Questions ouvertes
cat OPEN_QUESTIONS.md
```

---

## 📦 URLs du projet
| Ressource | URL |
|---|---|
| Dev local | http://localhost:5173 |
| Plateforme (prod) | https://formation.kleia-up.fr |
| Site vitrine | https://kleia-up.fr |
| VPS OVH | 135.125.53.215 |
| Repo GitHub | https://github.com/JP/formation-kleia-up |

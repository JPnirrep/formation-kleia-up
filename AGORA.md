# AGORA — Point d'étape Phase 0

**Date :** 2026-05-11
**Projet :** Plateforme formations Kleia-up (formation.kleia-up.fr)
**Stack :** FastAPI + React/Vite + PostgreSQL 15 + Redis 7 + Docker

---

## ✅ Terminé (Phase 0 — Fondations)

### Structuration
- Structure repo complète (`/spec`, `/adr`, `/deploy`)
- Contrats agents : `AGENT.md`, `SYSTEM_CONTRACT.md`, `DEFINITION_OF_DONE.md`
- Template tickets : `TASK_TEMPLATE.md`, `CHANGELOG_AGENT.md`, `OPEN_QUESTIONS.md`

### Spécifications produit
- **Vision** : `spec/vision/MISSION.md`
- **Domaine** : 16 entités, règles métier, états/transitions (`spec/domain/`)
- **ADR 001** : Stack technique (FastAPI + React + PostgreSQL)

### Infrastructure (config locale)
- `docker-compose.yml` : 4 services (backend, frontend, db, cache)
- `Dockerfile.backend` (FastAPI multi-stage) + `Dockerfile.frontend` (React → Nginx)
- Nginx reverse proxy SSL pour `formation.kleia-up.fr`
- CI/CD GitHub Actions (push → build → deploy VPS OVH)
- Script d'initialisation VPS : `deploy/setup-vps.sh`

### Frontend
- React 19 + Vite 6 + Tailwind CSS 4 (build OK : 1.24s, 59 modules)
- Design system Kleia-up : burgundy `#8B1D3D`, gold `#D4AF37`, cream `#FAF9F6`
- 8 composants de base (Button, Card, Input, Badge, Loading, Header, Footer, Layout)
- Composant PlayerShell (prêt pour Phase 2)

### Maquette visuelle — 7 pages mockup
| Page | URL | Contenu |
|---|---|---|
| Dashboard | `/` | Stats, formations en cours, activité récente |
| Catalogue | `/formations` | Grille filtrée des formations |
| Détail formation | `/formation/:slug` | Hero, progression, modules/leçons |
| Leçon vidéo | `/lecon/:id` | Player, navigation, transcript |
| Quiz | `/quiz/:id` | Questions QCM, soumission, score |
| Profil | `/profil` | Infos, certificats, paramètres |
| Admin | `/admin` | Stats, inscriptions, gestion |

### Data mock
- 4 formations (Architecture, Incarnation, Mindset, Leadership)
- 18 modules, 74 leçons, 1 quiz (5 questions)
- 8 activités récentes, 1 certificat

---

## 🔜 Prochaine étape (Phase 1 — Backend & Domaine)

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

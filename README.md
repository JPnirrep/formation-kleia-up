# Kleia-up LMS

Plateforme d'apprentissage en ligne pour le **Leadership Organique** — formation.kleia-up.fr

> Inspiré de TalentLMS, Docebo et 360Learning. Pensé pour les entrepreneurs HPI/HSP, coachés individuels et futures cohortes B2B.

---

## Stack

| Couche | Technologie |
|--------|------------|
| **Backend** | FastAPI + Python 3.12 + SQLAlchemy 2.0 async |
| **Frontend** | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 |
| **Base de données** | PostgreSQL 15 (prod) / SQLite (dev) |
| **Cache** | Redis 7 |
| **Auth** | JWT (access + refresh) + Google OAuth |
| **Infrastructure** | Docker, Nginx, Let's Encrypt, VPS OVH |
| **CI/CD** | GitHub Actions (lint, test, build) |

---

## Fonctionnalités

### Apprenant
- ✅ Authentification (email + Google)
- ✅ Dashboard personnalisé "Ton Incarnation"
- ✅ Catalogue formations avec filtres
- ✅ Lecteur vidéo avec reprise multi-session
- ✅ Quiz avec scoring et validation
- ✅ Progression linéaire (leçon → leçon)
- ✅ Certificats PDF téléchargeables
- ✅ Journal intime par leçon
- ✅ Badges et gamification (points, niveaux, streaks)
- ✅ Classement (leaderboard)
- ✅ Mode sombre/clair

### Administration
- ✅ CRUD formations, modules, leçons
- ✅ Upload vidéo (YouTube + fichier)
- ✅ Gestion utilisateurs (création, rôles, activation)
- ✅ Gestion inscriptions (attribution, statut)
- ✅ Création quiz (questions QCM)
- ✅ Dashboard stats (utilisateurs, lectures, complétion)
- ✅ Génération de certificats

### Technique
- ✅ API REST documentée (/api/docs)
- ✅ Pagination, filtres, recherche
- ✅ Refresh token automatique (frontend)
- ✅ Rate limiting sur endpoints sensibles
- ✅ CORS liste blanche configurable
- ✅ Validation upload (extensions sécurisées)
- ✅ Migrations Alembic
- ✅ Compatible PostgreSQL et SQLite

---

## Démarrage rapide

### Prérequis
- Docker + Docker Compose
- Python 3.12+ (dev)

### En développement (SQLite)

```bash
# Build et lancement
cd deploy
docker compose up -d

# Appliquer les migrations et seed
docker exec kleia-backend alembic upgrade head
docker exec kleia-backend python seed.py

# Accès
# Frontend : http://localhost:3000
# Backend  : http://localhost:8000/api/docs
```

### Seed (comptes de test)

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@kleia-up.com | `admin` | Administrateur |
| sandrina@kleia-up.com | `admin123` | Administrateur |
| clara.f@example.com | `password123` | Apprenant |

### Déploiement production (PostgreSQL)

```bash
# 1. Configurer deploy/.env avec DATABASE_URL PostgreSQL
# 2. Générer un JWT_SECRET :
openssl rand -hex 32

# 3. Build et run
cd deploy
docker compose up -d --build

# 4. Migrations
docker exec kleia-backend alembic upgrade head
```

> ⚠️ En production, le `docker-compose.yml` a été patché :
> - `env_file` → `./.env` (relatif au dossier deploy/)
> - Network en `external: true` (évite les conflits de labels)
> - Les conteneurs tournent idéalement en `--network host`

---

## Structure du projet

```
kleia-up/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints REST
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Logique métier
│   │   ├── middleware/       # Rate limiting, etc.
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # DB engine + session
│   │   └── main.py          # App factory
│   ├── alembic/             # Migrations
│   ├── seed.py              # Données de test
│   └── uploads/             # Fichiers uploadés
├── frontend/
│   ├── src/
│   │   ├── api/             # Client HTTP
│   │   ├── components/      # UI + feature components
│   │   ├── context/         # Providers (Auth, Theme, Gamification)
│   │   ├── hooks/           # Hooks customs
│   │   ├── pages/           # Pages (22 pages)
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Routes + providers
│   └── vite.config.ts
├── deploy/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── .env                 # Variables d'environnement
│   └── nginx/               # Configuration reverse proxy
├── spec/                    # Documentation projet
│   ├── backlog/ROADMAP.md
│   ├── domain/ENTITIES.md
│   ├── api/ENDPOINTS.md
│   ├── ux/PARCOURS.md
│   └── security/POLICY.md
└── docs/                    # Notes techniques
```

---

## API — Aperçu

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Connexion |
| `POST` | `/api/v1/auth/refresh` | Rafraîchir token |
| `GET` | `/api/v1/courses` | Catalogue formations |
| `GET` | `/api/v1/courses/{id}` | Détail formation (modules + leçons) |
| `POST` | `/api/v1/progress/lessons/{id}/complete` | Valider une leçon |
| `POST` | `/api/v1/quizzes/{id}/attempt` | Soumettre un quiz |
| `GET` | `/api/v1/gamification/me` | Mes points/niveau/streak |
| `GET` | `/api/v1/gamification/leaderboard` | Classement |
| `GET` | `/api/v1/certificates/my` | Mes certificats |
| `POST` | `/api/v1/admin/courses` | Créer une formation (admin) |
| `GET` | `/api/v1/admin/users` | Lister utilisateurs (admin) |
| `GET` | `/api/v1/admin/stats` | Statistiques (admin) |

Documentation interactive : `https://formation.kleia-up.fr/api/docs`

---

## Design System

| Token | Valeur |
|-------|--------|
| Burgundy (primaire) | `#8B1D3D` |
| Gold (accent) | `#D4AF37` |
| Cream (fond) | `#FAF9F6` |
| h1 | Ranade 800, `#1A1A1A` |
| h2-h6 | Syne 700, `#8B1D3D` |

---

## Bugs connus & patterns (LESSONS.md)

21 patterns documentés dans [LESSONS.md](LESSONS.md). Les principaux :
- Désynchronisation schéma/handler → relire le schéma avant d'écrire
- `str \| None = None` sans check → crash garanti
- SQL PostgreSQL-only sur SQLite → tester les deux
- Types frontend/backend désynchronisés → script de vérification recommandé
- Pagination uniforme → `PaginatedResponse` partout
- Boutons fonctionnels ou retirés → pas de `onClick={() => {}}`

---

## Roadmap

| Phase | Statut |
|-------|:------:|
| 0-4 : Fondations, Core, Vidéo, Certificats | ✅ Terminé |
| Sprint C : Admin CRUD | ✅ Terminé (31 tests) |
| Sprint D : Gamification | ✅ Terminé (10 tests) |
| PRIO 1 : Sécurisation (8 bombes) | ✅ Terminé |
| PRIO 2 : Robustesse (5 trous) | ✅ Terminé |
| Accessibilité WCAG 2.2 | 📋 Planifié |
| KleiaCraft (génération de cours par IA) | 💡 Idée |
| AI Coach RAG | 💡 Idée |
| Multi-tenant / E-commerce | 💡 Idée (post-V1) |

---

## Licence & Contact

Projet interne Kleia-up — Sandrina Perrin.
Formation : [https://formation.kleia-up.fr](https://formation.kleia-up.fr)

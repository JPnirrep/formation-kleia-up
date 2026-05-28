# ADR 001 — Choix de la stack technique

## Statut
Accepté (2026-05-11)

## Contexte
Choix de la stack pour la plateforme e-learning formation.kleia-up.fr.
Critères : frugalité, vélocité, maîtrise de l'écosystème existant, extensibilité 2026-2028.

## Décision
| Couche | Choix | Justification |
|---|---|---|
| Frontend | React + TypeScript + Vite | SPA légère, build statique servi par Nginx. Pas de SSR nécessaire (LMS = app, pas site public). |
| Styling | Tailwind CSS | Design system Kleia-up facile à intégrer. Même approche que l'écosystème Vagus. |
| Backend | FastAPI + Python 3.12 | Python déjà maîtrisé dans l'écosystème (KLEIA_LIBS, antigravity-brain). Pydantic v2 + SQLAlchemy 2.0 robustes. |
| DB | PostgreSQL 15 | Relationnel solide pour catalogue, utilisateurs, progression. |
| Cache | Redis 7 | Cache, sessions, file de tâches. |
| Auth | Google OAuth2 OIDC + JWT | SSO sans mot de passe. Compatible B2B futur. |
| Vidéo | HLS + S3 | Streaming adaptatif, CDN, contrôle d'accès par tokens. |
| Infra | Docker Compose sur VPS OVH | Existant, maîtrisé, frugal. |

## Conséquences
- **Positives** : Stack légère, maîtrisée, économique. Déploiement simple (Docker Compose). Passage à l'échelle vertical.
- **Négatives** : Pas de SSR (SEO sur l'app LMS = pas nécessaire — le SEO reste sur le site vitrine). Pas de serverless.
- **Risques** : PostgreSQL peut devenir goulot à très grande échelle → cache Redis + read replicas.

## Alternatives envisagées
- Next.js (SSR) : Non retenu — le LMS est une app, pas un site public. Le SEO reste sur kleia-up.fr.
- NestJS : Non retenu — FastAPI plus rapide à développer et mieux intégré à l'écosystème Python existant.
- Odoo 19 LMS : Non retenu pour la plateforme custom — trop lourd, UI rigide, personnalisation limitée.
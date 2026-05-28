# AGENT.md — Plateforme Formations Kleia-up

## Mission
Construire la plateforme e-learning formation.kleia-up.fr pour Kleia-up.
Formations dédiées au Leadership Organique (Sandrina Perrin), avec vidéo, quiz, certificats, progression.

## Source de vérité
Ordre de priorité (le premier gagne) :
1. `/spec/**` (spécifications produit)
2. `/adr/**` (décisions architecturales)
3. `SYSTEM_CONTRACT.md`
4. `DEFINITION_OF_DONE.md`
5. Instructions de tâche en cours

## Stack autorisée
- **Frontend** : React + TypeScript + Vite (SPA, build statique)
- **Styling** : Tailwind CSS + tokens design system Kleia-up (burgundy #8B1D3D, gold #D4AF37, cream #FAF9F6)
- **Backend** : FastAPI + Python 3.12 (Pydantic v2, SQLAlchemy 2.0, Alembic)
- **Base de données** : PostgreSQL 15
- **Cache / queue** : Redis 7
- **Stockage** : S3-compatible (OVH Object Storage)
- **Auth** : Google OAuth2 (OIDC) + JWT
- **Vidéo** : HLS.js + streaming adaptatif HLS
- **Infra** : Docker Compose sur VPS OVH (135.125.53.215)

## Règles d'exécution
1. Toujours lire la spec liée au module avant de coder
2. Toujours proposer un plan avant implémentation significative
3. Toujours limiter le changement au périmètre demandé
4. Ne jamais inventer une règle métier absente — créer `OPEN_QUESTION` à la place
5. Ne jamais effectuer d'action destructive sans validation (DROP, DELETE massif, reset prod)
6. Toujours mettre à jour la documentation impactée
7. Les secrets ne sont jamais dans le code — utiliser `.env` local

## Format de réponse attendu
1. Objectif compris (reformulation)
2. Plan (fichiers impactés, étapes)
3. Exécution
4. Tests / validation
5. Risques et questions ouvertes
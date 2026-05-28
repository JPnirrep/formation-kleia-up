# SYSTEM_CONTRACT.md — Plateforme Formations Kleia-up

## Contraintes globales
- Architecture modulaire obligatoire (backend séparé du frontend)
- Accessibilité WCAG 2.2 visée sur les parcours critiques (onboarding, player, quiz, dashboard)
- Mobile-first obligatoire (responsive desktop + mobile)
- Journalisation des actions admin et des événements pédagogiques obligatoire
- Aucun secret en clair dans le code (API keys, tokens, mots de passe)

## Sécurité
- Environnements séparés : local, dev (à définir), staging (à définir), prod (OVH VPS)
- Interdiction de modifier la prod depuis un agent autonome sans validation humaine
- Interdiction d'exécuter SQL destructif sans revue explicite
- Interdiction d'exporter des données utilisateurs hors périmètre
- Tokens JWT avec expiration courte + refresh tokens pour sessions longues
- Protection CSRF sur les endpoints sensibles

## Politique de décision
- Si la règle produit existe dans `/spec/**` → l'appliquer strictement
- Si elle manque → créer une entrée dans `OPEN_QUESTIONS.md`
- Si le changement dépasse le périmètre de la tâche → le signaler, ne pas l'implémenter

## URLs de référence
- **Site vitrine** : https://kleia-up.fr (GitHub Pages, HTML statique)
- **Plateforme LMS** : https://formation.kleia-up.fr (OVH VPS)
- **API Backend** : https://formation.kleia-up.fr/api (FastAPI)
- **Admin** : https://formation.kleia-up.fr/admin (back-office)

## Design system
- Couleurs primaires : `#8B1D3D` (burgundy), `#D4AF37` (gold), `#FAF9F6` (cream)
- Typographie : `Syne` (titres), `Ranade` (corps)
- Effets : glassmorphism, ombres dorées, coins arrondis 12px
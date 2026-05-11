# DEFINITION_OF_DONE.md

Une tâche est terminée UNIQUEMENT si tous les critères suivants sont remplis :

## Code & Build
- [ ] Le code compile ou démarre correctement (pas d'erreur TypeScript, Python, ou build)
- [ ] Les tests unitaires et d'intégration pertinents passent
- [ ] Aucune régression introduite

## Qualité
- [ ] Les cas d'erreur critiques sont traités (400, 401, 403, 404, 422, 500)
- [ ] Les logs pertinents sont en place
- [ ] Les performances sont acceptables (temps de réponse < 500ms pour les APIs critiques)

## Sécurité
- [ ] Aucun secret n'est exposé dans le code
- [ ] Les permissions et rôles sont respectés
- [ ] Les entrées utilisateur sont validées côté backend

## Documentation
- [ ] La documentation impactée est mise à jour (spec, ADR, README)
- [ ] Les endpoints API sont documentés si applicable
- [ ] Les migrations de base de données sont réversibles

## Accessibilité
- [ ] Les parcours critiques sont navigables au clavier
- [ ] Les contrastes sont suffisants (ratio 4.5:1 minimum)
- [ ] Les libellés accessibles sont présents sur les éléments interactifs

## Exploitation
- [ ] La stratégie de rollback est connue si nécessaire
- [ ] Les métriques de monitoring sont en place pour les fonctionnalités critiques
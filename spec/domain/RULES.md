# Règles métier — Plateforme Formations Kleia-up

## Progression vidéo
- Une vidéo n'est PAS considérée terminée au simple clic sur Lecture
- La complétion est atteinte quand `percent_watched >= completion_threshold_percent` (défaut: 85%)
- Les sauts (seek) trop importants (> 30s sans visionnage compensatoire) sont ignorés pour le calcul de complétion
- La dernière position utile est mémorisée pour reprise multi-session
- `max_position_seconds` = la position la plus loin atteinte (ne recule jamais)
- `percent_watched` = `max_position_seconds / duration_seconds * 100`

## Progression leçon
- Une leçon de type `video` est complétée quand TOUTES ses vidéos sont complétées
- Une leçon de type `quiz` est complétée quand l'utilisateur a réussi le quiz (score >= passing_score_percent)
- Une leçon de type `mixed` est complétée quand vidéo ET quiz sont complétés

## Progression module
- Un module est complété quand TOUTES ses leçons sont complétées
- Les modules peuvent être verrouillés séquentiellement (le module N+1 se déverrouille quand N est complété)

## Progression formation
- Une formation est complétée quand TOUS ses modules sont complétés
- À la complétion, un certificat est automatiquement généré si la formation en possède un

## Certificats
- Délivrance automatique à la complétion de la formation
- Numéro unique : KLEIA-YYYY-NNNN (année + séquentiel)
- Le certificat contient : nom apprenant, titre formation, date, durée totale

## Quiz
- Les questions QCM peuvent avoir plusieurs bonnes réponses (checkbox) ou une seule (radio)
- Le score est calculé en % de bonnes réponses sur le total des points
- Feedback immédiat après chaque tentative (explication visible)
- Tentatives illimitées par défaut (configurable par quiz)

## Accès aux formations
- V1 : Attribution manuelle par un admin (création d'un Enrollment)
- L'utilisateur voit uniquement les formations auxquelles il est inscrit
- Une formation publiée est visible dans le catalogue uniquement si l'utilisateur y a accès

## Rôles
- `learner` : peut voir ses formations, lire les leçons, passer les quiz, obtenir des certificats
- `trainer` : peut créer et gérer le contenu (formations, modules, leçons, vidéos, quiz)
- `admin` : peut tout faire (y compris gérer les utilisateurs, attribuer des accès)
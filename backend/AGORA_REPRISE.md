# Documentation de Relais — Projet Agora (LMS KLEIA)

**Code de reprise : `Agora`**
**Date de session : 14 Mai 2026**

## Objectif Atteint
Transformation du backend en plateforme pédagogique stricte "Production-Ready".

## Architecture du Moteur Pédagogique (V2.0)

### 1. Progression Linéaire Stricte
- **Champ `is_linear_progression_enforced`** : Ajouté au modèle `Course`.
- **Guard Service (`progress_service.py`)** : Intercepte les requêtes vers les vidéos, les quiz et les ressources. Si la leçon précédente n'est pas marquée comme `completed` dans la table `LessonProgress`, le serveur renvoie un `403 Forbidden`.
- **Validation 100%** : Le endpoint `complete_lesson` vérifie désormais :
    - Pour les vidéos : `percent_watched >= 95` dans `VideoProgress`.
    - Pour les quiz : Meilleur score de l'élève >= `passing_score_percent` du quiz.

### 2. Gamification (Badges)
- **Modèles** : `Badge` et `UserBadge` créés.
- **Service (`gamification_service.py`)** : Gère l'attribution automatique.
- **Badges implémentés** :
    - `first_lesson` (Premier Pas)
    - `perfect_quiz` (Expert Quiz - score 100%)
    - `course_completion` (Diplômé d'Agora)
- **API** : `GET /api/v1/badges/me` pour l'apprenant.

### 3. Ressources Pédagogiques
- **Modèle `LessonResource`** : Permet de stocker des URLs (PDF sur Hostinger) ou du texte Markdown.
- **API** : `GET /api/v1/lessons/{lesson_id}/resources` (protégé par le guard linéaire).

## État de la Base de Données
- La base a été réinitialisée (`kleia_lms.db`).
- Une migration Alembic unique (`63c4b60ee6fe`) consolide tout le schéma.
- Le script `seed.py` a été mis à jour et exécuté pour peupler les badges et les formations.

## Prochaines Étapes Suggérées
1.  **Frontend** : Implémenter les visuels pour les badges gagnés (renvoyés dans `new_badges` lors de la complétion).
2.  **Resources UI** : Créer le composant pour afficher/télécharger les PDF liés aux leçons.
3.  **Stripe** : Intégrer les champs financiers (`price`, `currency`) du modèle `Course` dans le tunnel de vente.

---
*Fin de session. Tout est poussé sur la branche main.*

# Spécification API — Plateforme Formations Kleia-up

**Base URL** : `https://formation.kleia-up.fr/api/v1`
**Dev** : `http://localhost:8000/api/v1`
**Format** : JSON
**Auth** : Bearer JWT (sauf endpoints publics)

---

## Authentification

### POST /auth/login
Connexion par email/mot de passe.

```json
// Requête
{ "email": "clara.f@example.com", "password": "password123" }
// Réponse 200
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer", "user": {...} }
```

### POST /auth/register
Création de compte email.

```json
// Requête
{ "email": "...", "password": "...", "display_name": "..." }
// Réponse 201
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer", "user": {...} }
```

### POST /auth/google
Connexion Google OAuth.

```json
// Requête
{ "id_token": "google-id-token..." }
// Réponse 200
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer", "user": {...} }
```

### GET /auth/me
Profil de l'utilisateur connecté. **Auth requise**

### POST /auth/refresh
Rafraîchir le token.

```json
// Requête
{ "refresh_token": "eyJ..." }
// Réponse 200
{ "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer" }
```

---

## Formations (public)

### GET /courses
Liste paginée des formations publiées.

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `skip` | int | 0 | Offset |
| `limit` | int | 20 | Limite |
| `level` | string | — | Filtre niveau |
| `category` | string | — | Filtre catégorie |

```json
// Réponse 200
{ "items": [CourseRead], "total": 4, "page": 1, "page_size": 20, "total_pages": 1 }
```

### GET /courses/{slug}
Détail d'une formation par slug.

### GET /courses/{slug}/modules
Modules d'une formation (avec leçons imbriquées).

### GET /courses/{slug}/modules/{module_id}/lessons
Leçons d'un module spécifique.

---

## Inscriptions

### GET /enrollments/my
Formations auxquelles l'utilisateur connecté est inscrit. **Auth**

### POST /enrollments
Créer une inscription (admin ou auto-inscription). **Auth**

```json
// Requête
{ "course_id": "uuid", "user_id": "uuid" }
```

---

## Progression

### GET /progress/courses/{course_id}
Progression détaillée pour une formation. **Auth**

```json
// Réponse
{ "course_id": "uuid", "course_title": "...", "lessons_progress": [{ "lesson_id": "uuid", "status": "completed", "completed_at": "..." }] }
```

### POST /progress/lessons/{lesson_id}/complete
Marquer une leçon comme terminée. **Auth**

### POST /progress/videos/{video_id}/progress
Mettre à jour la progression vidéo. **Auth**

```json
// Requête
{ "current_time": 120.5, "duration": 300, "completed": false }
```

---

## Quiz

### GET /quizzes/{quiz_id}
Détail d'un quiz avec questions. **Auth**

### POST /quizzes/{quiz_id}/attempt
Soumettre une tentative de quiz. **Auth**

```json
// Requête
{ "answers": [{"question_id": "uuid", "selected_option": "uuid"}] }
// Réponse
{ "attempt_id": "uuid", "score": 4, "total": 5, "percentage": 80, "passed": true, "answers": [...], "completed_at": "..." }
```

### GET /quizzes/{quiz_id}/attempts
Historique des tentatives. **Auth**

---

## Vidéos (apprenant)

### GET /videos/lessons/{lesson_id}/videos
Liste des vidéos publiées d'une leçon. **Auth**

```json
// Réponse 200
[{ "id": "uuid", "title": "...", "playback_url": "/api/v1/uploads/xxx.mp4", "tracks": [...] }]
```

### POST /videos/videos/{video_id}/events
Enregistrer un événement vidéo. **Auth**

```json
// Requête
{ "video_asset_id": "uuid", "session_id": "...", "event_type": "play", "position_seconds": 0 }
// Réponse 201
{ "status": "ok", "event_type": "play" }
```

---

## Certificats

### GET /certificates/my
Liste des certificats de l'utilisateur connecté. **Auth**

```json
// Réponse 200
[{ "id": "uuid", "certificate_number": "KLEIA-2026-0001", "course_title": "...", "issued_at": "...", "playback_url": "...", ... }]
```

### GET /certificates/{cert_id}
Détail d'un certificat. **Auth** (propriétaire ou admin)

### POST /certificates/{course_id}/generate
Générer un certificat pour un apprenant. **Admin**

| Paramètre | Type | Description |
|---|---|---|
| `user_id` | uuid (query) | ID de l'apprenant (défaut: admin) |

### GET /certificates/{cert_id}/download
Télécharger le PDF du certificat. **Auth** (propriétaire ou admin)

```
Réponse 200 — Content-Type: application/pdf
Content-Disposition: attachment; filename="certificat-KLEIA-2026-0001.pdf"
```

---

## Utilisateurs

### GET /users
Liste des utilisateurs. **Auth**

### GET /users/{user_id}
Détail d'un utilisateur. **Auth**

### PATCH /users/{user_id}/role
Changer le rôle d'un utilisateur. **Admin**

```json
// Requête
{ "role": "trainer" }
```

---

## Administration

### POST /admin/courses
Créer une formation. **Admin**

```json
// Requête
{ "title": "...", "slug": "...", "short_description": "...", "description": "...", "level": "débutant", "duration_seconds": 5400 }
```

### PUT /admin/courses/{course_id}
Modifier une formation. **Admin**

### DELETE /admin/courses/{course_id}
Supprimer une formation. **Admin** → 204

### POST /admin/courses/{course_id}/modules
Ajouter un module. **Admin**

### PUT /admin/modules/{module_id}
Modifier un module. **Admin**

### DELETE /admin/modules/{module_id}
Supprimer un module. **Admin** → 204

### POST /admin/modules/{module_id}/lessons
Ajouter une leçon. **Admin**

### PUT /admin/lessons/{lesson_id}
Modifier une leçon. **Admin**

### DELETE /admin/lessons/{lesson_id}
Supprimer une leçon. **Admin** → 204

### POST /admin/lessons/{lesson_id}/quiz
Ajouter un quiz à une leçon. **Admin**

### GET /admin/enrollments
Liste paginée des inscriptions. **Admin**

### POST /admin/lessons/{lesson_id}/videos
Uploader une vidéo. **Admin** (multipart)

| Champ | Type | Description |
|---|---|---|
| `file` | file (multipart) | Fichier vidéo |
| `title` | string | Titre |
| `order` | int | Ordre dans la leçon |

```json
// Réponse 201
{ "id": "uuid", "title": "...", "playback_url": "/api/v1/uploads/xxx.mp4", "status": "published" }
```

### GET /admin/videos/{video_id}
Détail d'une vidéo. **Admin**

### PUT /admin/videos/{video_id}
Mettre à jour une vidéo. **Admin**

### DELETE /admin/videos/{video_id}
Supprimer une vidéo. **Admin** → 204

### POST /admin/videos/{video_id}/publish
Publier une vidéo. **Admin**

---

## Statistiques

### GET /admin/stats
Métriques globales de la plateforme. **Admin**

```json
// Réponse 200
{
  "total_users": 42,
  "total_courses": 4,
  "total_enrollments": 156,
  "active_enrollments": 89,
  "total_video_plays": 1234,
  "unique_viewers": 67,
  "total_video_completions": 890,
  "completion_rate_percent": 72.1,
  "total_watch_time_seconds": 456789
}
```

### GET /admin/stats/events
Timeline des événements vidéo. **Admin**

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `days` | int | 14 | Nombre de jours |

```json
// Réponse 200
{
  "timeline": [
    { "date": "2026-04-28", "plays": 12, "heartbeats": 45, "pauses": 3, "seeks": 2, "ended": 8 }
  ],
  "total_events": 456
}
```

---

## Fichiers (dev uniquement)

### GET /uploads/{filename}
Servir un fichier uploadé. **Public** (dev)

```
Réponse 200 — Content-Type basé sur l'extension
```

---

## Codes HTTP utilisés

| Code | Usage |
|---|---|
| 200 | Succès GET/PUT/PATCH |
| 201 | Création POST |
| 204 | Suppression DELETE (pas de body) |
| 307 | Redirect (trailing slash) |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé (rôle insuffisant) |
| 404 | Ressource non trouvée |
| 422 | Erreur de validation |
| 500 | Erreur interne |

## Erreurs

Toutes les erreurs suivent le format :

```json
{ "detail": "Message d'erreur en français." }
```

Pour les erreurs 422, `detail` contient le tableau d'erreurs de validation Pydantic.

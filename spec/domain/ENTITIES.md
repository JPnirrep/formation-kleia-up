# Entités du domaine — Plateforme Formations Kleia-up

## Entités principales

### User
- `id` : UUID (PK)
- `email` : string (unique)
- `display_name` : string
- `avatar_url` : string?
- `role` : enum(learner, admin, trainer)
- `auth_provider` : enum(google, email)
- `auth_sub` : string (sub unique du provider)
- `is_active` : bool
- `created_at` : datetime
- `updated_at` : datetime

### Course (Formation)
- `id` : UUID (PK)
- `title` : string
- `slug` : string (unique, pour URL)
- `description` : text
- `short_description` : string
- `thumbnail_url` : string?
- `duration_seconds` : int (somme des durées vidéo)
- `level` : enum(débutant, intermédiaire, avancé)
- `status` : enum(draft, published, archived)
- `created_by` : FK → User
- `created_at` : datetime
- `updated_at` : datetime

### Module
- `id` : UUID (PK)
- `course_id` : FK → Course
- `title` : string
- `description` : text?
- `order` : int (position dans le cours)
- `created_at` : datetime
- `updated_at` : datetime

### Lesson (Leçon)
- `id` : UUID (PK)
- `module_id` : FK → Module
- `title` : string
- `description` : text?
- `order` : int (position dans le module)
- `lesson_type` : enum(video, quiz, mixed)
- `created_at` : datetime
- `updated_at` : datetime

### VideoAsset
- `id` : UUID (PK)
- `lesson_id` : FK → Lesson
- `title` : string
- `description` : text?
- `order` : int (position dans la leçon)
- `source_storage_key` : string (clé dans le S3)
- `playback_manifest_url` : string? (URL HLS)
- `thumbnail_url` : string?
- `duration_seconds` : int
- `status` : enum(uploaded, processing, ready, failed, archived)
- `language` : string (défaut: 'fr')
- `visibility` : enum(draft, private, published)
- `completion_threshold_percent` : int (défaut: 85)
- `created_by` : FK → User
- `created_at` : datetime
- `updated_at` : datetime

### VideoTrack
- `id` : UUID (PK)
- `video_asset_id` : FK → VideoAsset
- `kind` : enum(subtitles, captions, transcript)
- `language` : string
- `label` : string
- `file_url` : string
- `is_default` : bool
- `status` : string

### Quiz
- `id` : UUID (PK)
- `lesson_id` : FK → Lesson
- `title` : string
- `passing_score_percent` : int (défaut: 70)
- `max_attempts` : int? (null = illimité)
- `created_at` : datetime

### Question
- `id` : UUID (PK)
- `quiz_id` : FK → Quiz
- `text` : text
- `order` : int
- `question_type` : enum(mcq, true_false)
- `options` : jsonb (tableau de {label, is_correct})
- `explanation` : text? (feedback après réponse)
- `points` : int (défaut: 1)

### Attempt (Tentative de quiz)
- `id` : UUID (PK)
- `user_id` : FK → User
- `quiz_id` : FK → Quiz
- `score_percent` : float
- `answers` : jsonb (tableau de {question_id, selected_option, is_correct})
- `started_at` : datetime
- `completed_at` : datetime?

### Enrollment (Inscription)
- `id` : UUID (PK)
- `user_id` : FK → User
- `course_id` : FK → Course
- `status` : enum(active, completed, expired)
- `granted_by` : FK → User? (admin qui a attribué)
- `granted_at` : datetime
- `completed_at` : datetime?
- `expires_at` : datetime?

### LessonProgress (Progression par leçon)
- `id` : UUID (PK)
- `user_id` : FK → User
- `lesson_id` : FK → Lesson
- `status` : enum(not_started, in_progress, completed)
- `completed_at` : datetime?
- `updated_at` : datetime

### VideoProgress (Progression par vidéo)
- `id` : UUID (PK)
- `user_id` : FK → User
- `video_asset_id` : FK → VideoAsset
- `last_position_seconds` : float
- `max_position_seconds` : float
- `percent_watched` : float
- `completed` : bool
- `completed_at` : datetime?
- `last_played_at` : datetime

### VideoEvent (Événements vidéo)
- `id` : UUID (PK)
- `user_id` : FK → User
- `video_asset_id` : FK → VideoAsset
- `session_id` : string
- `event_type` : enum(play, pause, seek, heartbeat, ended, captions_enabled)
- `position_seconds` : float
- `payload_json` : jsonb?
- `occurred_at` : datetime

### Certificate (Certificat)
- `id` : UUID (PK)
- `user_id` : FK → User
- `course_id` : FK → Course
- `certificate_number` : string (unique, format: KLEIA-YYYY-NNNN)
- `issued_at` : datetime
- `metadata` : jsonb? (score final, durée, etc.)

## Relations
- Course 1──N Module
- Module 1──N Lesson
- Lesson 1──N VideoAsset
- Lesson 1──1 Quiz (optionnel)
- VideoAsset 1──N VideoTrack
- Quiz 1──N Question
- User N──N Course (via Enrollment)
- User 1──N LessonProgress
- User 1──N VideoProgress
- User 1──N VideoEvent
- User 1──N Attempt
- User 1──N Certificate
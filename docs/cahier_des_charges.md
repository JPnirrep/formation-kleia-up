# Cahier des Charges Technique — Modules Journal & Coaching

## 1. Module Journal de Bord (Nexus Journal)

### Backend (FastAPI)
*   **Modèle `JournalEntry`** :
    *   `id` (UUID)
    *   `user_id` (FK)
    *   `lesson_id` (FK, optionnel)
    *   `content` (Text, Markdown)
    *   `is_shared` (Boolean) : Si partagé avec le coach.
    *   `created_at`, `updated_at`
*   **API** :
    *   `GET /journal` : Liste des entrées de l'utilisateur.
    *   `POST /journal` : Création/Mise à jour d'une entrée.
    *   `GET /admin/journal/{user_id}` : Vue coach pour les entrées partagées.

### Frontend (React)
*   **Composant `JournalEditor`** : Éditeur Markdown léger avec prévisualisation.
*   **Intégration Leçon** : Widget latéral dans `LessonView` pour prise de notes en direct.

---

## 2. Module Coaching "Conciergerie"

### Backend (FastAPI)
*   **Modèle `CoachingSession`** :
    *   `id`, `user_id`, `coach_id`
    *   `date` (DateTime)
    *   `status` (Planned, Completed, Cancelled)
    *   `report_url` (String, lien vers le PDF sur Hostinger)
*   **Modèle `CoachProfile`** (Configurable par l'admin) :
    *   `whatsapp_number`, `telegram_username`, `phone`, `email`.

### Frontend (React)
*   **Composant `CoachingHub`** :
    *   Affichage des prochaines sessions.
    *   Historique des comptes-rendus.
    *   **Action Bar** : Boutons d'appel à l'action vers les messageries tierces.

---

## 3. Standardisation Visuelle (Design System)

*   **Bibliothèque d'icônes** : Adoption de `lucide-react`.
*   **Thème Tailwind 4** :
    *   Burgundy : `#8B1D3D`
    *   Gold : `#D4AF37`
    *   Cream : `#FAF9F6`
*   **Composants UI** :
    *   `Card` : Ombre portée `shadow-gold` sur le hover.
    *   `Button` : Gradient `from-kleia-burgundy to-kleia-burgundy-light`.

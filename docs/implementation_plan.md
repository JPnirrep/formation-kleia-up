# Plan d'Action — Implémentation Journal & Coaching Premium

## 1. Phase Préparatoire : Design & Assets
*   **[MODIFY]** `frontend/package.json` : Installer `lucide-react` et `framer-motion`.
*   **[MODIFY]** `frontend/src/index.css` : Ajuster les variables pour correspondre parfaitement au logo (Gold/Burgundy).
*   **[REPLACE]** Remplacer les emojis par des icônes Lucide dans `Dashboard.tsx` et `CourseCard.tsx`.

## 2. Phase Backend (API)
*   **[NEW]** `backend/app/models/journal.py` : Modèle SQL Alchemy pour les entrées de journal.
*   **[NEW]** `backend/app/api/v1/journal.py` : Endpoints CRUD pour le journal.
*   **[MODIFY]** `backend/app/models/user.py` : Ajouter la liaison avec les notes de coaching.
*   **[NEW]** `backend/app/api/v1/coaching.py` : Gestion des sessions et des liens de contact (WhatsApp/Telegram).

## 3. Phase Frontend (Interface)
*   **[NEW]** `frontend/src/pages/Journal.tsx` : Page principale du journal de bord.
*   **[NEW]** `frontend/src/components/journal/JournalEntry.tsx` : Composant de prise de note individuel.
*   **[NEW]** `frontend/src/pages/Coaching.tsx` : Hub de coaching avec les connecteurs directs.
*   **[MODIFY]** `frontend/src/App.tsx` : Déclarer les nouvelles routes `/journal` et `/coaching`.

## 4. Phase de Validation
*   Tests de l'édition Markdown dans le journal.
*   Vérification des liens WhatsApp/Telegram dynamiques.
*   Audit final du rendu visuel "Premium".

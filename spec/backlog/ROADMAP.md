# Roadmap — Plateforme Formations Kleia-up

## Légende
- ✅ **Fait** — Livré, testé et déployé
- 🔧 **En cours** — Implémentation active
- 📋 **Planifié** — Spécifié, prêt à coder
- 💡 **Idée** — Concept validé, pas encore planifié

---

## Phase 0 — Fondations ✅

| Tâche | Statut | Priorité |
|---|---|---|
| Stack technique (FastAPI + SQLAlchemy + React + Vite) | ✅ | Critique |
| Structure du projet (monorepo backend/frontend) | ✅ | Critique |
| Docker Compose (API + DB + Redis) | ✅ | Haute |
| CI/CD (GitHub Actions : lint, test, build) | ✅ | Haute |
| Configuration multi-environnement (.env) | ✅ | Haute |
| Déploiement OVH (VPS + Nginx + SSL) | ✅ | Moyenne |

---

## Phase 1 — Backend Core ✅

| Tâche | Statut | Priorité |
|---|---|---|
| Modèles SQLAlchemy (toutes entités) | ✅ | Critique |
| Authentification (email + Google OAuth + JWT) | ✅ | Critique |
| API formations (CRUD + catalogue) | ✅ | Critique |
| API modules/leçons (CRUD, navigation) | ✅ | Critique |
| API quiz (CRUD + tentative + score) | ✅ | Critique |
| API inscriptions (enrollments) | ✅ | Haute |
| API progression (leçons, vidéos) | ✅ | Haute |
| API utilisateurs (profil, rôles) | ✅ | Haute |
| API administration (gestion contenu) | ✅ | Haute |
| Pagination, filtres, recherche | ✅ | Moyenne |
| Tests API (pytest + httpx) | ✅ | Haute |

---

## Phase 2 — Frontend Core ✅

| Tâche | Statut | Priorité |
|---|---|---|
| Login/Register (email + Google) | ✅ | Critique |
| Dashboard apprenant (progression, activités) | ✅ | Critique |
| Catalogue formations | ✅ | Critique |
| Vue détail formation (modules, progression) | ✅ | Critique |
| Lecteur vidéo (HTML5 + reprise) | ✅ | Critique |
| Interface quiz (passation + résultat) | ✅ | Critique |
| Profil apprenant (stats, certificats) | ✅ | Haute |
| Page certificat (téléchargement PDF) | ✅ | Moyenne |
| Dashboard admin (stats, inscriptions) | ✅ | Haute |
| Navigation responsive | ✅ | Haute |

---

## Phase 3 — Vidéo & Analytics ✅

| Tâche | Statut | Priorité |
|---|---|---|
| Upload vidéo (admin → stockage local/S3) | ✅ | Critique |
| Pipeline transcodage HLS (uploaded → published) | ✅ | Haute |
| VideoTrack (sous-titres, transcriptions) | ✅ | Moyenne |
| Événements vidéo (play, pause, seek, heartbeat, ended) | ✅ | Haute |
| Progression vidéo (reprise multi-session, seuil 85%) | ✅ | Critique |
| Stats admin (utilisateurs, lectures, complétion) | ✅ | Haute |
| Timeline événements (graphique 14 jours) | ✅ | Moyenne |

---

## Phase 4 — Certificats ✅

| Tâche | Statut | Priorité |
|---|---|---|
| Modèle Certificate + génération numéro KLEIA-YYYY-NNNN | ✅ | Critique |
| API certificats (my, detail, download PDF) | ✅ | Critique |
| Génération PDF (fpdf2) | ✅ | Critique |
| Gestion admin (générer pour un apprenant) | ✅ | Haute |
| Page profil certificats + téléchargement | ✅ | Haute |

---

## Phase 5 — Documentation & Spec 📋

| Tâche | Statut | Priorité |
|---|---|---|
| **spec/backlog/** — Roadmap et priorisation | ✅ | Moyenne |
| **spec/api/** — Spécification complète des endpoints | ✅ | Moyenne |
| **spec/ux/** — Parcours utilisateur et design | ✅ | Moyenne |
| **spec/security/** — Politique de sécurité | ✅ | Moyenne |

---

## Phase 6 — Administration enrichie 📋

| Tâche | Statut | Priorité |
|---|---|---|
| UI admin : création/modification formation (form) | 📋 | Haute |
| UI admin : upload vidéo + gestion | 📋 | Haute |
| UI admin : gestion utilisateurs + inscriptions | 📋 | Haute |
| UI admin : statistiques avancées (graphiques) | 📋 | Moyenne |
| UI admin : gestion quiz (CRUD questions) | 📋 | Haute |

---

## Phase 7 — Accessibilité & Polissage 📋

| Tâche | Statut | Priorité |
|---|---|---|
| Audit WCAG 2.2 (contrastes, focus, aria) | 📋 | Haute |
| Correction accessibilité (lecteur écran, navigation clavier) | 📋 | Haute |
| Tests de non-régression (Playwright) | 📋 | Haute |
| Page 404 personnalisée | 📋 | Basse |
| États vides (empty states) sur toutes les listes | 📋 | Moyenne |
| Transitions et micro-animations | 📋 | Basse |
| Mode hors-ligne (PWA basique) | 💡 | Basse |

---

## Phase 8 — IA & Futur 💡

| Tâche | Statut | Priorité |
|---|---|---|
| Recommandations de formations (collaboratif + contenu) | 💡 | Moyenne |
| Recherche plein texte dans les transcripts vidéo | 💡 | Moyenne |
| Générateur de quiz automatique (LLM) | 💡 | Basse |
| Coach virtuel (chatbot contextuel) | 💡 | Basse |
| Mode B2B (cohortes, invitatsion batch, reporting) | 💡 | Basse |

---

## Priorités V1 (release candidate)

Pour une V1 prête à présenter :

1. ✅ Authentification + catalogue
2. ✅ Navigation formations/modules/leçons
3. ✅ Lecteur vidéo avec reprise
4. ✅ Quiz avec score
5. ✅ Certificats PDF
6. ✅ Dashboard admin basique
7. 📋 UI admin : création formation (form)
8. 📋 Audit WCAG 2.2

# LESSONS — Bug patterns à ne plus reproduire

## 🔴 Pattern 1 : Nom de champ désynchronisé entre schéma et endpoint

**Exemple :** `progress.py` utilisait `data.position_seconds` mais le schéma `VideoProgressUpdate` définit `last_position_seconds`.

**Règle :** Toujours relire le schéma Pydantic avant d'écrire le handler. Si le champ n'existe pas dans le schéma, c'est un bug.

**Détection :** `py_compile` ne détecte pas ça. Il faut un test d'intégration ou un appel réel.

---

## 🔴 Pattern 2 : `str | None = None` sur les champs requis

**Exemple :** `UserCreate.password: str | None = None` → `get_password_hash(None)` crash.

**Règle :** Les champs obligatoires doivent être `str` (pas `| None`). Si le champ est optionnel, le handler DOIT vérifier `is not None` avant de l'utiliser.

**Détection :** Test avec `None` comme valeur d'entrée sur chaque endpoint.

---

## 🔴 Pattern 3 : PostgreSQL-only SQL sur SQLite

**Exemple :** `.nullslast()` dans `quizzes.py` — méthode PostgreSQL, crash sur SQLite.

**Règle :** Toute fonction SQLAlchemy qui n'est pas dans le dialecte standard doit être évitée, ou protégée par un `if dialect.name == 'postgresql'`.

**Détection :** Toujours tester avec SQLite avant de commit, même si la prod est PostgreSQL.

---

## 🔴 Pattern 4 : Types incompatibles entre frontend et backend

**Exemple :** Frontend envoyait `question_type: 'single'` mais le backend attend `'mcq'`.
Frontend envoyait `selected_option_ids: string[]` mais le backend lisait `selected_option` (singulier).

**Règle :** Les types TypeScript du frontend DOIVENT être copiés à partir des schémas Pydantic du backend. Ne jamais inventer des types côté frontend.

**Détection :** Écrire un script qui compare les types TypeScript avec les schémas Pydantic.

---

## 🔴 Pattern 5 : `<button>` imbriqué dans `<Link>`

**Exemple :** `CourseCard.tsx` avait `<Link><Button>...</Button></Link>` — HTML invalide.

**Règle :** `<Link>` et `<button>` ne peuvent pas être imbriqués. Utiliser `<span>` stylisé ou `navigate()` dans un `onClick`.

**Détection :** `tsc -b` ne détecte pas ça. React émet un warning en dev mode uniquement.

---

## 🔴 Pattern 6 : URL endpoint mismatch frontend/backend

**Exemple :** Frontend appelait `/quizzes/{id}/attempts` (pluriel) mais le backend attend `/quizzes/{id}/attempt` (singulier).

**Règle :** Les URLs dans les fichiers API frontend DOIVENT correspondre exactement aux routes FastAPI. Lire `api/v1/*.py` pour vérifier le préfixe exact.

**Détection :** Test E2E ou script de vérification des routes.

---

## 🟠 Pattern 7 : Token refresh non implémenté

**Exemple :** Les tokens JWT expirent mais aucun endpoint `/auth/refresh` n'existait.

**Règle :** Si `create_refresh_token()` existe, `POST /auth/refresh` DOIT exister aussi. Le refresh token seul ne sert à rien sans endpoint.

---

## 🟠 Pattern 8 : Pas de rate limiting sur les endpoints sensibles

**Exemple :** `/auth/login` sans rate limiting → vulnérable au brute-force.

**Règle :** Tout endpoint d'authentification DOIT avoir un rate limiter (même basique en mémoire).

---

## 🟠 Pattern 9 : `response_model` manquant sur les endpoints

**Exemple :** `quizzes.py:submit_attempt` retournait un `dict` sans `response_model` → pas de validation, pas de docs Swagger.

**Règle :** Chaque endpoint qui retourne des données DOIT avoir `response_model=MonSchema`.

---

## 🟠 Pattern 10 : Duplication de code entre pages

**Exemple :** `formatDuration`, `toCardCourse`, `getGradient` dupliqués dans `Dashboard.tsx` et `Courses.tsx`.

**Règle :** Tout utilitaire utilisé dans 2+ fichiers va dans `lib/utils.ts`. Ne jamais copier-coller entre pages.

---

## 🟡 Pattern 11 : `model_validate()` pour les réponses

**Exemple :** `auth.py` retourne `TokenResponse(access_token=..., user=UserProfile.model_validate(user))`. Si le schéma n'accepte pas le champ, Pydantic crash.

**Règle :** Vérifier que le `response_model` déclaré accepte TOUS les champs qu'on lui passe. Ou utiliser `model_dump()` puis filtrer.

---

## 🟡 Pattern 12 : `uuid.UUID` vs `str` dans les schémas

**Exemple :** Les schémas Read avaient `id: uuid.UUID` (correct pour SQLAlchemy), mais les Create/Update avaient `id: str` (devrait être `uuid.UUID` aussi pour validation).

**Règle :** Tous les champs UUID dans tous les schémas doivent être `uuid.UUID`. Pydantic valide et FastAPI sérialise automatiquement.

---

## 🟡 Pattern 13 : Pagination inconsistante

**Exemple :** `list_courses` avait `PaginatedResponse`, mais `list_users` et `list_enrollments` retournaient une liste brute.

**Règle :** Tout endpoint de liste DOIT retourner `PaginatedResponse` avec `items/total/page/page_size/total_pages`.

---

## 🔵 Pattern 14 : Éléments d'UI non fonctionnels

**Exemple :** Boutons "Commencer" avec `onClick={() => {}}`, "Marquer comme terminé" avec `useState` local mais pas d'appel API.

**Règle :** Un bouton qui ne fait rien = bug. Soit il appelle l'API, soit il est retiré.

---

## 📊 Résumé des règles à suivre

1. **Relire le schéma avant le handler** → éviter les champs inexistants
2. **Pas de `| None` sans check** → éviter les crash None
3. **SQL standard uniquement** → pas de PostgreSQL-only sur SQLite
4. **Types frontend = schémas backend** → pas d'invention
5. **HTML valide** → pas de `<button>` dans `<Link>`
6. **URLs exactes** → vérifier les routes backend
7. **Refresh token = endpoint** → indispensable
8. **Rate limit sur auth** → sécurité de base
9. **`response_model` partout** → validation + docs
10. **DRY** → `lib/utils.ts` pour le code partagé
11. **`uuid.UUID` dans tous les schémas** → validation cohérente
12. **Pagination uniforme** → `PaginatedResponse` sur toutes les listes
13. **Boutons fonctionnels ou retirés** → pas de `onClick` vide

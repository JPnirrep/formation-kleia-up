# Politique de sécurité — Plateforme Formations Kleia-up

---

## 1. Authentification

### 1.1 Méthodes supportées
- Email + mot de passe (hash bcrypt via passlib)
- Google OAuth 2.0 (id_token vérifié via google-auth)

### 1.2 JWT
- **Algorithme** : HS256
- **Expiration access token** : 60 minutes (configurable)
- **Expiration refresh token** : 7 jours
- **Stockage côté client** : localStorage (access + refresh)
- **Le refresh token** permet d'obtenir un nouveau access token sans reconnecter
- À la déconnexion, les deux tokens sont supprimés

### 1.3 Sécurité des mots de passe
- Hash : bcrypt (salt automatique, rounds = 12)
- Longueur minimale : 8 caractères (validation frontend + backend)
- Pas d'exigence de complexité arbitraire (focus sur longueur)

### 1.4 Protection des tokens
- Les tokens JWT contiennent uniquement `sub` (user_id) et `exp` (expiration)
- Aucune donnée sensible dans le payload
- Vérification de la signature à chaque requête protégée
- Le backend peut révoquer les refresh tokens (via une blacklist Redis — non implémenté en V1)

---

## 2. Contrôle d'accès

### 2.1 Rôles
| Rôle | Permissions |
|---|---|
| `learner` | Lire formations inscrites, lire leçons, passer quiz, télécharger certificats |
| `trainer` | Tout ce que learner peut faire + créer/modifier formations, modules, leçons, vidéos, quiz |
| `admin` | Tout ce que trainer peut faire + gérer utilisateurs, attribuer inscriptions, modifier rôles |

### 2.2 Vérifications
- **get_current_user** : Token JWT valide → User actif
- **get_current_admin** : get_current_user + rôle == "admin"
- Tous les endpoints hors auth publique utilisent au moins `get_current_user`
- Les endpoints admin vérifient le rôle à chaque appel

### 2.3 Accès aux ressources
- Un utilisateur `learner` ne voit que ses propres certificats, sa progression, ses inscriptions
- Un `admin` voit tout
- Les vidéos non publiées (visibility != "published") ne sont pas accessibles via les endpoints apprenant

---

## 3. Stockage

### 3.1 Base de données
- Dev : SQLite (fichier local)
- Prod : PostgreSQL (recommandé)
- Les mots de passe sont hashés (bcrypt) — jamais en clair
- Les tokens sont signés (HMAC-SHA256) — jamais stockés en base

### 3.2 Fichiers uploadés (vidéos)
- Dev : Stockage sur disque local (`./uploads/`)
- Prod : S3-compatible (object storage)
- Les fichiers sont stockés avec un UUID comme nom (pas le nom original)
- Taille max : 500 Mo par fichier (configurable)
- Types autorisés : mp4, webm, mov, mkv (vérification extension côté backend)
- Accès via endpoint dédié (dev) ou CDN (prod)

### 3.3 Variables sensibles
Toutes les clés et secrets sont dans des variables d'environnement (`.env`) :

```
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

**Le fichier `.env` est dans `.gitignore`** — jamais commité.

---

## 4. Communication

### 4.1 HTTPS
- Dev : HTTP (localhost)
- Prod : HTTPS (TLS 1.2+) via Nginx reverse proxy + Let's Encrypt (Certbot)

### 4.2 CORS
- Origines autorisées : `*` (dev), restreindre en prod au domaine formation.kleia-up.fr
- Headers : Content-Type, Authorization
- Méthodes : GET, POST, PUT, PATCH, DELETE, OPTIONS
- Double couche : CORSMiddleware Starlette + middleware maison ForceCorsMiddleware

### 4.3 Headers de sécurité (à configurer dans Nginx en prod)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. Validation

### 5.1 Validation des entrées
- Tous les endpoints utilisent Pydantic v2 pour la validation des schémas
- Types stricts (UUID, email, int, float, enum)
- Rejet automatique avec code 422 + message d'erreur détaillé
- Upload fichiers : limite de taille (500 Mo), vérification d'extension

### 5.2 Protection contre les injections
- SQLAlchemy ORM : pas de concaténation SQL, tous les paramètres sont bindés
- Aucune utilisation de requêtes SQL brutes
- Les entrées utilisateur ne sont jamais exécutées comme code

---

## 6. Journalisation

### 6.1 Événements métier
- VideoEvent : play, pause, seek, heartbeat, ended (avec timestamp et position)
- Tentatives de quiz (score, réponses)
- Génération de certificats

### 6.2 Événements de sécurité (à implémenter)
- Tentatives de connexion échouées (rate limiting)
- Changements de rôle
- Upload de fichiers
- Actions admin critiques (création/suppression formation)

---

## 7. Rate Limiting (à implémenter)

| Endpoint | Limite | Période |
|---|---|---|
| Login | 5 tentatives | 15 minutes |
| Register | 3 tentatives | 60 minutes |
| API générale | 100 requêtes | 1 minute |
| Upload vidéo | 10 uploads | 1 heure |

---

## 8. Dépendances

Les dépendances critiques sont épinglées avec des versions minimales dans `requirements.txt` :

```
fastapi[standard]>=0.115.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
pydantic[email]>=2.10.0
```

Les dépendances doivent être mises à jour régulièrement (`pip-audit` ou `dependabot`).

---

## 9. Checklist de déploiement production

- [ ] Changer `JWT_SECRET` (clé forte, 256 bits min)
- [ ] Configurer Google OAuth (GOOGLE_CLIENT_ID + SECRET)
- [ ] Configurer S3 (endpoint, bucket, credentials)
- [ ] Restreindre CORS aux domaines autorisés
- [ ] Activer HTTPS (Let's Encrypt)
- [ ] Ajouter les headers de sécurité Nginx
- [ ] Désactiver le mode debug (DEBUG=False)
- [ ] Configurer la base de données PostgreSQL (DATABASE_URL)
- [ ] Supprimer l'endpoint `/uploads` (servir via CDN/S3)
- [ ] Mettre en place le rate limiting (Redis)
- [ ] Activer la journalisation des événements de sécurité

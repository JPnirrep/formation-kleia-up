# Parcours utilisateur & Design — Plateforme Formations Kleia-up

---

## Identité visuelle

| Élément | Valeur |
|---|---|
| **Marque** | Kleia-up — Leadership Organique |
| **Couleur primaire** | Bordeaux `#8B1D3D` (kleia-burgundy) |
| **Couleur secondaire** | Doré `#D4AF37` (kleia-gold) |
| **Foncé** | `#1E1E2E` (kleia-dark) |
| **Gris** | `#6B7280` (kleia-gray) |
| **Succès** | `#10B981` (kleia-success) |
| **Police titres** | `font-heading` (Arial, system sans-serif) |
| **Police corps** | `font-body` (Arial, system sans-serif) |
| **Arrondi cartes** | `rounded-kleia` (12px) |
| **Gradient** | `gradient-burgundy` — bordeaux vers pourpre |

---

## Architecture des pages

```
/ (redirect → /dashboard ou /formations)
├── /login
│   ├── Connexion email
│   └── Connexion Google
├── /dashboard              → Dashboard apprenant
├── /formations             → Catalogue formations
├── /formation/{slug}       → Détail formation (modules + progression)
├── /lecon/{lessonId}       → Lecteur vidéo / Quiz
├── /profil                 → Profil + certificats + paramètres
├── /admin                  → Dashboard admin (stats)
└── /auth/callback          → Callback Google OAuth
```

---

## Parcours 1 : Découverte et inscription

```
1. Arrivée sur la plateforme (non connecté)
   → Page de login : "Connectez-vous à votre espace"
   → Deux options : Email + Google
   → Lien "Pas encore de compte ? Créez-en un"

2. Création de compte (email)
   → Formulaire : email, mot de passe, nom
   → Validation email dès la création
   → Redirection vers dashboard

3. Première connexion
   → Dashboard vide : "Vous n'êtes inscrit à aucune formation"
   → CTA : "Découvrir les formations"
   → Catalogue visible uniquement si l'admin a donné accès
```

## Parcours 2 : Navigation formation

```
1. Dashboard apprenant
   → Carte stats : formations en cours, terminées, heures, certificats
   → Liste des formations (en cours en premier)
   → Activités récentes (timeline verticale)

2. Catalogue formations
   → Grille de cartes (thumbnail coloré, titre, niveau, durée)
   → Filtre par niveau/catégorie
   → Barre de progression si déjà commencée

3. Détail formation
   → Modules dépliables avec progression par module
   → Leçons listées avec icône (video/quiz) et statut
   → Les leçons verrouillées affichent un cadenas
   → Progression globale (barre de progression)
```

## Parcours 3 : Lecture vidéo

```
1. Page leçon (vidéo)
   → Lecteur vidéo (pleine largeur, ratio 16:9)
   → Titre + durée + badge "Vidéo"
   → Transcription (accordéon)
   → Navigation leçon précédente/suivante
   → Bouton "Marquer comme terminé"

2. Comportement lecteur
   → Chargement : spinner sur fond noir
   → Lecture native HTML5 (HLS.js si playlist .m3u8)
   → Contrôles : play/pause, volume, plein écran, sous-titres
   → Timeline en bas à droite (00:00 / 12:30)
   → Heartbeat toutes les 30s (sauvegarde progression)
   → Sauvegarde à la pause, au seek et à la fin

3. Reprise multi-session
   → À l'ouverture, la vidéo reprend à la dernière position
   → Si complétée à 85%+ → "Terminé" visible
```

## Parcours 4 : Quiz

```
1. Page leçon (quiz)
   → Titre + durée + badge "Quiz"
   → Questions affichées une par une ou en liste
   → Types : QCM (radio/checkbox) et Vrai/Faux

2. Passation
   → Sélection des réponses
   → Bouton "Valider" → soumission de la tentative
   → Score immédiat : "80% — Réussi !"
   → Feedback pour chaque question (bonne/mauvaise + explication)

3. Historique
   → Voir les tentatives précédentes (si max_attempts > 1)
   → Meilleur score affiché
```

## Parcours 5 : Certificats

```
1. Obtention
   → Automatique à la complétion de tous les modules
   → Notification dans le fil d'activités
   → Badge "Certificat" sur la formation finie

2. Consultation
   → Page profil → section "Mes certificats"
   → Liste avec titre formation, date, numéro
   → Bouton "Télécharger" → PDF

3. PDF
   → Format paysage A4
   → Bordures bordeaux + doré
   → "Certificat de Complétion"
   → Nom apprenant + titre formation + date + numéro
   → Pied de page : Kleia-up + URL
```

## Parcours 6 : Administration

```
1. Dashboard admin
   → Stats globales : apprenants, formations, inscriptions, lectures
   → Graphique lectures vidéo (14 jours)
   → Tableau inscriptions récentes
   → Boutons d'action rapide

2. Gestion formations
   → Créer/modifier formation (form avec titre, slug, description, niveau)
   → Ajouter modules (titre, description)
   → Ajouter leçons (titre, type vidéo/quiz, durée)
   → Upload vidéo (fichier + titre + ordre)
   → Ajouter quiz (questions QCM/VF)

3. Gestion utilisateurs
   → Liste des utilisateurs avec rôle
   → Changer rôle (learner → trainer)
   → Activer/désactiver un compte
```

---

## États d'interface

### Loading
- Spinner bordeaux centré + texte

### Empty state
- Message clair + icône
- CTA vers l'action suivante
- Ex: "Aucun certificat obtenu pour le moment."

### Error state
- Message en français compréhensible
- Option de réessai (si réseau)

### Edge cases
- Token expiré → redirect /login
- 403 → message "Accès refusé" avec bouton retour
- 404 → page formation non trouvée

---

## Responsive

| Breakpoint | Comportement |
|---|---|
| < 640px (mobile) | Navigation hamburger, grille 1 colonne, cartes empilées |
| 640-1024px (tablette) | Grille 2 colonnes, sidebar réduite |
| > 1024px (desktop) | Grille 3 colonnes, navigation complète |

---

## Accessibilité (cibles WCAG 2.2)

- **Contrastes** : Ratio minimum 4.5:1 pour le texte normal, 3:1 pour les grands textes
- **Focus visible** : Outline 2px sur tous les éléments interactifs
- **ARIA** : `aria-label` sur les boutons sans texte, `role` sur les composants custom
- **Clavier** : Navigation complète au Tab, Enter/Escape sur les modales
- **Images** : `alt` text sur toutes les images
- **Formulaires** : `label` associé à chaque input
- **Annonces** : `aria-live` pour les chargements et erreurs
- **Skip link** : Lien "Aller au contenu" en haut de page

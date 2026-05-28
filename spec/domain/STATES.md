# États et transitions — Plateforme Formations Kleia-up

## États d'une formation (Course.status)

```
draft ──→ published ──→ archived
  ↑           │
  └───────────┘ (republication)
```

- **draft** : Visible uniquement par les trainers/admins. Pas dans le catalogue apprenant.
- **published** : Visible dans le catalogue pour les apprenants inscrits.
- **archived** : Plus visible. Les apprenants déjà inscrits perdent l'accès (ou gardent l'accès selon politique — V1 = perte d'accès).

## États d'une vidéo (VideoAsset.status)

```
uploaded ──→ processing ──→ ready ──→ published
                │                       │
                └──→ failed             └──→ archived
```

- **uploaded** : Fichier source déposé, pas encore traité
- **processing** : Transcodage en cours (HLS, miniature)
- **ready** : Traitement terminé, vidéo prête mais pas encore visible
- **published** : Vidéo disponible pour les apprenants
- **failed** : Échec du traitement (message d'erreur visible dans l'admin)
- **archived** : Vidéo retirée, plus accessible

## États d'une inscription (Enrollment.status)

```
active ──→ completed
  │
  └──→ expired
```

- **active** : Accès en cours à la formation
- **completed** : Formation terminée (tous les modules complétés)
- **expired** : Accès arrivé à expiration (si date définie)

## États de progression leçon (LessonProgress.status)

```
not_started ──→ in_progress ──→ completed
```

## États de progression vidéo

```
non complétée (percent_watched < threshold)
       │
       └──→ complétée (percent_watched >= threshold)
```
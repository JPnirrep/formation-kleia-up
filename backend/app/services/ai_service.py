import json
import os
from typing import Any

import base64
import httpx
from fastapi import HTTPException

# Lire la clé Mistral depuis une variable base64 (contourne le masking shell)
MISTRAL_ENCODED = os.getenv("MISTRAL_ENCODED", "")
if MISTRAL_ENCODED:
    MISTRAL_API_KEY = base64.b64decode(MISTRAL_ENCODED).decode()
else:
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"

SYSTEM_PROMPT = """Tu es un expert en pédagogie et création de formations en ligne pour le Leadership Organique.
Tu génères des structures de formation complètes au format JSON. 
Respecte strictement le format suivant (pas de markdown, pas d'explications, que du JSON) :

{
  "title": "Titre de la formation",
  "slug": "titre-de-la-formation",
  "short_description": "Description courte (1 phrase)",
  "description": "Description complète (2-3 phrases)",
  "level": "debutant|intermediaire|avance",
  "category": "communication|prise de parole|developpement personnel|leadership",
  "modules": [
    {
      "title": "Titre du module",
      "description": "Description du module",
      "order": 1,
      "lessons": [
        {
          "title": "Titre de la leçon",
          "description": "Description courte",
          "lesson_type": "video",
          "order": 1,
          "duration_seconds": 600
        }
      ]
    }
  ]
}

Règles :
- 3 à 6 modules par formation
- 2 à 4 leçons par module
- Les leçons sont de type "video" (on fera les quiz à part)
- duration_seconds : entre 300 et 1200 selon la complexité
- Le slug doit être en kebab-case
- La catégorie doit être parmi : communication, prise de parole, développement personnel, leadership"""


async def generate_course(prompt: str) -> dict[str, Any]:
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="Clé API Mistral non configurée")

    user_prompt = f"Génère une formation complète sur le thème suivant : {prompt}"

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            MISTRAL_API_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
                "response_format": {"type": "json_object"},
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502, detail=f"Erreur Mistral API: {resp.status_code}"
        )

    data = resp.json()
    content = data["choices"][0]["message"]["content"]
    return json.loads(content)


QUIZ_SYSTEM_PROMPT = """Tu es un expert en pédagogie et création de quiz pour formations en ligne.
Génère un quiz QCM au format JSON strict (pas de markdown, pas d'explications).

{
  "title": "Titre du quiz",
  "passing_score_percent": 70,
  "questions": [
    {
      "text": "Question ?",
      "order": 1,
      "question_type": "single",
      "explanation": "Explication de la bonne réponse",
      "points": 10,
      "options": [
        {"label": "A", "text": "Bonne réponse", "is_correct": true},
        {"label": "B", "text": "Mauvaise réponse", "is_correct": false},
        {"label": "C", "text": "Mauvaise réponse", "is_correct": false},
        {"label": "D", "text": "Mauvaise réponse", "is_correct": false}
      ]
    }
  ]
}

Règles :
- Génère exactement 5 questions
- Chaque question a 4 options (A, B, C, D)
- Une seule bonne réponse par question (question_type: "single")
- passing_score_percent: 70 (il faut 4/5 pour passer)
- Les questions doivent être pertinentes par rapport au contenu fourni
- Les mauvaises réponses doivent être plausibles mais clairement incorrectes
- L'explication doit justifier pourquoi la bonne réponse est correcte"""


async def generate_quiz(lesson_title: str, lesson_description: str, course_context: str = "") -> dict[str, Any]:
    """Génère un quiz QCM pour une leçon via l'API Mistral."""
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="Clé API Mistral non configurée")

    context = f"Titre de la leçon : {lesson_title}\n"
    if course_context:
        context += f"Contexte de la formation : {course_context}\n"
    context += f"Contenu de la leçon : {lesson_description}"

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            MISTRAL_API_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": QUIZ_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Génère un quiz pour cette leçon :\n\n{context}"},
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
                "response_format": {"type": "json_object"},
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Erreur Mistral API: {resp.status_code}")

    data = resp.json()
    return json.loads(data["choices"][0]["message"]["content"])

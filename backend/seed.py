"""Seed script — populate the database with realistic test data for local dev."""

import os
import sys

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./kleia_lms.db"

from sqlalchemy import Uuid, JSON, select
from sqlalchemy.dialects import postgresql

# SQLite compatibility: PostgreSQL-specific types don't exist in SQLite.
# This monkey-patch is needed to run the seed script with SQLite during local dev.
try:
    postgresql.UUID = Uuid
    postgresql.JSONB = JSON
except AttributeError:
    pass

import asyncio

from app.database import async_session, engine, Base
from app.models import User, Course, Module, Lesson, Quiz, Question, Certificate
from app.services.auth import get_password_hash


async def seed():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created.")

    async with async_session() as session:
        print("Creating users...")
        clara = User(
            email="clara.f@example.com",
            display_name="Clara Fontaine",
            role="learner",
            password_hash=get_password_hash("password123"),
            is_active=True,
        )
        sandrina = User(
            email="sandrina@kleia-up.com",
            display_name="Sandrina Perrin",
            role="admin",
            password_hash=get_password_hash("admin123"),
            is_active=True,
        )
        admin_user = User(
            email="admin@kleia-up.com",
            display_name="Admin",
            role="admin",
            password_hash=get_password_hash("admin"),
            is_active=True,
        )
        session.add_all([clara, sandrina, admin_user])
        await session.flush()
        print(f"  Created: {clara.display_name} ({clara.email})")
        print(f"  Created: {sandrina.display_name} ({sandrina.email})")

        courses_data = [
            {
                "title": "L'Architecture du Message",
                "slug": "architecture-message",
                "description": "Apprenez à structurer vos messages pour captiver votre audience. Ce cours vous guide pas à pas dans la construction d'une communication claire, impactante et mémorable.",
                "short_description": "Structurez vos messages pour captiver votre audience.",
                "level": "débutant",
                "status": "published",
                "category": "communication",
                "duration_seconds": 5400,
                "created_by": sandrina.id,
                "modules": [
                    {
                        "title": "Les Fondamentaux de la Communication",
                        "description": "Les bases essentielles pour construire un message solide.",
                        "lessons": [
                            (
                                "Introduction à l'architecture du message",
                                "Découvrez pourquoi la structure est la clé d'un message réussi.",
                                480,
                            ),
                            (
                                "Les piliers d'un message percutant",
                                "Identifiez les trois piliers fondamentaux de tout message impactant.",
                                600,
                            ),
                            (
                                "Structurer son discours",
                                "Apprenez les différentes structures narratives et quand les utiliser.",
                                720,
                            ),
                        ],
                    },
                    {
                        "title": "La Clarté du Message",
                        "description": "Rendez votre message limpide pour tout type d'audience.",
                        "lessons": [
                            (
                                "Simplifier sans perdre le fond",
                                "Transformez des idées complexes en messages accessibles.",
                                540,
                            ),
                            (
                                "Le pouvoir des exemples concrets",
                                "Utilisez des exemples pour ancrer votre message dans le réel.",
                                480,
                            ),
                            (
                                "Éviter les pièges de la communication",
                                "Les erreurs courantes qui nuisent à la clarté de votre message.",
                                600,
                            ),
                        ],
                    },
                    {
                        "title": "L'Impact Émotionnel",
                        "description": "Donnez une dimension émotionnelle à votre message pour marquer les esprits.",
                        "lessons": [
                            (
                                "Connecter avec son audience",
                                "Établissez une connexion authentique dès les premières secondes.",
                                660,
                            ),
                            (
                                "Le storytelling comme outil",
                                "Maîtrisez l'art du récit pour rendre votre message inoubliable.",
                                720,
                            ),
                            (
                                "Créer une expérience mémorable",
                                "Concevez des moments forts qui resteront gravés dans les mémoires.",
                                600,
                            ),
                        ],
                    },
                ],
            },
            {
                "title": "L'Incarnation & Le Jour J",
                "slug": "incarnation-jour-j",
                "description": "Préparez-vous mentalement et physiquement à monter sur scène. De la gestion du trac à la présence scénique, ce cours vous prépare à briller le jour J.",
                "short_description": "Préparez-vous à briller sur scène.",
                "level": "intermédiaire",
                "status": "published",
                "category": "prise de parole",
                "duration_seconds": 7200,
                "created_by": sandrina.id,
                "modules": [
                    {
                        "title": "Préparation Mentale",
                        "description": "Les techniques mentales pour aborder sereinement votre intervention.",
                        "lessons": [
                            (
                                "Visualiser le succès",
                                "Utilisez la visualisation pour programmer votre réussite.",
                                480,
                            ),
                            (
                                "Gérer le trac",
                                "Transformez votre stress en énergie positive.",
                                600,
                            ),
                            (
                                "Techniques de respiration",
                                "Maîtrisez votre souffle pour maîtriser votre voix et votre esprit.",
                                420,
                            ),
                            (
                                "Ancrage et présence",
                                "Ancrez-vous dans l'instant présent pour être pleinement disponible.",
                                540,
                            ),
                        ],
                    },
                    {
                        "title": "La Présence Scénique",
                        "description": "Occupez l'espace et captez l'attention par votre présence.",
                        "lessons": [
                            (
                                "Occuper l'espace",
                                "Apprenez à utiliser l'espace scénique à votre avantage.",
                                600,
                            ),
                            (
                                "La gestuelle qui parle",
                                "Utilisez vos mains, votre posture et vos déplacements pour renforcer votre message.",
                                540,
                            ),
                            (
                                "Le regard et la connexion",
                                "Établissez un contact visuel puissant avec chaque personne dans la salle.",
                                480,
                            ),
                        ],
                    },
                    {
                        "title": "L'Art de l'Improvisation",
                        "description": "Sachez rebondir et vous adapter en temps réel.",
                        "lessons": [
                            (
                                "Rebondir sur l'imprévu",
                                "Faites des imprévus vos meilleurs alliés.",
                                540,
                            ),
                            (
                                "Gérer les questions difficiles",
                                "Répondez avec aisance aux questions les plus déstabilisantes.",
                                600,
                            ),
                            (
                                "L'humour en situation",
                                "Utilisez l'humour à bon escient pour détendre l'atmosphère.",
                                480,
                            ),
                        ],
                    },
                ],
            },
            {
                "title": "Le Mindset du Speaker",
                "slug": "mindset-speaker",
                "description": "Développez la mentalité d'un speaker d'exception. Confiance en soi, résilience et quête d'excellence sont au programme de ce cours avancé.",
                "short_description": "Développez la mentalité d'un speaker d'exception.",
                "level": "avancé",
                "status": "published",
                "category": "développement personnel",
                "duration_seconds": 8400,
                "created_by": sandrina.id,
                "modules": [
                    {
                        "title": "La Confiance en Soi",
                        "description": "Construisez une confiance inébranlable en vos capacités.",
                        "lessons": [
                            (
                                "Construire sa légitimité",
                                "Reconnaissez et affirmez votre légitimité à prendre la parole.",
                                540,
                            ),
                            (
                                "Dépasser le syndrome de l'imposteur",
                                "Identifiez et surmontez les pensées qui vous limitent.",
                                600,
                            ),
                            (
                                "L'auto-persuasion positive",
                                "Utilisez le dialogue intérieur pour renforcer votre confiance.",
                                480,
                            ),
                            (
                                "La routine du speaker",
                                "Mettez en place des rituels qui vous préparent au succès.",
                                420,
                            ),
                        ],
                    },
                    {
                        "title": "La Résilience",
                        "description": "Rebondissez après chaque expérience, bonne ou mauvaise.",
                        "lessons": [
                            (
                                "Transformer les échecs en force",
                                "Faites de chaque échec un tremplin vers la réussite.",
                                540,
                            ),
                            (
                                "L'adaptabilité en toutes circonstances",
                                "Restez agile face aux changements et aux imprévus.",
                                600,
                            ),
                            (
                                "Cultiver un mindset de croissance",
                                "Adoptez une mentalité d'apprentissage continu.",
                                480,
                            ),
                        ],
                    },
                    {
                        "title": "L'Excellence Continue",
                        "description": "Ne cessez jamais de progresser et d'élever votre niveau.",
                        "lessons": [
                            (
                                "La pratique délibérée",
                                "Structurez votre entraînement pour des progrès rapides et durables.",
                                600,
                            ),
                            (
                                "Le feedback comme carburant",
                                "Accueillez et utilisez le feedback pour vous améliorer.",
                                480,
                            ),
                            (
                                "L'évolution du speaker",
                                "Tracez votre chemin d'évolution sur le long terme.",
                                540,
                            ),
                            (
                                "Transmettre aux autres",
                                "Devenez mentor et partagez votre expérience avec la prochaine génération.",
                                600,
                            ),
                        ],
                    },
                ],
            },
            {
                "title": "Déployer son Leadership",
                "slug": "deployer-leadership",
                "description": "Développez un leadership authentique qui inspire et mobilise. De la définition de votre style à la mise en action, ce cours vous accompagne dans votre transformation de leader.",
                "short_description": "Développez un leadership authentique et inspirant.",
                "level": "avancé",
                "status": "published",
                "category": "leadership",
                "duration_seconds": 9600,
                "created_by": sandrina.id,
                "modules": [
                    {
                        "title": "Les Fondations du Leadership",
                        "description": "Construisez les bases solides de votre leadership.",
                        "lessons": [
                            (
                                "Définir son style de leadership",
                                "Identifiez le style de leadership qui vous correspond authentiquement.",
                                600,
                            ),
                            (
                                "Leadership et authenticité",
                                "Osez être vous-même pour inspirer durablement.",
                                540,
                            ),
                            (
                                "Inspirer par l'exemple",
                                "Montrez la voie par vos actions, pas seulement par vos paroles.",
                                480,
                            ),
                        ],
                    },
                    {
                        "title": "La Communication du Leader",
                        "description": "Maîtrisez l'art de la communication inspirante.",
                        "lessons": [
                            (
                                "Parler avec autorité et bienveillance",
                                "Trouvez l'équilibre entre fermeté et empathie.",
                                540,
                            ),
                            (
                                "Les réunions qui comptent",
                                "Animez des réunions efficaces qui génèrent de l'engagement.",
                                600,
                            ),
                            (
                                "La communication non-verbale du leader",
                                "Votre corps parle plus fort que vos mots — apprenez à le contrôler.",
                                480,
                            ),
                            (
                                "Donner du feedback puissant",
                                "Formulez des feedbacks qui font grandir sans blesser.",
                                540,
                            ),
                        ],
                    },
                    {
                        "title": "Mobiliser et Fédérer",
                        "description": "Créez une dynamique collective autour de votre vision.",
                        "lessons": [
                            (
                                "Créer une vision partagée",
                                "Articulez une vision qui donne envie de s'engager.",
                                600,
                            ),
                            (
                                "Favoriser l'engagement",
                                "Les leviers pour susciter et maintenir l'engagement de votre équipe.",
                                540,
                            ),
                            (
                                "Gérer les conflits",
                                "Transformez les tensions en opportunités de croissance.",
                                600,
                            ),
                        ],
                    },
                    {
                        "title": "Passer à l'Action",
                        "description": "Mettez en œuvre votre leadership au quotidien.",
                        "lessons": [
                            (
                                "Plan d'action sur 90 jours",
                                "Structurez vos 90 premiers jours en tant que leader.",
                                480,
                            ),
                            (
                                "Mesurer son impact",
                                "Définissez des indicateurs pour mesurer l'impact de votre leadership.",
                                420,
                            ),
                            (
                                "Le leadership en mouvement",
                                "Incarnez votre leadership chaque jour, dans chaque interaction.",
                                540,
                            ),
                        ],
                    },
                ],
            },
        ]

        all_lessons = []
        for cdata in courses_data:
            course = Course(
                title=cdata["title"],
                slug=cdata["slug"],
                description=cdata["description"],
                short_description=cdata["short_description"],
                level=cdata["level"],
                status=cdata["status"],
                category=cdata["category"],
                duration_seconds=cdata["duration_seconds"],
                created_by=cdata["created_by"],
            )
            session.add(course)
            await session.flush()
            print(f"  Created course: {course.title}")

            for m_order, mdata in enumerate(cdata["modules"], start=1):
                module = Module(
                    course_id=course.id,
                    title=mdata["title"],
                    description=mdata["description"],
                    order=m_order,
                )
                session.add(module)
                await session.flush()

                for l_order, (l_title, l_desc, l_dur) in enumerate(
                    mdata["lessons"], start=1
                ):
                    lesson = Lesson(
                        module_id=module.id,
                        title=l_title,
                        description=l_desc,
                        order=l_order,
                        lesson_type="video",
                        duration_seconds=l_dur,
                    )
                    session.add(lesson)
                    await session.flush()
                    all_lessons.append(lesson)
                print(
                    f"    Created module: {module.title} ({len(mdata['lessons'])} lessons)"
                )

        first_lesson = all_lessons[0]
        quiz = Quiz(
            lesson_id=first_lesson.id,
            title="Quiz : Introduction à l'architecture du message",
            passing_score_percent=70,
            max_attempts=3,
        )
        session.add(quiz)
        await session.flush()

        questions = [
            Question(
                quiz_id=quiz.id,
                text="Quel est l'élément le plus important dans un message ?",
                order=1,
                question_type="mcq",
                options=[
                    {"label": "La structure", "value": "structure", "is_correct": True},
                    {"label": "La longueur", "value": "length", "is_correct": False},
                    {"label": "Le vocabulaire", "value": "vocab", "is_correct": False},
                    {"label": "Le support", "value": "medium", "is_correct": False},
                ],
                explanation="La structure est fondamentale car elle donne du sens et guide l'audience à travers votre message.",
                points=2,
            ),
            Question(
                quiz_id=quiz.id,
                text="Combien de piliers fondamentaux composent un message percutant ?",
                order=2,
                question_type="mcq",
                options=[
                    {"label": "2", "value": "2", "is_correct": False},
                    {"label": "3", "value": "3", "is_correct": True},
                    {"label": "4", "value": "4", "is_correct": False},
                    {"label": "5", "value": "5", "is_correct": False},
                ],
                explanation="Trois piliers : la clarté, l'impact émotionnel et la mémorabilité.",
                points=2,
            ),
            Question(
                quiz_id=quiz.id,
                text="Quelle structure narrative est recommandée pour un discours inspirant ?",
                order=3,
                question_type="mcq",
                options=[
                    {"label": "Chronologique", "value": "chrono", "is_correct": False},
                    {
                        "label": "Problème-Solution",
                        "value": "problem",
                        "is_correct": False,
                    },
                    {
                        "label": "Le voyage du héros",
                        "value": "hero",
                        "is_correct": True,
                    },
                    {"label": "Cause à effet", "value": "causal", "is_correct": False},
                ],
                explanation="La structure du voyage du héros est particulièrement puissante pour les discours inspirants car elle crée une résonance émotionnelle.",
                points=3,
            ),
        ]
        session.add_all(questions)
        await session.flush()
        print(f"  Created quiz: {quiz.title} ({len(questions)} questions)")

        # Seed a sample certificate for the admin
        first_course_result = await session.execute(select(Course).limit(1))
        first_course = first_course_result.scalar_one_or_none()
        if first_course:
            admin_result = await session.execute(
                select(User).where(User.email == "sandrina@kleia-up.com")
            )
            admin_user = admin_result.scalar_one_or_none()
            if admin_user:
                cert = Certificate(
                    user_id=admin_user.id,
                    course_id=first_course.id,
                    certificate_number="KLEIA-2025-0047",
                    metadata_json={"seed": True},
                )
                session.add(cert)
                print(f"  Created certificate: {cert.certificate_number}")

        await session.commit()
        print("\nSeed complete!")


async def main():
    await seed()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())

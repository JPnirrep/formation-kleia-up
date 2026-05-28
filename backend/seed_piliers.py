"""
Seed script: populates the database with the 11-pilier structure for
"Leadership & Affirmation de Soi" course.

Usage:
    cd backend && .venv/bin/python seed_piliers.py
"""

import asyncio
import sys

import bcrypt
from sqlalchemy import select

# Ensure the backend package is importable
sys.path.insert(0, ".")

from app.database import Base, async_session, engine
from app.models.base import TimestampMixin
from app.models import User, Course, Module, Lesson, VideoAsset

# ── 11 Piliers ──────────────────────────────────────────────────────────────
PILIERS = [
    # (title, order, lessons: [(lesson_title, duration_seconds, video_filename or None), ...])
    (
        "Pilier 1 : Fondations du leadership authentique",
        1,
        [
            ("Introduction au leadership authentique", 35, "MVI_2114"),
            ("Les piliers du leadership", 74, "MVI_2122"),
            ("Auto-évaluation du leader", 52, "MVI_2131"),
        ],
    ),
    (
        "Pilier 2 : Confiance en soi et posture de leader",
        2,
        [
            ("Développer sa confiance en soi", 43, "MVI_2133"),
            ("La posture du leader affirmé", 120, "MVI_2118"),
        ],
    ),
    (
        "Pilier 3 : Intelligence émotionnelle",
        3,
        [
            ("Comprendre ses émotions", 53, "MVI_2134"),
            ("Gérer les émotions des autres", 90, None),
        ],
    ),
    (
        "Pilier 4 : Communication impactante",
        4,
        [
            ("L'art de la communication assertive", 120, None),
            ("Parler en public avec aisance", 90, None),
        ],
    ),
    (
        "Pilier 5 : Prise de décision",
        5,
        [
            ("Décider avec clarté et confiance", 75, None),
        ],
    ),
    (
        "Pilier 6 : Gestion des conflits",
        6,
        [
            ("Résoudre les conflits avec diplomatie", 90, None),
            ("Transformer les tensions en opportunités", 60, None),
        ],
    ),
    (
        "Pilier 7 : Motivation et engagement d'équipe",
        7,
        [
            ("Inspirer et motiver son équipe", 85, None),
        ],
    ),
    (
        "Pilier 8 : Vision et stratégie",
        8,
        [
            ("Définir une vision inspirante", 70, None),
            ("Passer de la vision à la stratégie", 65, None),
        ],
    ),
    (
        "Pilier 9 : Leadership éthique",
        9,
        [
            ("Les fondements du leadership éthique", 80, None),
        ],
    ),
    (
        "Pilier 10 : Résilience et gestion du stress",
        10,
        [
            ("Cultiver sa résilience", 95, None),
            ("Techniques de gestion du stress", 60, None),
        ],
    ),
    (
        "Pilier 11 : Leadership transformationnel",
        11,
        [
            ("Devenir un leader transformationnel", 100, None),
        ],
    ),
]

ADMIN_EMAIL = "admin@kleia-up.fr"
ADMIN_PASSWORD = "admin123"
ADMIN_NAME = "Admin Kleia"

COURSE_TITLE = "Leadership & Affirmation de Soi"
COURSE_SLUG = "leadership-affirmation"
COURSE_DESC = (
    "Un parcours complet en 11 piliers pour développer votre leadership "
    "authentique et affirmer votre posture de leader. De la confiance en soi "
    "à la vision stratégique, chaque pilier vous apporte des outils concrets "
    "et des mises en pratique immédiates."
)
COURSE_SHORT_DESC = "11 piliers pour un leadership authentique et affirmé."


async def seed() -> None:
    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # ── 1. Upsert admin user ────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        admin = result.scalar_one_or_none()

        if admin is None:
            pwd_hash = bcrypt.hashpw(
                ADMIN_PASSWORD.encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8")
            admin = User(
                email=ADMIN_EMAIL,
                display_name=ADMIN_NAME,
                role="admin",
                password_hash=pwd_hash,
            )
            db.add(admin)
            await db.flush()
            print(f"✅ Created admin user: {ADMIN_EMAIL}")
        else:
            print(f"ℹ️  Admin user already exists: {ADMIN_EMAIL}")

        # ── 2. Upsert course ────────────────────────────────────────────
        result = await db.execute(
            select(Course).where(Course.slug == COURSE_SLUG)
        )
        course = result.scalar_one_or_none()

        if course is None:
            total_duration = sum(
                d for _, _, lessons in PILIERS for _, d, _ in lessons
            )
            course = Course(
                title=COURSE_TITLE,
                slug=COURSE_SLUG,
                description=COURSE_DESC,
                short_description=COURSE_SHORT_DESC,
                duration_seconds=total_duration,
                level="tous niveaux",
                status="published",
                category="Leadership",
                created_by=admin.id,
            )
            db.add(course)
            await db.flush()
            print(f"✅ Created course: {COURSE_TITLE}")
        else:
            print(f"ℹ️  Course already exists: {COURSE_TITLE}")

        # ── 3. Upsert modules + lessons + video assets ──────────────────
        for pilier_title, order, lessons_data in PILIERS:
            result = await db.execute(
                select(Module).where(
                    Module.course_id == course.id,
                    Module.order == order,
                )
            )
            module = result.scalar_one_or_none()

            if module is None:
                module = Module(
                    course_id=course.id,
                    title=pilier_title,
                    order=order,
                )
                db.add(module)
                await db.flush()
                print(f"   📦 Module: {pilier_title}")
            else:
                print(f"   ℹ️  Module already exists: {pilier_title}")

            for lesson_order, (lesson_title, duration, video_fn) in enumerate(
                lessons_data, start=1
            ):
                result = await db.execute(
                    select(Lesson).where(
                        Lesson.module_id == module.id,
                        Lesson.order == lesson_order,
                    )
                )
                lesson = result.scalar_one_or_none()

                if lesson is None:
                    lesson = Lesson(
                        module_id=module.id,
                        title=lesson_title,
                        order=lesson_order,
                        lesson_type="video",
                        duration_seconds=duration,
                    )
                    db.add(lesson)
                    await db.flush()

                    # Create VideoAsset
                    video_title = (
                        f"{video_fn} - {lesson_title}"
                        if video_fn
                        else f"Vidéo - {lesson_title}"
                    )
                    video_asset = VideoAsset(
                        lesson_id=lesson.id,
                        title=video_title,
                        order=1,
                        source_storage_key=(
                            f"videos/{video_fn}.mp4" if video_fn else None
                        ),
                        duration_seconds=duration,
                        status="uploaded" if video_fn else "pending",
                        language="fr",
                        visibility="published",
                        created_by=admin.id,
                    )
                    db.add(video_asset)
                    icon = "🎬" if video_fn else "⏳"
                    print(f"      {icon} Lesson: {lesson_title} ({duration}s)")
                else:
                    print(f"      ℹ️  Lesson already exists: {lesson_title}")

        await db.commit()
        print("\n🎉 Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())

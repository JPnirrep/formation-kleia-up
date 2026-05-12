"""Admin analytics routes — aggregated stats and event data."""

import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.user import User
from app.models.video import VideoEvent, VideoProgress

router = APIRouter(dependencies=[Depends(get_current_admin)])


@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
):
    """Aggregated platform statistics for the admin dashboard."""
    # Total users (learners)
    user_count_stmt = select(func.count(User.id)).where(User.role == "learner")
    user_count = (await db.execute(user_count_stmt)).scalar() or 0

    # Total courses (published)
    course_count_stmt = select(func.count(Course.id)).where(
        Course.status == "published"
    )
    course_count = (await db.execute(course_count_stmt)).scalar() or 0

    # Total enrollments
    enrollment_count_stmt = select(func.count(Enrollment.id))
    enrollment_total = (await db.execute(enrollment_count_stmt)).scalar() or 0

    # Active enrollments
    active_stmt = select(func.count(Enrollment.id)).where(Enrollment.status == "active")
    active_enrollments = (await db.execute(active_stmt)).scalar() or 0

    # Video plays
    plays_stmt = select(func.count(VideoEvent.id)).where(
        VideoEvent.event_type == "play"
    )
    total_plays = (await db.execute(plays_stmt)).scalar() or 0

    # Unique viewers
    viewers_stmt = select(func.count(func.distinct(VideoEvent.user_id))).where(
        VideoEvent.event_type == "play"
    )
    unique_viewers = (await db.execute(viewers_stmt)).scalar() or 0

    # Total video completions
    completed_stmt = select(func.count(VideoProgress.id)).where(
        VideoProgress.completed == True
    )
    total_completed = (await db.execute(completed_stmt)).scalar() or 0

    # Total video progress records
    progress_total_stmt = select(func.count(VideoProgress.id))
    progress_total = (await db.execute(progress_total_stmt)).scalar() or 0

    completion_rate = (
        round(total_completed / progress_total * 100, 1) if progress_total > 0 else 0
    )

    # Total watch time (sum of max_position_seconds)
    watch_stmt = select(func.coalesce(func.sum(VideoProgress.max_position_seconds), 0))
    total_watch_seconds = (await db.execute(watch_stmt)).scalar() or 0

    return {
        "total_users": user_count,
        "total_courses": course_count,
        "total_enrollments": enrollment_total,
        "active_enrollments": active_enrollments,
        "total_video_plays": total_plays,
        "unique_viewers": unique_viewers,
        "total_video_completions": total_completed,
        "completion_rate_percent": completion_rate,
        "total_watch_time_seconds": total_watch_seconds,
    }


@router.get("/stats/events")
async def get_event_stats(
    days: int = 14,
    db: AsyncSession = Depends(get_db),
):
    """Event counts per day for the last N days for chart rendering."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    stmt = (
        select(
            func.date(VideoEvent.occurred_at).label("day"),
            VideoEvent.event_type,
            func.count(VideoEvent.id).label("count"),
        )
        .where(VideoEvent.occurred_at >= since)
        .group_by(func.date(VideoEvent.occurred_at), VideoEvent.event_type)
        .order_by("day", VideoEvent.event_type)
    )
    result = await db.execute(stmt)
    rows = result.all()

    # Build a timeline with zero-filled days
    timeline = []
    for i in range(days):
        day = (since + timedelta(days=i)).strftime("%Y-%m-%d")
        timeline.append(
            {
                "date": day,
                "play": 0,
                "heartbeat": 0,
                "pause": 0,
                "seek": 0,
                "ended": 0,
            }
        )

    for row in rows:
        day_str = str(row.day)
        for entry in timeline:
            if entry["date"] == day_str:
                entry[row.event_type] = entry.get(row.event_type, 0) + row.count
                break

    return {"timeline": timeline, "total_events": sum(r.count for r in rows)}

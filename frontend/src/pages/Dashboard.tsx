import { useState, useEffect, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import Courses from '@/pages/Courses';
import { useApi } from '@/hooks/useApi';
import { getMyEnrollments } from '@/api/enrollments';
import { getCourses } from '@/api/courses';
import { isAuthenticated } from '@/api/client';
import { useAuth } from '@/context/AuthContext';
import { GamificationContext } from '@/context/GamificationContext';
import StreakWidget from '@/components/gamification/StreakWidget';
import PointsBadge from '@/components/gamification/PointsBadge';
import type { Course } from '@/api/courses';
import { getCourseGradient } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuth = isAuthenticated();

  useEffect(() => { document.title = 'Tableau de bord — Kleia-up'; }, []);

  const { data: enrollments, loading: enrollmentsLoading, error: enrollmentsError } = useApi(
    () => getMyEnrollments(),
    [isAuth],
  );

  const { data: allCourses, loading: coursesLoading, error: coursesError } = useApi(
    () => getCourses({ limit: 50 }),
    [],
  );

  const [enrolledCourses, setEnrolledCourses] = useState<(Course & { progress?: number })[]>([]);

  // Gamification : contexte safe (pas de try/catch sur les hooks — casse React StrictMode)
  const gamificationCtx = useContext(GamificationContext);
  const gamification = gamificationCtx?.gamification ?? null;

  useEffect(() => {
    if (enrollments && allCourses) {
      const courseMap = new Map(allCourses.items.map(c => [c.id, c]));
      setEnrolledCourses(
        enrollments
          .map(e => {
            const course = courseMap.get(e.course_id);
            return course ? { ...course, progress: e.progress || 0 } : null;
          })
          .filter(Boolean) as (Course & { progress?: number })[],
      );
    }
  }, [enrollments, allCourses]);

  const displayCourses = enrolledCourses;
  const inProgress = displayCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
  const completedCount = displayCourses.filter(c => (c.progress || 0) >= 100).length;
  const totalHours = Math.round(displayCourses.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / 3600);

  const stats = [
    { label: 'En cours', value: inProgress.length.toString() },
    { label: 'Terminées', value: completedCount.toString() },
    { label: 'Heures', value: totalHours.toString() + 'h' },
    { label: 'Points', value: gamification ? `${gamification.points} pts` : '-' },
  ];

  const firstName = user?.display_name?.split(' ')[0] || user?.email?.split('@')[0] || 'apprenant';

  const isLoading = enrollmentsLoading || coursesLoading;
  const error = enrollmentsError || coursesError;

  if (isLoading) {
    return <Loading testId="dashboard-loading" className="py-20" text="Chargement du tableau de bord..." />;
  }

  return (
    <div data-testid="dashboard-content" className="max-w-5xl mx-auto space-y-12 py-8 px-4 sm:px-6 lg:px-8">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-body text-center"
        >
          {error}
        </div>
      )}

      <section className="text-center space-y-4">
        <h1 data-testid="dashboard-title" className="text-4xl md:text-5xl font-extrabold font-heading text-kleia-violet">
          Ton Incarnation, {firstName}
        </h1>
        <p className="text-lg text-kleia-gray font-body max-w-2xl mx-auto italic">
          Chaque étape est une pierre posée pour ton leadership organique.
        </p>
      </section>

      <div data-testid="dashboard-stats" className="flex justify-around items-center border-y border-kleia-dark/10 py-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold font-heading text-kleia-dark">{stat.value}</div>
            <div className="text-xs uppercase tracking-wider text-kleia-gray mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {gamification && (
        <div className="flex justify-center items-center gap-6 -mt-6">
          <StreakWidget streakDays={gamification.streak_days} />
          <PointsBadge
            points={gamification.points}
            level={gamification.level}
            levelNumber={gamification.level_number}
          />
        </div>
      )}

      {displayCourses.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold font-heading text-kleia-dark mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-kleia-violet" />
            Ton Parcours
          </h2>
          <div data-testid="dashboard-courses" className="flex gap-8 overflow-x-auto pb-4">
            {displayCourses.map((course, i) => {
              const gradient = getCourseGradient(course.level);
              return (
                <div
                  key={course.slug}
                  role="button"
                  tabIndex={0}
                  className="flex-shrink-0 w-64 bg-white border border-kleia-dark/5 p-6 rounded-kleia shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/formation/${course.slug}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/formation/${course.slug}`); } }}
                  aria-label={`Accéder à la formation ${course.title}`}
                >
                  <span className="text-sm text-kleia-gray font-body">Module {i + 1}</span>
                  <h3 className="font-heading font-bold text-lg mt-2 text-kleia-dark">{course.title}</h3>
                  <div className="mt-4 h-2 w-full bg-kleia-dark/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-kleia-violet rounded-full transition-all duration-500"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-xl font-bold font-heading text-kleia-dark mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-kleia-violet" />
            Ton Parcours
          </h2>
          <EmptyState
            title="Aucune formation en cours"
            description="Inscrivez-vous à une formation depuis le catalogue pour débuter votre parcours."
            icon="empty"
            actionLabel="Voir le catalogue"
            onAction={() => navigate('/formations')}
          />
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-kleia-violet" />
          Catalogue
        </h2>
        <Courses />
      </section>
    </div>
  );
}

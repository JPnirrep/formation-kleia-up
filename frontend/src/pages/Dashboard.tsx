import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CourseCard from '@/components/course/CourseCard';
import Loading from '@/components/ui/Loading';
import { mockUser, mockCourses, mockActivities, getStartedCourses, getCompletedCourses } from '@/mock';
import { useApi } from '@/hooks/useApi';
import { getMyEnrollments } from '@/api/enrollments';
import { getCourses } from '@/api/courses';
import { isAuthenticated } from '@/api/client';
import { toCardCourse } from '@/lib/utils';
import type { Course } from '@/api/courses';

const activityColors: Record<string, string> = {
  completed: 'bg-kleia-success',
  started: 'bg-kleia-gold',
  certificate: 'bg-kleia-burgundy',
  quiz: 'bg-blue-500',
};

const activityIcons: Record<string, string> = {
  completed: '\u2713',
  started: '\u25B6',
  certificate: '\u2605',
  quiz: '\u2699',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('kleia-onboarding-shown'),
  );
  const isAuth = isAuthenticated();
  const { data: enrollments } = useApi(() => getMyEnrollments(), [isAuth]);
  const { data: allCourses } = useApi(() => getCourses({ limit: 50 }), []);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const mockStarted = getStartedCourses().slice(0, 3);
  const mockCompletedCount = getCompletedCourses().length;
  const mockTotalHours = mockCourses.reduce((acc, c) => {
    const h = parseInt(c.duration);
    return acc + (isNaN(h) ? 0 : h);
  }, 0);

  useEffect(() => {
    if (enrollments && enrollments.length > 0 && allCourses) {
      setLoadingCourses(true);
      const courseMap = new Map(allCourses.items.map(c => [c.id, c]));
      const enrolled: Course[] = [];
      for (const e of enrollments) {
        const c = courseMap.get(e.course_id);
        if (c) enrolled.push(c);
      }
      setEnrolledCourses(enrolled);
      setLoadingCourses(false);
    }
  }, [enrollments, allCourses]);

  const displayCourses = isAuth && enrolledCourses.length > 0 ? enrolledCourses : mockStarted;
  const inProgress = displayCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
  const completedCount = isAuth
    ? displayCourses.filter(c => (c.progress || 0) >= 100).length
    : mockCompletedCount;
  const totalHours = isAuth
    ? Math.round(displayCourses.reduce((acc, c) => acc + ((c as any).duration_seconds || parseInt((c as any).duration) * 3600 || 0), 0) / 3600)
    : mockTotalHours;

  const stats = [
    { label: 'Formations en cours', value: inProgress.length.toString(), icon: '\uD83D\uDCDA', color: 'from-kleia-burgundy to-kleia-burgundy' },
    { label: 'Terminées', value: completedCount.toString(), icon: '\u2714\uFE0F', color: 'from-kleia-success to-kleia-dark' },
    { label: 'Heures visionnées', value: totalHours.toString() + 'h', icon: '\uD83D\uDD52', color: 'from-kleia-gold to-kleia-gold' },
    { label: 'Certificats', value: mockUser.role === 'admin' ? '—' : '1', icon: '\uD83C\uDFC6', color: 'from-blue-600 to-kleia-burgundy' },
  ];

  const dismissOnboarding = () => {
    localStorage.setItem('kleia-onboarding-shown', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="space-y-8">
      {showOnboarding && (
        <Card className="relative overflow-hidden border-2 border-transparent bg-gradient-to-br from-kleia-burgundy/5 via-white to-kleia-gold/5 rounded-kleia">
          <div className="absolute inset-0 rounded-kleia bg-gradient-to-r from-kleia-burgundy to-kleia-gold p-[2px] -m-[2px] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold font-heading text-kleia-burgundy">
                Bienvenue sur Kleia-up !
              </h2>
              <p className="text-kleia-gray font-body mt-1">
                Votre plateforme d'apprentissage pour développer votre leadership et votre communication.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/formations')}
                className="py-2 px-4 rounded-lg gradient-burgundy text-white font-semibold text-sm font-heading hover:opacity-90 transition-opacity"
              >
                Découvrir les formations
              </button>
              <button
                onClick={dismissOnboarding}
                className="py-2 px-4 rounded-lg border border-kleia-dark/20 text-kleia-gray font-medium text-sm font-heading hover:bg-kleia-dark/5 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </Card>
      )}
      <div className="glass p-6 md:p-8 bg-gradient-to-r from-kleia-burgundy/5 via-transparent to-kleia-gold/5 rounded-kleia border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-burgundy">
              Bonjour, {mockUser.name.split(' ')[0]}
            </h1>
            <p className="text-kleia-gray font-body mt-1">
              Bienvenue sur votre espace d'apprentissage. Continuez à progresser !
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full gradient-burgundy flex items-center justify-center text-white text-xl font-bold font-heading shadow-md">
              {mockUser.initials}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-bold font-heading text-kleia-dark">{stat.value}</p>
                <p className="text-sm text-kleia-gray font-body mt-1">{stat.label}</p>
              </div>
              <span className="text-2xl" aria-hidden="true">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-heading text-kleia-dark">
            Mes formations en cours
          </h2>
          <Badge variant="info">{inProgress.length}</Badge>
        </div>
        {loadingCourses ? (
          <Loading className="py-8" size="sm" text="Chargement..." />
        ) : inProgress.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {inProgress.map((course) => (
              <div key={course.slug} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                <CourseCard course={{ ...toCardCourse(course as any), lessonCount: course.lessons }} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-kleia-gray font-body text-center py-4">
              Aucune formation en cours. <Link to="/formations" className="text-kleia-burgundy font-medium underline underline-offset-2">Explorer les formations</Link>
            </p>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold font-heading text-kleia-dark mb-4">
          Activité récente
        </h2>
        <Card>
          <div className="space-y-0">
            {mockActivities.slice(0, 5).map((activity, idx) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full ${activityColors[activity.type] || 'bg-kleia-gray'} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}
                    aria-label={activity.type}
                  >
                    {activityIcons[activity.type] || '•'}
                  </div>
                  {idx < Math.min(mockActivities.length, 5) - 1 && (
                    <div className="w-px flex-1 bg-kleia-dark/10 mt-1" />
                  )}
                </div>
                <div className="pb-6 pt-0.5">
                  <p className="text-sm font-medium text-kleia-dark font-body">{activity.description}</p>
                  <p className="text-xs text-kleia-gray font-body mt-0.5">
                    {new Date(activity.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {activity.courseName ? `— ${activity.courseName}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

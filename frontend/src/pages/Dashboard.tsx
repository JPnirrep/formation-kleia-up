import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CourseCard from '@/components/course/CourseCard';
import { mockUser, mockCourses, mockActivities, getStartedCourses, getCompletedCourses, getCourseBySlug } from '@/mock';

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
  const startedCourses = getStartedCourses().slice(0, 3);
  const completedCount = getCompletedCourses().length;
  const totalHours = mockCourses.reduce((acc, c) => {
    const h = parseInt(c.duration);
    return acc + (isNaN(h) ? 0 : h);
  }, 0);

  const stats = [
    { label: 'Formations en cours', value: startedCourses.length.toString(), icon: '\uD83D\uDCDA', color: 'from-kleia-burgundy to-purple-700' },
    { label: 'Terminées', value: completedCount.toString(), icon: '\u2714\uFE0F', color: 'from-kleia-success to-emerald-600' },
    { label: 'Heures visionnées', value: totalHours.toString() + 'h', icon: '\uD83D\uDD52', color: 'from-kleia-gold to-amber-600' },
    { label: 'Certificats', value: mockUser.role === 'admin' ? '—' : '1', icon: '\uD83C\uDFC6', color: 'from-blue-600 to-indigo-700' },
  ];

  return (
    <div className="space-y-8">
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
          <Badge variant="info">{startedCourses.length}</Badge>
        </div>
        {startedCourses.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
            {startedCourses.map((course) => (
              <div key={course.id} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                <CourseCard course={course} variant="compact" />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <p className="text-kleia-gray font-body text-center py-4">
              Aucune formation en cours. <a href="/formations" className="text-kleia-burgundy font-medium underline underline-offset-2">Explorer les formations</a>
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

import { useState } from 'react';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import CourseCard from '@/components/course/CourseCard';
import Loading from '@/components/ui/Loading';
import { useApi } from '@/hooks/useApi';
import { getCourses } from '@/api/courses';
import { toCardCourse } from '@/lib/utils';

type FilterTab = 'all' | 'in_progress' | 'completed';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
];

export default function Courses() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const { data, loading, error } = useApi(() => getCourses({ limit: 50 }), []);

  if (loading) {
    return <Loading className="py-20" text="Chargement des formations..." />;
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">
          Impossible de charger les formations. Veuillez réessayer plus tard.
        </p>
      </Card>
    );
  }

  const courses = data?.items || [];

  const filtered = courses.filter((c) => {
    const progress = c.progress || 0;
    if (activeTab === 'in_progress') return progress > 0 && progress < 100;
    if (activeTab === 'completed') return progress === 100;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-burgundy">
          Mes formations
        </h1>
        <p className="text-kleia-gray font-body mt-1">
          {courses.length} formations disponibles
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-4 py-2 rounded-kleia text-sm font-heading font-semibold transition-all',
              activeTab === tab.key
                ? 'gradient-burgundy text-white shadow-md'
                : 'bg-white/50 text-kleia-gray hover:text-kleia-burgundy hover:bg-white/80 border border-kleia-dark/10',
            )}
            aria-pressed={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={toCardCourse(course)} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3" aria-hidden="true">📭</div>
          <p className="text-kleia-gray font-body text-lg">Aucune formation trouvée</p>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="mt-2 text-kleia-burgundy font-heading font-semibold text-sm underline underline-offset-2 hover:text-kleia-burgundy-light"
            >
              Voir toutes les formations
            </button>
          )}
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import CourseCard from '@/components/course/CourseCard';
import { mockCourses } from '@/mock';

type FilterTab = 'all' | 'in_progress' | 'completed';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminées' },
];

export default function Courses() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = mockCourses.filter((c) => {
    if (activeTab === 'in_progress') return c.progress > 0 && c.progress < 100;
    if (activeTab === 'completed') return c.progress === 100;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-burgundy">
          Mes formations
        </h1>
        <p className="text-kleia-gray font-body mt-1">
          {mockCourses.length} formations disponibles
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
            <CourseCard key={course.id} course={course} />
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

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getCourseBySlug, getModulesByCourse, getProgressForCourse } from '@/mock';
import type { MockLesson } from '@/mock';

const typeIcons: Record<string, string> = {
  video: '▶',
  quiz: '✎',
  certificate: '★',
};

const statusLabels: Record<string, string> = {
  not_started: 'Pas commencé',
  in_progress: 'En cours',
  completed: 'Terminé',
  locked: 'Verrouillé',
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const course = getCourseBySlug(slug || 'branding-personnel');
  const [expandedModule, setExpandedModule] = useState<string | null>('mod-1');

  if (!course) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Formation introuvable</p>
        <Link to="/formations" className="text-kleia-burgundy font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  const modules = getModulesByCourse(course.id);
  const progress = getProgressForCourse(course.id);
  const completedCount = progress?.completedLessons.length ?? 0;
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : course.progress;

  const toggleModule = (modId: string) => {
    setExpandedModule(expandedModule === modId ? null : modId);
  };

  const LessonRow = ({ lesson }: { lesson: MockLesson }) => {
    const isLocked = lesson.status === 'locked';
    const statusColor = lesson.status === 'completed' ? 'text-kleia-success' : lesson.status === 'in_progress' ? 'text-kleia-gold' : 'text-kleia-gray';

    return (
      <Link
        to={isLocked ? '#' : `/lecon/${lesson.id}`}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-kleia-dark/5',
          lesson.status === 'in_progress' && 'bg-kleia-gold/5 border border-kleia-gold/20',
        )}
        onClick={(e) => { if (isLocked) e.preventDefault(); }}
        aria-disabled={isLocked}
      >
        <span className={clsx('text-sm w-6 text-center', statusColor)} aria-hidden="true">
          {isLocked ? '🔒' : typeIcons[lesson.type] || '•'}
        </span>
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium font-body truncate', isLocked ? 'text-kleia-gray' : 'text-kleia-dark')}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-kleia-gray">{lesson.duration}</span>
            {lesson.type === 'quiz' && <Badge variant="warning">Quiz</Badge>}
            {lesson.type === 'certificate' && <Badge variant="success">Certificat</Badge>}
          </div>
        </div>
        <Badge variant={lesson.status === 'completed' ? 'success' : lesson.status === 'in_progress' ? 'warning' : 'default'}>
          {statusLabels[lesson.status]}
        </Badge>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className={clsx(
        'rounded-kleia p-6 md:p-10 bg-gradient-to-br',
        course.thumbnailColor,
        'text-white',
      )}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="info">{course.level}</Badge>
          <span className="text-white/70 text-sm">•</span>
          <span className="text-white/70 text-sm">{course.duration}</span>
          <span className="text-white/70 text-sm">•</span>
          <span className="text-white/70 text-sm">{course.category}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-heading mb-2">{course.title}</h1>
        <p className="text-white/80 font-body max-w-2xl">{course.description}</p>
        <p className="text-white/60 text-sm mt-3 font-body">Par {course.instructor}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-kleia-dark font-heading">Progression globale</span>
          <span className="text-sm font-bold font-heading text-kleia-burgundy">{overallProgress}%</span>
        </div>
        <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full gradient-burgundy rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold font-heading text-kleia-dark">Contenu de la formation</h2>
          {modules.map((mod) => (
            <Card key={mod.id} className="p-0 overflow-hidden">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-kleia-dark/5 transition-colors"
                aria-expanded={expandedModule === mod.id}
              >
                <div>
                  <h3 className="font-heading font-bold text-kleia-dark">{mod.title}</h3>
                  <p className="text-xs text-kleia-gray font-body mt-0.5">
                    {mod.lessons.filter(l => l.status === 'completed').length}/{mod.lessons.length} leçons
                  </p>
                </div>
                <svg
                  className={clsx('w-5 h-5 text-kleia-gray transition-transform', expandedModule === mod.id && 'rotate-180')}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedModule === mod.id && (
                <div className="border-t border-kleia-dark/10 px-2 py-2 space-y-1">
                  {mod.lessons.map((lesson) => (
                    <LessonRow key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-3">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Catégorie</span>
                <span className="font-medium text-kleia-dark font-body">{course.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Durée totale</span>
                <span className="font-medium text-kleia-dark font-body">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Leçons</span>
                <span className="font-medium text-kleia-dark font-body">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Niveau</span>
                <Badge variant="info">{course.level}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Formateur</span>
                <span className="font-medium text-kleia-dark font-body">{course.instructor}</span>
              </div>
            </div>
          </Card>
          {overallProgress > 0 && overallProgress < 100 && (
            <Button variant="secondary" className="w-full" onClick={() => {}}>
              Continuer la formation
            </Button>
          )}
          {overallProgress === 0 && (
            <Button variant="primary" className="w-full" onClick={() => {}}>
              Commencer la formation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

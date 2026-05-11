import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useApi } from '@/hooks/useApi';
import { getCourse } from '@/api/courses';
import type { CourseDetail as CourseDetailType, Module, Lesson } from '@/api/courses';
import { getLessonById, mockCourses, getModulesByCourse, getProgressForCourse } from '@/mock';

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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

const gradients: Record<string, string> = {
  'Débutant': 'from-[#7C3AED] to-[#A78BFA]',
  'Intermédiaire': 'from-[#EC4899] to-[#F472B6]',
  'Avancé': 'from-[#F59E0B] to-[#FBBF24]',
};

function getGradient(level: string): string {
  return gradients[level] || 'from-[#10B981] to-[#34D399]';
}

function deriveStatus(lessonId: string): 'not_started' | 'in_progress' | 'completed' | 'locked' {
  const mockLesson = getLessonById(lessonId);
  return mockLesson?.status || 'not_started';
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, loading, error } = useApi(() => getCourse(slug || ''), [slug]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const navigate = useNavigate();

  if (loading) {
    return <Loading className="py-20" text="Chargement de la formation..." />;
  }

  if (error || !course) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Formation introuvable</p>
        <Link to="/formations" className="text-kleia-burgundy font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  const modules = course.modules || [];
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  const totalDurationSeconds = modules.reduce((acc, m) =>
    acc + (m.lessons || []).reduce((s, l) => s + l.duration_seconds, 0), 0);

  const mockCourse = mockCourses.find(c => c.slug === slug);
  const mockProgress = slug ? getProgressForCourse(mockCourse?.id || '') : 0;
  const overallProgress = course.progress || mockProgress;

  const allLessons = useMemo(() =>
    modules.flatMap(m => m.lessons || []),
    [modules]
  );
  const firstUncompleted = allLessons.find(l => {
    const status = deriveStatus(l.id);
    return status === 'not_started' || status === 'in_progress';
  });
  const allCompleted = allLessons.length > 0 && !firstUncompleted;

  const handleStart = () => {
    if (firstUncompleted) navigate(`/lecon/${firstUncompleted.id}`);
  };

  const toggleModule = (modId: string) => {
    setExpandedModule(expandedModule === modId ? null : modId);
  };

  const LessonRow = ({ lesson }: { lesson: Lesson }) => {
    const lessonStatus = deriveStatus(lesson.id);
    const isLocked = lessonStatus === 'locked';
    const statusColor = lessonStatus === 'completed' ? 'text-kleia-success' : lessonStatus === 'in_progress' ? 'text-kleia-gold' : 'text-kleia-gray';
    const lessonType = lesson.lesson_type === 'quiz' ? 'quiz' : lesson.lesson_type === 'certificate' ? 'certificate' : 'video';
    const typeIcon = typeIcons[lessonType] || '•';
    const duration = formatDuration(lesson.duration_seconds);

    return (
      <Link
        to={isLocked ? '#' : `/lecon/${lesson.id}`}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-kleia-dark/5',
          lessonStatus === 'in_progress' && 'bg-kleia-gold/5 border border-kleia-gold/20',
        )}
        onClick={(e) => { if (isLocked) e.preventDefault(); }}
        aria-disabled={isLocked}
      >
        <span className={clsx('text-sm w-6 text-center', statusColor)} aria-hidden="true">
          {isLocked ? '🔒' : typeIcon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-medium font-body truncate', isLocked ? 'text-kleia-gray' : 'text-kleia-dark')}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-kleia-gray">{duration}</span>
            {lesson.lesson_type === 'quiz' && <Badge variant="warning">Quiz</Badge>}
            {lesson.lesson_type === 'certificate' && <Badge variant="success">Certificat</Badge>}
          </div>
        </div>
        <Badge variant={lessonStatus === 'completed' ? 'success' : lessonStatus === 'in_progress' ? 'warning' : 'default'}>
          {statusLabels[lessonStatus]}
        </Badge>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      <div className={clsx(
        'rounded-kleia p-6 md:p-10 bg-gradient-to-br',
        getGradient(course.level),
        'text-white',
      )}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="info">{course.level}</Badge>
          <span className="text-white/70 text-sm">•</span>
          <span className="text-white/70 text-sm">{formatDuration(totalDurationSeconds)}</span>
          <span className="text-white/70 text-sm">•</span>
          <span className="text-white/70 text-sm">{course.category || 'Formation'}</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-extrabold font-heading mb-2">{course.title}</h1>
        <p className="text-white/80 font-body max-w-2xl">{course.description}</p>
        {course.instructor && (
          <p className="text-white/60 text-sm mt-3 font-body">Par {course.instructor}</p>
        )}
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
          {modules.length === 0 && (
            <Card>
              <p className="text-kleia-gray font-body text-center py-4">Aucun module disponible pour le moment.</p>
            </Card>
          )}
          {modules.map((mod) => {
            const lessonCount = mod.lessons?.length || 0;
            const completedCount = (mod.lessons || []).filter(l => deriveStatus(l.id) === 'completed').length;

            return (
              <Card key={mod.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-kleia-dark/5 transition-colors"
                  aria-expanded={expandedModule === mod.id}
                >
                  <div>
                    <h3 className="font-heading font-bold text-kleia-dark">{mod.title}</h3>
                    <p className="text-xs text-kleia-gray font-body mt-0.5">
                      {completedCount}/{lessonCount} leçons
                    </p>
                  </div>
                  <svg
                    className={clsx('w-5 h-5 text-kleia-gray transition-transform', expandedModule === mod.id && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedModule === mod.id && mod.lessons && (
                  <div className="border-t border-kleia-dark/10 px-2 py-2 space-y-1">
                    {mod.lessons.map((lesson) => (
                      <LessonRow key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-3">Informations</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Catégorie</span>
                <span className="font-medium text-kleia-dark font-body">{course.category || 'Formation'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Durée totale</span>
                <span className="font-medium text-kleia-dark font-body">{formatDuration(totalDurationSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Leçons</span>
                <span className="font-medium text-kleia-dark font-body">{totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-kleia-gray font-body">Niveau</span>
                <Badge variant="info">{course.level}</Badge>
              </div>
              {course.instructor && (
                <div className="flex justify-between">
                  <span className="text-kleia-gray font-body">Formateur</span>
                  <span className="font-medium text-kleia-dark font-body">{course.instructor}</span>
                </div>
              )}
            </div>
          </Card>
          {allCompleted ? (
            <Button variant="outline" className="w-full !border-kleia-success !text-kleia-success" disabled>
              ✓ Formation terminée
            </Button>
          ) : overallProgress > 0 ? (
            <Button variant="secondary" className="w-full" onClick={handleStart}>
              Continuer la formation
            </Button>
          ) : (
            <Button variant="primary" className="w-full" onClick={handleStart}>
              Commencer la formation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

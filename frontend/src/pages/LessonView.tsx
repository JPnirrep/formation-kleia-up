import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import PlayerShell from '@/components/player/PlayerShell';
import { getLessonById, mockCourses } from '@/mock';
import { getCourse } from '@/api/courses';
import type { Lesson, CourseDetail } from '@/api/courses';

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [apiLesson, setApiLesson] = useState<Lesson | null>(null);
  const [apiCourse, setApiCourse] = useState<CourseDetail | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLesson() {
      try {
        const courses = await import('@/api/courses');
        const allCourses = await courses.getCourses({ limit: 50 });
        for (const course of allCourses.items) {
          const detail = await courses.getCourse(course.slug);
          for (const mod of detail.modules || []) {
            for (const lesson of mod.lessons || []) {
              if (lesson.id === lessonId && !cancelled) {
                setApiLesson(lesson);
                setApiCourse(detail);
                setApiLoading(false);
                return;
              }
            }
          }
        }
      } catch {
        /* fall back to mock */
      }
      if (!cancelled) setApiLoading(false);
    }
    fetchLesson();
    return () => { cancelled = true; };
  }, [lessonId]);

  const mockLesson = getLessonById(lessonId || 'l1-1');
  const lesson = apiLesson || mockLesson;
  const [completed, setCompleted] = useState(lesson?.status === 'completed' || false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    if (lesson) setCompleted(lesson.status === 'completed');
  }, [lesson]);

  if (apiLoading) {
    return <Loading className="py-20" text="Chargement de la leçon..." />;
  }

  if (!lesson) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">Leçon introuvable</p>
        <Link to="/formations" className="text-kleia-burgundy font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  const allLessons = apiCourse
    ? (apiCourse.modules || []).flatMap(m => m.lessons || [])
    : mockCourses.flatMap(c => c.modules.flatMap(m => m.lessons));
  const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const lessonType = apiLesson
    ? (apiLesson.lesson_type === 'video' ? 'video' : apiLesson.lesson_type === 'quiz' ? 'quiz' : 'certificate')
    : (mockLesson?.type || 'video');

  const duration = apiLesson ? formatDuration(apiLesson.duration_seconds) : (mockLesson?.duration || '');

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={-1 as unknown as string}
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="text-sm text-kleia-gray hover:text-kleia-burgundy font-body transition-colors inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative" aria-label="Lecteur vidéo">
            <PlayerShell title={lesson.title} className="rounded-kleia" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-bold font-heading text-kleia-dark">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-3">
              <Badge variant="warning">{duration}</Badge>
              {lessonType === 'quiz' && <Badge variant="warning">Quiz</Badge>}
              {lessonType === 'certificate' && <Badge variant="success">Certificat</Badge>}
              {completed && <Badge variant="success">Terminé ✓</Badge>}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {prevLesson ? (
                <Link to={`/lecon/${prevLesson.id}`}>
                  <Button variant="outline" size="sm">← Précédent</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>← Précédent</Button>
              )}
              {nextLesson ? (
                <Link to={`/lecon/${nextLesson.id}`}>
                  <Button variant="outline" size="sm">Suivant →</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>Suivant →</Button>
              )}
            </div>
            <Button
              variant={completed ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setCompleted(!completed)}
              aria-label={completed ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
            >
              {completed ? '✓ Terminé' : 'Marquer comme terminé'}
            </Button>
          </div>

          <Card>
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={transcriptOpen}
            >
              <h2 className="font-heading font-bold text-kleia-dark">Transcription</h2>
              <svg
                className={clsx('w-5 h-5 text-kleia-gray transition-transform', transcriptOpen && 'rotate-180')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {transcriptOpen && (
              <div className="mt-4 space-y-3 text-sm text-kleia-gray font-body leading-relaxed border-t border-kleia-dark/10 pt-4">
                <p>Dans cette leçon, nous allons explorer les concepts fondamentaux qui vous permettront de construire une base solide pour votre apprentissage. L'objectif est de vous donner les clés pour comprendre et appliquer ces principes dans votre contexte personnel.</p>
                <p>Nous commencerons par une introduction aux notions clés, puis nous passerons à des exercices pratiques. N'hésitez pas à mettre en pause la vidéo pour prendre des notes ou répéter les passages importants.</p>
                <p>La pratique régulière est essentielle pour maîtriser ces concepts. Assurez-vous de réaliser les exercices proposés à la fin de chaque module pour consolider vos acquis.</p>
                <p>Dans les sections suivantes, nous aborderons des cas d'usage concrets et des exemples inspirants qui vous aideront à visualiser l'application de ces techniques dans votre quotidien professionnel.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="font-heading font-bold text-kleia-dark mb-3">Navigation</h2>
            <div className="space-y-2">
              {prevLesson && (
                <Link
                  to={`/lecon/${prevLesson.id}`}
                  className="block p-3 rounded-lg bg-kleia-dark/5 hover:bg-kleia-burgundy/10 transition-colors"
                >
                  <span className="text-xs text-kleia-gray font-body">Leçon précédente</span>
                  <p className="text-sm font-medium text-kleia-dark font-body truncate">{prevLesson.title}</p>
                </Link>
              )}
              {nextLesson && (
                <Link
                  to={`/lecon/${nextLesson.id}`}
                  className="block p-3 rounded-lg bg-kleia-gold/10 hover:bg-kleia-gold/20 transition-colors border border-kleia-gold/20"
                >
                  <span className="text-xs text-kleia-gray font-body">Leçon suivante</span>
                  <p className="text-sm font-medium text-kleia-dark font-body truncate">{nextLesson.title}</p>
                </Link>
              )}
            </div>
            {'quizId' in lesson && lesson.quizId && (
              <Link to={`/quiz/${lesson.quizId}`} className="block mt-3">
                <Button variant="secondary" size="sm" className="w-full">Passer le quiz</Button>
              </Link>
            )}
          </Card>

          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-2">À propos de cette leçon</h3>
            <div className="space-y-2 text-sm text-kleia-gray font-body">
              <p>Type : {lessonType === 'video' ? 'Vidéo' : lessonType === 'quiz' ? 'Quiz' : 'Certificat'}</p>
              <p>Durée : {duration}</p>
              <p>Statut : {completed ? 'Terminé' : lesson.status === 'in_progress' ? 'En cours' : 'Pas commencé'}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { getCourses } from '@/api/courses';
import { deleteCourse } from '@/api/admin';
import type { Course } from '@/api/courses';

const LEVEL_COLORS: Record<string, string> = {
  débutant: 'bg-kleia-violet/10 text-kleia-violet',
  intermédiaire: 'bg-kleia-gold/10 text-kleia-gold',
  avancé: 'bg-kleia-burgundy/10 text-kleia-burgundy',
};

export default function AdminCourses() {
  useEffect(() => { document.title = 'Gestion des formations — Kleia-up'; }, []);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses({ limit: 100 });
      setCourses(data.items || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = async (courseId: string, title: string) => {
    if (!window.confirm(`Supprimer la formation "${title}" ?`)) return;
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  if (loading) return <Loading className="py-20" text="Chargement des formations..." />;

  return (
    <div className="space-y-6" role="region" aria-label="Gestion des formations">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-kleia-violet tracking-tight">
            Formations
          </h1>
          <p className="text-sm text-kleia-gray font-body mt-1">
            {courses.length} formation{courses.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" data-testid="admin-courses-new" onClick={() => navigate('/admin/courses/new')}>
          + Nouvelle formation
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="Aucune formation"
          description="Créez votre première formation pour commencer."
          actionLabel="Créer une formation"
          onAction={() => navigate('/admin/courses/new')}
        />
      ) : (
        /* ── Catalogue visuel en grille ── */
        <div data-testid="admin-courses-list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Card key={course.id} variant="surface" data-testid="admin-course-card" className="!p-0 overflow-hidden group">
              {/* Color stripe */}
              <div className={`h-2 ${course.status === 'published' ? 'bg-kleia-violet' : 'bg-kleia-alt'}`} />

              <div className="p-5 space-y-4">
                {/* Title + Status */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading font-bold text-base text-kleia-dark leading-snug group-hover:text-kleia-violet transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <Badge variant={course.status === 'published' ? 'success' : 'warning'} className="shrink-0">
                      {course.status === 'published' ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                  {course.short_description && (
                    <p className="text-xs text-kleia-gray font-body line-clamp-2 leading-relaxed">
                      {course.short_description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-kleia-gray font-body">
                  <span className={LEVEL_COLORS[course.level] || 'bg-kleia-dark/10 text-kleia-dark px-2 py-0.5 rounded-full font-medium'}>
                    {course.level}
                  </span>
                  <span>•</span>
                  <span>{Math.round(course.duration_seconds / 60)} min</span>
                  {course.category && (
                    <>
                      <span>•</span>
                      <span>{course.category}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-kleia-border">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/courses/${course.id}`)}
                    aria-label={`Éditer ${course.title}`}
                  >
                    Éditer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-red-500"
                    onClick={() => handleDelete(course.id, course.title)}
                    aria-label={`Supprimer ${course.title}`}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

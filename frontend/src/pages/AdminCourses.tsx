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

export default function AdminCourses() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">
            Gestion des formations
          </h1>
          <p className="text-sm text-kleia-gray font-body mt-1">
            {courses.length} formation{courses.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/courses/new')}>
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
        <div className="space-y-3">
          {courses.map((course) => (
            <Card key={course.id} className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-kleia-dark truncate">
                    {course.title}
                  </h3>
                  <Badge variant={course.status === 'published' ? 'success' : 'warning'}>
                    {course.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
                <p className="text-sm text-kleia-gray font-body truncate mt-0.5">
                  {course.short_description || course.description?.slice(0, 100) || '—'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-kleia-gray/60 font-body">
                  <span>Niveau : {course.level}</span>
                  <span>Durée : {Math.round(course.duration_seconds / 60)} min</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/courses/${course.slug}`)}
                  aria-label={`Modifier ${course.title}`}
                >
                  Modifier
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

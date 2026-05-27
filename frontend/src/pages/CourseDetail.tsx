import { useParams, Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { getCourse } from '@/api/courses';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m === 0) return `${seconds}s`;
  return `${m} min`;
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: course, loading, error } = useApi(
    () => getCourse(slug || ''),
    [slug],
  );

  if (loading) return <div className="py-20 text-center text-kleia-gray">Chargement...</div>;
  if (error || !course) return <div className="py-20 text-center text-kleia-gray">Formation introuvable</div>;

  const modules = course.modules || [];

  return (
    <div className="space-y-6">
      {/* Titre */}
      <h1>{course.title}</h1>
      <p className="text-kleia-gray">{course.description}</p>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((mod: any) => (
          <div key={mod.id} className="glass-card p-5">
            <h2 className="text-lg font-bold text-kleia-burgundy mb-3">
              Pilier {mod.order} — {mod.title}
            </h2>
            {mod.lessons && mod.lessons.length > 0 ? (
              <ul className="space-y-2">
                {mod.lessons.map((lesson: any) => (
                  <li key={lesson.id}>
                    <Link
                      to={`/lecon/${lesson.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-kleia-gold/5 transition-colors"
                    >
                      <span className="w-8 h-8 rounded-full bg-kleia-burgundy/10 flex items-center justify-center text-kleia-burgundy text-sm">
                        ▶
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-kleia-dark">{lesson.title}</p>
                        <p className="text-xs text-kleia-gray">{formatDuration(lesson.duration_seconds)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-kleia-gray text-sm">Aucune leçon</p>
            )}
          </div>
        ))}
      </div>

      <Link to="/formations" className="text-kleia-burgundy font-semibold">
        ← Retour aux formations
      </Link>
    </div>
  );
}

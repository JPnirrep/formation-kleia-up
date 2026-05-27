import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import { useApi } from '@/hooks/useApi';
import { getCourses } from '@/api/courses';
import { formatDuration, getCourseGradient } from '@/lib/utils';
import type { Course } from '@/api/courses';

export default function Courses() {
  const { data, loading, error } = useApi(() => getCourses({ limit: 50 }), []);

  if (loading) {
    return <Loading className="py-20" text="Chargement du catalogue..." />;
  }

  if (error) {
    return (
      <div className="glass-card text-center py-12">
        <p className="text-kleia-gray text-lg">
          Impossible de charger le catalogue. Veuillez réessayer plus tard.
        </p>
      </div>
    );
  }

  const courses = data?.items || [];
  const totalModules = (c: Course) =>
    Array.isArray(c.modules) ? c.modules.length : (typeof c.modules === 'number' ? c.modules : 0);

  return (
    <div className="space-y-8">
      {/* ─── Page Header ─── */}
      <div>
        <h1>Catalogue des formations</h1>
        <p className="text-kleia-gray text-lg mt-2 max-w-2xl leading-relaxed">
          Découvrez notre collection de formations conçues pour vous accompagner
          dans votre développement personnel et professionnel.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kleia-gold/10 text-kleia-gold text-sm font-bold">
            <BookOpen className="w-4 h-4" />
            {courses.length} formation{courses.length > 1 ? 's' : ''} disponible{courses.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ─── Course Grid ─── */}
      {courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/formation/${course.slug}`}
              className="group block"
            >
              <article className="glass-card overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_rgba(139,29,61,0.15)]">
                {/* Thumbnail / Gradient Header */}
                <div
                  className={`h-36 bg-gradient-to-br ${getCourseGradient(course.level)} relative overflow-hidden`}
                >
                  {/* Subtle gold accent line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kleia-gold/60 via-kleia-gold to-kleia-gold/60" />

                  {/* Thumbnail image if available */}
                  {course.thumbnail_url && (
                    <img
                      src={course.thumbnail_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                      aria-hidden="true"
                    />
                  )}

                  {/* Course initial / decorative text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/25 text-5xl font-heading font-extrabold select-none tracking-tight">
                      {course.title.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  {/* Level Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-kleia-burgundy/10 text-kleia-burgundy uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-kleia-gray">
                      <BookOpen className="w-3.5 h-3.5" />
                      {totalModules(course)} module{totalModules(course) !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-heading font-bold text-kleia-heading group-hover:text-kleia-burgundy transition-colors mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-kleia-gray leading-relaxed mb-4 line-clamp-3">
                    {course.short_description || course.description || 'Aucune description disponible.'}
                  </p>

                  {/* Footer: Duration + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-kleia-border">
                    <span className="flex items-center gap-1.5 text-xs text-kleia-gray">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(course.duration_seconds)}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-kleia-burgundy text-white text-sm font-bold font-heading transition-all group-hover:opacity-90 group-hover:gap-2.5">
                      Commencer
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Aucune formation disponible"
          description="Revenez bientôt, de nouvelles formations arrivent."
          icon="search"
        />
      )}
    </div>
  );
}

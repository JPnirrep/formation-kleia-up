import { Link } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
interface CardCourse {
  slug: string;
  title: string;
  level: string;
  shortDescription: string;
  duration: string;
  progress: number;
  lessonCount: number;
  thumbnailColor: string;
}

interface CourseCardProps {
  course: CardCourse;
  variant?: 'default' | 'compact';
}

export default function CourseCard({ course, variant = 'default' }: CourseCardProps) {
  const isCompact = variant === 'compact';

  return (
    <Link to={`/formation/${course.slug}`} className="block group">
      <Card hover className={clsx(isCompact ? 'p-4' : 'p-0')}>
        <div
          className={clsx(
            'bg-gradient-to-br rounded-t-kleia',
            isCompact ? 'h-24 rounded-kleia' : 'h-40',
            course.thumbnailColor,
          )}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/40 text-4xl font-heading font-bold select-none">
              {course.title.split(' ')[0]}
            </span>
          </div>
        </div>

        <div className={clsx(isCompact ? 'mt-3' : 'p-5')}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3
              className={clsx(
                'font-heading font-bold text-kleia-burgundy group-hover:text-kleia-burgundy-light transition-colors',
                isCompact ? 'text-sm' : 'text-lg',
              )}
            >
              {course.title}
            </h3>
            <Badge variant="info">{course.level}</Badge>
          </div>

          {!isCompact && (
            <p className="text-sm text-kleia-gray font-body mb-3 line-clamp-2">
              {course.shortDescription}
            </p>
          )}

          {course.progress > 0 && (
            <div className="space-y-1 mb-3">
              <div className="w-full h-2 bg-kleia-dark/10 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-burgundy rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-xs text-kleia-gray font-body">
                {course.progress}% terminé
              </span>
            </div>
          )}

          {!isCompact && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-kleia-dark/10">
              <div className="flex items-center gap-2 text-xs text-kleia-gray">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                <span>{course.duration}</span>
                <span className="text-kleia-dark/20">|</span>
                <span>{course.lessonCount} leçons</span>
              </div>
              <Button
                variant={course.progress > 0 ? 'secondary' : 'primary'}
                size="sm"
                onClick={(e) => { e.preventDefault(); window.location.href = `/formation/${course.slug}`; }}
              >
                {course.progress > 0 ? 'Continuer' : 'Commencer'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

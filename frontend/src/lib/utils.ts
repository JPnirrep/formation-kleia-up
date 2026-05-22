export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function getCourseGradient(level: string): string {
  const gradients: Record<string, string> = {
    'débutant': 'from-[#7C3AED] to-[#A78BFA]',
    'Débutant': 'from-[#7C3AED] to-[#A78BFA]',
    'intermédiaire': 'from-[#EC4899] to-[#F472B6]',
    'Intermédiaire': 'from-[#EC4899] to-[#F472B6]',
    'avancé': 'from-[#F59E0B] to-[#FBBF24]',
    'Avancé': 'from-[#F59E0B] to-[#FBBF24]',
  };
  return gradients[level] || 'from-[#10B981] to-[#34D399]';
}

export interface CardCourse {
  slug: string;
  title: string;
  level: string;
  shortDescription: string;
  duration: string;
  progress: number;
  lessonCount: number;
  thumbnailColor: string;
}

export function toCardCourse(course: { id: string; title: string; slug: string; short_description?: string | null; level: string; duration_seconds: number; lessons?: number; }): CardCourse {
  return {
    slug: course.slug,
    title: course.title,
    level: course.level,
    shortDescription: course.short_description || '',
    duration: formatDuration(course.duration_seconds),
    progress: 0,
    lessonCount: course.lessons ?? 0,
    thumbnailColor: getCourseGradient(course.level),
  };
}

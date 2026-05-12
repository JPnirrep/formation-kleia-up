export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function getCourseGradient(level: string): string {
  const gradients: Record<string, string> = {
    'débutant': 'from-kleia-burgundy/20 via-kleia-burgundy/10 to-kleia-cream',
    'Débutant': 'from-kleia-burgundy/20 via-kleia-burgundy/10 to-kleia-cream',
    'intermédiaire': 'from-kleia-gold/20 via-kleia-gold/10 to-kleia-cream',
    'Intermédiaire': 'from-kleia-gold/20 via-kleia-gold/10 to-kleia-cream',
    'avancé': 'from-kleia-dark/20 via-kleia-dark/10 to-kleia-cream',
    'Avancé': 'from-kleia-dark/20 via-kleia-dark/10 to-kleia-cream',
  };
  return gradients[level] || 'from-kleia-cream to-kleia-cream';
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

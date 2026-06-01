import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

interface KleiaCraftCreatingProps {
  creationProgress: string;
  createdCourseId: string;
  onEditCourse: () => void;
  onViewCourses: () => void;
}

export default function KleiaCraftCreating({ creationProgress, createdCourseId, onEditCourse, onViewCourses }: KleiaCraftCreatingProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6" role="status" aria-live="polite">
      <Card variant="elevated" className="text-center">
        <div className="space-y-5">
          <Loading size="lg" />
          <h2 className="text-xl font-bold font-heading text-kleia-violet">
            📝 Création du cours en cours...
          </h2>
          <p className="text-sm font-body text-kleia-dark/80 font-medium">
            {creationProgress}
          </p>
          <div className="h-2 w-full bg-kleia-dark/10 rounded-full overflow-hidden">
            <div className="h-full bg-kleia-violet animate-pulse rounded-full transition-all" style={{ width: '60%' }} />
          </div>
          {createdCourseId && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                variant="premium"
                size="md"
                onClick={onEditCourse}
              >
                ✏️ Éditer la formation
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={onViewCourses}
              >
                📚 Voir toutes les formations
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

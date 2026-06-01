import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { AIGeneratedCourse } from '@/api/ai';

const LEVEL_BADGE: Record<string, 'info' | 'warning' | 'violet'> = {
  débutant: 'violet',
  intermédiaire: 'warning',
  avancé: 'info',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h}h ${rest}min` : `${h}h`;
}

interface KleiaCraftResultProps {
  result: AIGeneratedCourse;
  expandedModules: string[];
  onToggleModule: (title: string) => void;
  onRegenerate: () => void;
  onCreateCourse: () => void;
}

export default function KleiaCraftResult({ result, expandedModules, onToggleModule, onRegenerate, onCreateCourse }: KleiaCraftResultProps) {
  return (
    <div data-testid="kleiacraft-result" className="max-w-4xl mx-auto space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-heading font-semibold text-kleia-success">✓ Formation générée</span>
          <Badge variant="success">Succès</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="md" onClick={onRegenerate}>
            🔄 Régénérer
          </Button>
          <Button variant="premium" size="md" onClick={onCreateCourse}>
            📝 Créer la formation dans l'admin
          </Button>
        </div>
      </div>

      {/* Titre + métadonnées */}
      <Card variant="elevated">
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold font-heading text-kleia-violet tracking-tight">
            {result.title}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {result.level && (
              <Badge variant={LEVEL_BADGE[result.level.toLowerCase()] || 'default'}>
                {result.level}
              </Badge>
            )}
            {result.category && (
              <Badge variant="info">{result.category}</Badge>
            )}
            {result.modules.length > 0 && (
              <span className="text-xs text-kleia-gray font-body">
                {result.modules.length} module{result.modules.length > 1 ? 's' : ''} ·{' '}
                {result.modules.reduce((acc, m) => acc + m.lessons.length, 0)} leçon
                {result.modules.reduce((acc, m) => acc + m.lessons.length, 0) > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {result.short_description && (
            <p className="text-sm font-body text-kleia-dark/80 leading-relaxed">
              {result.short_description}
            </p>
          )}

          {result.description && (
            <div className="pt-3 border-t border-kleia-border">
              <h3 className="text-sm font-bold font-heading text-kleia-dark mb-2">Description complète</h3>
              <p className="text-sm font-body text-kleia-gray leading-relaxed whitespace-pre-line">
                {result.description}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Arborescence des modules/leçons */}
      {result.modules.length > 0 && (
        <section aria-label="Modules et leçons">
          <h3 className="text-lg font-bold font-heading text-kleia-dark mb-4">
            📚 Structure du programme
          </h3>
          <div className="space-y-3">
            {result.modules.map((mod, idx) => {
              const isExpanded = expandedModules.includes(mod.title);
              return (
                <Card key={mod.title} variant="surface" className="!p-0 overflow-hidden">
                  <button
                    onClick={() => onToggleModule(mod.title)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-kleia-violet/5 transition-colors focus-visible:ring-2 focus-visible:ring-kleia-gold focus-visible:ring-offset-2 focus-visible:outline-none rounded-kleia"
                    aria-expanded={isExpanded}
                    aria-controls={`module-${idx}-content`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-kleia-violet/10 text-kleia-violet text-sm font-bold font-heading shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-sm font-bold font-heading text-kleia-dark">{mod.title}</span>
                        {mod.description && (
                          <p className="text-xs text-kleia-gray font-body mt-0.5">{mod.description}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-kleia-gray transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      ▼
                    </span>
                  </button>

                  {isExpanded && (
                    <div id={`module-${idx}-content`} className="border-t border-kleia-border">
                      {mod.lessons.length === 0 ? (
                        <p className="px-5 py-4 text-xs text-kleia-gray font-body">Aucune leçon</p>
                      ) : (
                        <ul className="divide-y divide-kleia-border">
                          {mod.lessons.map((lesson, lidx) => (
                            <li
                              key={`${lesson.title}-${lidx}`}
                              className="flex items-center justify-between px-5 py-3 hover:bg-kleia-violet/5 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs text-kleia-gray font-body w-5 shrink-0">
                                  {idx + 1}.{lidx + 1}
                                </span>
                                <span className="text-sm font-body text-kleia-dark truncate">
                                  {lesson.title}
                                </span>
                                {lesson.lesson_type && (
                                  <Badge variant="violet" className="shrink-0">
                                    {lesson.lesson_type}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-kleia-gray font-body shrink-0 ml-3">
                                {formatDuration(lesson.duration_seconds)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Pied de page : actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-2">
        <Button variant="outline" size="md" onClick={onRegenerate}>
          🔄 Régénérer avec un nouveau prompt
        </Button>
        <Button variant="premium" size="md" onClick={onCreateCourse}>
          📝 Créer la formation dans l'admin
        </Button>
      </div>
    </div>
  );
}

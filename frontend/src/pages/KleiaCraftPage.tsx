import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import { generateCourse } from '@/api/ai';
import { createCourse, createModule, createLesson } from '@/api/admin';
import type { AIGeneratedCourse } from '@/api/ai';
import type { Course, Module } from '@/api/courses';

type PageState = 'prompt' | 'generating' | 'result' | 'creating' | 'error';

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

export default function KleiaCraftPage() {
  const navigate = useNavigate();
  useEffect(() => { document.title = 'KleiaCraft — Kleia-up'; }, []);
  const [pageState, setPageState] = useState<PageState>('prompt');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AIGeneratedCourse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [creationProgress, setCreationProgress] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPromptValid = prompt.trim().length >= 10;

  const toggleModule = (title: string) => {
    setExpandedModules((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title],
    );
  };

  const handleGenerate = async () => {
    if (!isPromptValid) {
      textareaRef.current?.focus();
      return;
    }

    setPageState('generating');
    setErrorMessage('');

    try {
      const data = await generateCourse(prompt.trim());
      setResult(data);
      setExpandedModules(data.modules.map((m) => m.title));
      setPageState('result');
    } catch (err: any) {
      // Détection d'erreur API (clé manquante, serveur injoignable)
      const msg =
        err?.status === 0
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion réseau.'
          : err?.status === 401
            ? 'Session expirée. Veuillez vous reconnecter.'
            : err?.status === 403
              ? 'Accès refusé. Seuls les administrateurs peuvent générer des formations.'
              : err?.status === 500
                ? 'Erreur serveur. La clé API KleiaCraft est peut-être manquante ou invalide.'
                : err?.message || 'Une erreur inconnue est survenue.';
      setErrorMessage(msg);
      setPageState('error');
    }
  };

  const handleRegenerate = () => {
    setResult(null);
    setPageState('prompt');
    // Le prompt est conservé
  };

  const handleCreateCourse = async () => {
    if (!result) return;
    setPageState('creating');
    setCreationProgress('Création de la formation...');

    try {
      // 1. Créer le cours
      const courseData: any = {
        title: result.title,
        slug: result.slug,
        short_description: result.short_description || '',
        description: result.description || '',
        level: result.level || 'debutant',
        status: 'draft',
      };
      const course: Course = await createCourse(courseData);
      setCreationProgress(`✅ Formation "${course.title}" créée — ajout des modules...`);

      // 2. Créer les modules + leçons
      for (const mod of result.modules) {
        const moduleData: any = {
          title: mod.title,
          order: mod.order,
          description: mod.description || '',
        };
        const createdModule: Module = await createModule(course.id, moduleData);
        setCreationProgress(`📦 Module "${mod.title}" créé — ajout des leçons...`);

        for (const lesson of mod.lessons) {
          await createLesson(createdModule.id, {
            title: lesson.title,
            order: lesson.order,
            lesson_type: lesson.lesson_type || 'video',
            description: lesson.description || '',
            duration_seconds: lesson.duration_seconds || 600,
          } as any);
        }
        setCreationProgress(`✅ Module "${mod.title}" terminé (${mod.lessons.length} leçons)`);
      }

      setCreatedCourseId(course.id);
      setCreationProgress('🎉 Formation créée avec succès !');
    } catch (err: any) {
      const msg = err?.message || 'Erreur lors de la création de la formation.';
      setErrorMessage(msg);
      setPageState('error');
    }
  };

  return (
    <div className="space-y-8" role="region" aria-label="KleiaCraft — Générateur de formations par IA">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold font-heading text-kleia-violet tracking-tight">
          🤖 KleiaCraft — Générateur de formations par IA
        </h1>
        <p className="text-kleia-gray font-body text-base mt-3">
          Décris le thème de la formation en quelques phrases, et laisse l'IA structurer un programme complet.
        </p>
      </div>

      {/* ── État 1 : Prompt ── */}
      {pageState === 'prompt' && (
        <Card variant="elevated" className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="kleiacraft-prompt"
                className="block text-sm font-semibold font-heading text-kleia-dark"
              >
                Votre description
              </label>
              <textarea
                ref={textareaRef}
                id="kleiacraft-prompt"
                data-testid="kleiacraft-prompt"
                rows={6}
                className="w-full px-4 py-3 rounded-kleia border border-kleia-dark/20 bg-white text-kleia-dark placeholder:text-kleia-gray/60 font-body text-sm resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-kleia-violet focus:border-kleia-violet"
                placeholder="Ex: Une formation sur la communication non-violente pour managers, avec des modules sur l'écoute active, la gestion des conflits et les feedbacks constructifs."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-describedby={!isPromptValid && prompt.trim().length > 0 ? 'prompt-error' : undefined}
              />
              {!isPromptValid && prompt.trim().length > 0 && (
                <p id="prompt-error" className="text-sm text-kleia-error font-body" role="alert">
                  Minimum 10 caractères requis ({prompt.trim().length}/10).
                </p>
              )}
              <p className="text-xs text-kleia-gray font-body">
                Soyez précis·e : indiquez le public cible, les objectifs et les thèmes souhaités.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="premium"
                size="lg"
                disabled={!isPromptValid}
                data-testid="kleiacraft-generate"
                onClick={handleGenerate}
                aria-label="Générer la formation avec l'intelligence artificielle"
              >
                🚀 Générer la formation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── État 2 : Génération en cours ── */}
      {pageState === 'generating' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-6" role="status" aria-live="polite">
          <Loading size="lg" />
          <p className="text-lg font-heading font-bold text-kleia-violet animate-pulse">
            KleiaCraft réfléchit
            <span className="animate-[dot-pulse_1.5s_steps(4)_infinite]">.</span>
            <span className="animate-[dot-pulse_1.5s_steps(4)_infinite_0.3s]">.</span>
            <span className="animate-[dot-pulse_1.5s_steps(4)_infinite_0.6s]">.</span>
          </p>
          <style>{`
            @keyframes dot-pulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
          <p className="text-sm text-kleia-gray font-body max-w-md text-center">
            Analyse de votre requête, recherche des meilleures structures pédagogiques et génération du contenu…
          </p>
        </div>
      )}

      {/* ── État 2b : Création en cours ── */}
      {pageState === 'creating' && (
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
                    onClick={() => navigate(`/admin/courses/${createdCourseId}`)}
                  >
                    ✏️ Éditer la formation
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/admin/courses')}
                  >
                    📚 Voir toutes les formations
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── État 3 : Résultat (prévisualisation) ── */}
      {pageState === 'result' && result && (
        <div data-testid="kleiacraft-result" className="max-w-4xl mx-auto space-y-6">
          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-heading font-semibold text-kleia-success">✓ Formation générée</span>
              <Badge variant="success">Succès</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="md" onClick={handleRegenerate}>
                🔄 Régénérer
              </Button>
              <Button variant="premium" size="md" onClick={handleCreateCourse}>
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
                        onClick={() => toggleModule(mod.title)}
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
            <Button variant="outline" size="md" onClick={handleRegenerate}>
              🔄 Régénérer avec un nouveau prompt
            </Button>
            <Button variant="premium" size="md" onClick={handleCreateCourse}>
              📝 Créer la formation dans l'admin
            </Button>
          </div>
        </div>
      )}

      {/* ── État 4 : Erreur ── */}
      {pageState === 'error' && (
        <Card variant="surface" className="max-w-2xl mx-auto border-l-4 border-kleia-error">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">❌</span>
              <div>
                <h2 className="text-lg font-bold font-heading text-kleia-error">Erreur de génération</h2>
                <p className="text-sm font-body text-kleia-dark mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                {errorMessage.includes('clé API') && (
                  <div className="mt-3 p-3 bg-kleia-warning/10 border border-kleia-warning/20 rounded-kleia">
                    <p className="text-xs font-body text-kleia-dark">
                      <strong>💡 Conseil :</strong> Vérifiez que la variable d'environnement <code className="bg-kleia-dark/10 px-1 py-0.5 rounded text-xs">KLEIA_CRAFT_API_KEY</code> est configurée sur le serveur backend.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="md" onClick={handleRegenerate}>
                Réessayer
              </Button>
              <Button variant="ghost" size="md" onClick={() => setPrompt('')}>
                Effacer et recommencer
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

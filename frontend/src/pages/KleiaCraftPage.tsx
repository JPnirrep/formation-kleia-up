import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateCourse } from '@/api/ai';
import { createCourse, createModule, createLesson } from '@/api/admin';
import type { AIGeneratedCourse } from '@/api/ai';
import type { Course, Module } from '@/api/courses';
import KleiaCraftPrompt from '@/components/kleiacraft/KleiaCraftPrompt';
import KleiaCraftGenerating from '@/components/kleiacraft/KleiaCraftGenerating';
import KleiaCraftCreating from '@/components/kleiacraft/KleiaCraftCreating';
import KleiaCraftError from '@/components/kleiacraft/KleiaCraftError';
import KleiaCraftResult from '@/components/kleiacraft/KleiaCraftResult';

type PageState = 'prompt' | 'generating' | 'result' | 'creating' | 'error';

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

  const isPromptValid = prompt.trim().length >= 10;

  const toggleModule = (title: string) => {
    setExpandedModules((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title],
    );
  };

  const handleGenerate = async () => {
    if (!isPromptValid) return;

    setPageState('generating');
    setErrorMessage('');

    try {
      const data = await generateCourse(prompt.trim());
      setResult(data);
      setExpandedModules(data.modules.map((m) => m.title));
      setPageState('result');
    } catch (err: any) {
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
  };

  const handleCreateCourse = async () => {
    if (!result) return;
    setPageState('creating');
    setCreationProgress('Création de la formation...');

    try {
      const courseData = {
        title: result.title,
        slug: result.slug,
        short_description: result.short_description || '',
        description: result.description || '',
        level: result.level || 'debutant',
        status: 'draft',
      };
      const course: Course = await createCourse(courseData);
      setCreationProgress(`✅ Formation "${course.title}" créée — ajout des modules...`);

      for (const mod of result.modules) {
        const moduleData = {
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
          });
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

  const handleReset = () => {
    setPrompt('');
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
        <KleiaCraftPrompt
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          isValid={isPromptValid}
        />
      )}

      {/* ── État 2 : Génération en cours ── */}
      {pageState === 'generating' && <KleiaCraftGenerating />}

      {/* ── État 2b : Création en cours ── */}
      {pageState === 'creating' && (
        <KleiaCraftCreating
          creationProgress={creationProgress}
          createdCourseId={createdCourseId}
          onEditCourse={() => navigate(`/admin/courses/${createdCourseId}`)}
          onViewCourses={() => navigate('/admin/courses')}
        />
      )}

      {/* ── État 3 : Résultat (prévisualisation) ── */}
      {pageState === 'result' && result && (
        <KleiaCraftResult
          result={result}
          expandedModules={expandedModules}
          onToggleModule={toggleModule}
          onRegenerate={handleRegenerate}
          onCreateCourse={handleCreateCourse}
        />
      )}

      {/* ── État 4 : Erreur ── */}
      {pageState === 'error' && (
        <KleiaCraftError
          errorMessage={errorMessage}
          onRetry={handleRegenerate}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

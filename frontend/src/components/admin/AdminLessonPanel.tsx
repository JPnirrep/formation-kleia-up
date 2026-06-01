import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { generateQuiz, type AIGeneratedQuiz } from '@/api/ai';
import { createQuiz, addQuestion } from '@/api/admin';

interface LessonData {
  id: string;
  title: string;
  description: string;
  lesson_type: string;
  duration_seconds: number;
  order: number;
}

interface CourseInfoData {
  title: string;
  short_description: string;
  description: string;
  level: string;
  category: string;
  duration_seconds: number;
  status: string;
  slug: string;
}

interface Props {
  selectedLesson: LessonData | null;
  courseInfo: CourseInfoData;
  youtubeUrl: string;
  youtubeTitle: string;
  driveAudioUrl: string;
  drivePdfUrl: string;
  editContent: string;
  lessonVideos: { id: string; title: string; playback_url: string | null }[];
  onLessonFieldChange: (field: string, value: string | number) => void;
  onCourseFieldChange: (field: string, value: string | number) => void;
  onYoutubeUrlChange: (url: string) => void;
  onYoutubeTitleChange: (title: string) => void;
  onAddYoutube: () => void;
  onDriveAudioChange: (url: string) => void;
  onDrivePdfChange: (url: string) => void;
  onSaveLesson: () => void;
  onSaveCourse: () => void;
  onDeleteVideo: (videoId: string) => void;
  onEditContentChange: (content: string) => void;
  onSaveContent: () => void;
  saving: boolean;
  hasQuiz?: boolean;
  onQuizCreated?: () => void;
}

const LEVELS = ['débutant', 'intermédiaire', 'avancé'];
const CATEGORIES = ['communication', 'prise de parole', 'développement personnel', 'leadership'];
const LESSON_TYPES = ['video', 'quiz', 'text', 'certificate'];

export default function AdminLessonPanel({
  selectedLesson, courseInfo, youtubeUrl, youtubeTitle,
  driveAudioUrl, drivePdfUrl, editContent, lessonVideos,
  onLessonFieldChange, onCourseFieldChange,
  onYoutubeUrlChange, onYoutubeTitleChange, onAddYoutube,
  onDriveAudioChange, onDrivePdfChange,
  onSaveLesson, onSaveCourse, onDeleteVideo,
  onEditContentChange, onSaveContent, saving,
  hasQuiz = false, onQuizCreated,
}: Props) {
  // ── Quiz AI state ──
  type QuizGenState = 'idle' | 'generating' | 'preview' | 'saving' | 'success' | 'error';
  const [quizGenState, setQuizGenState] = useState<QuizGenState>('idle');
  const [generatedQuiz, setGeneratedQuiz] = useState<AIGeneratedQuiz | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const quizVisible = selectedLesson && !hasQuiz && quizGenState !== 'success';

  const handleGenerateQuiz = async () => {
    if (!selectedLesson) return;
    setQuizGenState('generating');
    setQuizError(null);
    try {
      const quiz = await generateQuiz(selectedLesson.id);
      setGeneratedQuiz(quiz);
      setQuizGenState('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la génération du quiz';
      setQuizError(message);
      setQuizGenState('error');
    }
  };

  const handleSaveQuiz = async () => {
    if (!selectedLesson || !generatedQuiz) return;
    setQuizGenState('saving');
    setQuizError(null);
    try {
      const quiz = await createQuiz(selectedLesson.id, {
        title: generatedQuiz.title,
        passing_score_percent: generatedQuiz.passing_score_percent,
      });
      // Add each question sequentially
      for (const q of generatedQuiz.questions) {
        await addQuestion(quiz.id, {
          text: q.text,
          order: q.order,
          question_type: q.question_type,
          options: q.options.map((o) => ({
            label: o.label,
            text: o.text,
            is_correct: o.is_correct,
          })),
          points: q.points,
        });
      }
      setQuizGenState('success');
      onQuizCreated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du quiz';
      setQuizError(message);
      setQuizGenState('error');
    }
  };
  return (
    <div className="flex-1 overflow-y-auto p-6" role="region" aria-label={selectedLesson ? `Édition : ${selectedLesson.title}` : 'Informations de la formation'}>
      {!selectedLesson ? (
        /* ── Course Info Editor ── */
        <div className="max-w-2xl space-y-6">
          <h2 className="text-xl font-bold font-heading text-kleia-dark">Informations de la formation</h2>

          <Card>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">Titre</span>
                <input type="text" value={courseInfo.title} onChange={(e) => onCourseFieldChange('title', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">Description courte</span>
                <input type="text" value={courseInfo.short_description} onChange={(e) => onCourseFieldChange('short_description', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">Description complète</span>
                <textarea rows={5} value={courseInfo.description} onChange={(e) => onCourseFieldChange('description', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body resize-y" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Niveau</span>
                  <select value={courseInfo.level} onChange={(e) => onCourseFieldChange('level', e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body bg-white">
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Catégorie</span>
                  <select value={courseInfo.category} onChange={(e) => onCourseFieldChange('category', e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body bg-white">
                    <option value="">—</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Durée (minutes)</span>
                  <input type="number" min={0} value={Math.round(courseInfo.duration_seconds / 60)} onChange={(e) => onCourseFieldChange('duration_seconds', (parseInt(e.target.value) || 0) * 60)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Statut</span>
                  <select value={courseInfo.status} onChange={(e) => onCourseFieldChange('status', e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body bg-white">
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                  </select>
                </label>
              </div>

              <Button variant="primary" onClick={onSaveCourse} loading={saving}>
                Enregistrer la formation
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* ── Lesson Editor ── */
        <div className="max-w-3xl space-y-6">
          <h2 className="text-xl font-bold font-heading text-kleia-dark">Éditer la leçon</h2>

          <Card>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">Titre de la leçon</span>
                <input type="text" value={selectedLesson.title} onChange={(e) => onLessonFieldChange('title', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">Description</span>
                <textarea rows={3} value={selectedLesson.description} onChange={(e) => onLessonFieldChange('description', e.target.value)} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body resize-y" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Type</span>
                  <select value={selectedLesson.lesson_type} onChange={(e) => onLessonFieldChange('lesson_type', e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body bg-white">
                    {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-kleia-dark">Durée (minutes)</span>
                  <input type="number" min={0} value={Math.round(selectedLesson.duration_seconds / 60)} onChange={(e) => onLessonFieldChange('duration_seconds', (parseInt(e.target.value) || 0) * 60)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
                </label>
              </div>

              <Button variant="primary" onClick={onSaveLesson} loading={saving}>
                Sauvegarder la leçon
              </Button>
            </div>
          </Card>

          {/* ── YouTube Video Section ── */}
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-3">▶ Vidéo YouTube</h3>
            <p className="text-xs text-kleia-gray font-body mb-3">
              Collez le lien de votre chaîne privée YouTube. La vignette sera générée automatiquement.
            </p>
            <div className="flex gap-2 mb-3">
              <input type="text" value={youtubeUrl} onChange={(e) => onYoutubeUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=XXX" aria-label="Lien YouTube" className="flex-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1" />
              <input type="text" value={youtubeTitle} onChange={(e) => onYoutubeTitleChange(e.target.value)} placeholder="Titre (optionnel)" aria-label="Titre de la vidéo" className="w-40 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1" />
            </div>
            <Button variant="secondary" size="sm" onClick={onAddYoutube} disabled={!youtubeUrl.trim()}>
              Ajouter la vidéo
            </Button>

            {lessonVideos.length > 0 && (
              <div className="mt-3 space-y-2">
                {lessonVideos.map(v => {
                  const ytId = v.playback_url?.match(/(?:embed\/)([a-zA-Z0-9_-]{11})/)?.[1];
                  return (
                    <div key={v.id} className="flex items-center gap-3 p-2 bg-kleia-dark/5 rounded-lg group">
                      {ytId && <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-20 h-12 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kleia-dark truncate">{v.title}</p>
                        {v.playback_url && <a href={v.playback_url} target="_blank" rel="noopener noreferrer" className="text-xs text-kleia-violet hover:underline">Voir sur YouTube</a>}
                      </div>
                      <button onClick={() => onDeleteVideo(v.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs" aria-label={`Supprimer la vidéo ${v.title}`}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ── External Media Section (Drive links) ── */}
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-3">📎 Ressources externes (Drive)</h3>
            <p className="text-xs text-kleia-gray font-body mb-3">
              Liens Google Drive pour les fichiers audio et PDF (pas de stockage sur le VPS).
            </p>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">🔊 Lien audio (Google Drive)</span>
                <input type="url" value={driveAudioUrl} onChange={(e) => onDriveAudioChange(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full mt-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">📄 Lien PDF (Google Drive)</span>
                <input type="url" value={drivePdfUrl} onChange={(e) => onDrivePdfChange(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full mt-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1" />
              </label>
            </div>
          </Card>

          {/* ── Content Editor (markdown) ── */}
          {selectedLesson.lesson_type === 'text' && (
            <Card>
              <h3 className="font-heading font-bold text-kleia-dark mb-3">📝 Contenu texte</h3>
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1 resize-y"
                placeholder="Écrivez le contenu en markdown..."
                aria-label="Contenu texte"
              />
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={onSaveContent}>
                  Sauvegarder le contenu
                </Button>
              </div>
            </Card>
          )}

          {/* ── AI Quiz Generation ── */}
          {quizVisible && (
            <Card>
              <h3 className="font-heading font-bold text-kleia-dark mb-3">🎯 Quiz IA</h3>

              {/* Error state */}
              {quizGenState === 'error' && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-body">
                    {quizError}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleGenerateQuiz}>
                    🔄 Réessayer
                  </Button>
                </div>
              )}

              {/* Generating state */}
              {quizGenState === 'generating' && (
                <div className="flex items-center gap-3 text-kleia-gray">
                  <svg className="animate-spin h-5 w-5 text-kleia-violet" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-body">Génération du quiz en cours...</span>
                </div>
              )}

              {/* Idle state — show generate button */}
              {quizGenState === 'idle' && (
                <div>
                  <p className="text-sm text-kleia-gray font-body mb-3">
                    Générez automatiquement un quiz QCM basé sur le contenu de cette leçon.
                  </p>
                  <Button variant="secondary" size="sm" onClick={handleGenerateQuiz}>
                    🤖 Générer un quiz
                  </Button>
                </div>
              )}

              {/* Preview state */}
              {quizGenState === 'preview' && generatedQuiz && (
                <div className="space-y-4">
                  <div className="bg-kleia-cream/50 border border-kleia-gold/30 rounded-lg p-4">
                    <p className="font-heading font-bold text-kleia-dark">
                      📋 {generatedQuiz.title}
                    </p>
                    <p className="text-xs text-kleia-gray font-body mt-1">
                      Score de réussite : {generatedQuiz.passing_score_percent}% — {generatedQuiz.questions.length} questions
                    </p>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {generatedQuiz.questions.map((q, qi) => (
                      <div key={qi} className="bg-white border border-kleia-dark/10 rounded-lg p-3">
                        <p className="font-heading font-semibold text-sm text-kleia-dark">
                          {qi + 1}. {q.text}
                        </p>
                        <p className="text-xs text-kleia-gray font-body mt-0.5">
                          {q.points} pt{q.points > 1 ? 's' : ''} — {q.question_type}
                        </p>
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={`text-xs font-body px-2 py-1 rounded ${
                                opt.is_correct
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-gray-50 text-kleia-gray border border-gray-100'
                              }`}
                            >
                              {opt.label}. {opt.text}
                              {opt.is_correct && (
                                <span className="ml-1 text-green-600 font-bold">✓</span>
                              )}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-kleia-gray font-body italic mt-1.5 border-t border-kleia-dark/5 pt-1.5">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-kleia-dark/10">
                    <Button variant="primary" size="sm" onClick={handleSaveQuiz}>
                      ✅ Sauvegarder ce quiz
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateQuiz}>
                      🔄 Regénérer
                    </Button>
                  </div>
                </div>
              )}

              {/* Saving state */}
              {quizGenState === 'saving' && (
                <div className="flex items-center gap-3 text-kleia-gray">
                  <svg className="animate-spin h-5 w-5 text-kleia-violet" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-body">Sauvegarde en cours...</span>
                </div>
              )}

              {/* Success state */}
              {quizGenState === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-body flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  Quiz créé avec succès !
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

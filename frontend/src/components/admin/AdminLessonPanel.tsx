import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

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
}: Props) {
  return (
    <main className="flex-1 overflow-y-auto p-6" role="region" aria-label={selectedLesson ? `Édition : ${selectedLesson.title}` : 'Informations de la formation'}>
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
                  <span className="text-sm font-medium text-kleia-dark">Durée (secondes)</span>
                  <input type="number" min={0} value={courseInfo.duration_seconds} onChange={(e) => onCourseFieldChange('duration_seconds', parseInt(e.target.value) || 0)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
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
                  <span className="text-sm font-medium text-kleia-dark">Durée (secondes)</span>
                  <input type="number" min={0} value={selectedLesson.duration_seconds} onChange={(e) => onLessonFieldChange('duration_seconds', parseInt(e.target.value) || 0)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-kleia-dark/20 focus:border-kleia-violet focus:ring-2 focus:ring-kleia-violet/20 outline-none font-body" />
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
              <input type="text" value={youtubeUrl} onChange={(e) => onYoutubeUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=XXX" className="flex-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet" />
              <input type="text" value={youtubeTitle} onChange={(e) => onYoutubeTitleChange(e.target.value)} placeholder="Titre (optionnel)" className="w-40 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet" />
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
                      <button onClick={() => onDeleteVideo(v.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
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
                <input type="url" value={driveAudioUrl} onChange={(e) => onDriveAudioChange(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full mt-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-kleia-dark">📄 Lien PDF (Google Drive)</span>
                <input type="url" value={drivePdfUrl} onChange={(e) => onDrivePdfChange(e.target.value)} placeholder="https://drive.google.com/file/d/..." className="w-full mt-1 px-3 py-2 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet" />
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
                className="w-full px-4 py-3 rounded-lg border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet resize-y"
                placeholder="Écrivez le contenu en markdown..."
              />
              <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={onSaveContent}>
                  Sauvegarder le contenu
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}

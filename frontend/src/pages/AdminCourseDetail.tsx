import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { getCourse, getCourseModules } from '@/api/courses';
import {
  createModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  addYoutubeVideo,
  listLessonVideos,
  deleteVideo,
  updateModule,
  reorderLesson,
} from '@/api/admin';
import { uploadResource, listLessonResources } from '@/api/resources';
import VideoUploader from '@/components/admin/VideoUploader';
import QuizEditor from '@/components/admin/QuizEditor';
import type { CourseDetail, Module } from '@/api/courses';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  lesson_type: string;
  duration_seconds: number;
}

interface VideoAsset {
  id: string;
  title: string;
  playback_url: string | null;
}

interface Resource {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
}

export default function AdminCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [lessonVideos, setLessonVideos] = useState<Record<string, VideoAsset[]>>({});
  const [lessonResources, setLessonResources] = useState<Record<string, Resource[]>>({});
  const [error, setError] = useState<string | null>(null);

  // New module form
  const [newModTitle, setNewModTitle] = useState('');
  const [showNewMod, setShowNewMod] = useState(false);

  // New lesson form
  const [newLessonModId, setNewLessonModId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonDur, setNewLessonDur] = useState(600);

  // YouTube URL form
  const [youtubeLessonId, setYoutubeLessonId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');

  // Video file upload
  const [videoFileLessonId, setVideoFileLessonId] = useState<string | null>(null);

  // Quiz editor
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);

  // Content editor
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  const load = useCallback(async () => {
    if (!courseId || courseId === 'new') return;
    setLoading(true);
    try {
      const c = await getCourse(courseId);
      setCourse(c);
      const mods = await getCourseModules(c.slug);
      setModules(mods || []);
    } catch {
      setCourse(null);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const toggleModule = async (modId: string) => {
    if (expandedModule === modId) {
      setExpandedModule(null);
      return;
    }
    setExpandedModule(modId);
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    for (const lesson of (mod as any).lessons || []) {
      if (!lessonVideos[lesson.id]) {
        try {
          const vids = await listLessonVideos(lesson.id);
          setLessonVideos(prev => ({ ...prev, [lesson.id]: vids || [] }));
        } catch { /* no videos */ }
      }
      if (!lessonResources[lesson.id]) {
        try {
          const res = await listLessonResources(lesson.id);
          setLessonResources(prev => ({ ...prev, [lesson.id]: res || [] }));
        } catch { /* no resources */ }
      }
    }
  };

  const handleNewModule = async () => {
    if (!newModTitle.trim() || !course) return;
    try {
      await createModule(course.id, {
        title: newModTitle.trim(),
        order: modules.length + 1,
      });
      setNewModTitle('');
      setShowNewMod(false);
      load();
    } catch { showError('Erreur création module'); }
  };

  const handleNewLesson = async (modId: string) => {
    if (!newLessonTitle.trim()) return;
    const lessonCount = ((modules.find(m => m.id === modId) as any)?.lessons?.length || 0);
    try {
      await createLesson(modId, {
        title: newLessonTitle.trim(),
        order: lessonCount + 1,
        lesson_type: newLessonType,
        duration_seconds: newLessonDur,
      });
      setNewLessonTitle('');
      setNewLessonType('video');
      setNewLessonModId(null);
      load();
    } catch { showError('Erreur création leçon'); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      await deleteLesson(lessonId);
      load();
    } catch { showError('Erreur suppression'); }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!window.confirm('Supprimer ce module et toutes ses leçons ?')) return;
    try {
      await deleteModule(modId);
      setExpandedModule(null);
      load();
    } catch { showError('Erreur suppression'); }
  };

  const handleMoveModule = async (modIdx: number, direction: 1 | -1) => {
    const target = modIdx + direction;
    if (target < 0 || target >= modules.length) return;
    const a = modules[modIdx] as any;
    const b = modules[target] as any;
    await updateModule(a.id, { order: b.order || target + 1 });
    await updateModule(b.id, { order: a.order || modIdx + 1 });
    load();
  };

  const handleMoveLesson = async (modIdx: number, lessonIdx: number, direction: 1 | -1) => {
    const mod = modules[modIdx] as any;
    const lessons: Lesson[] = mod.lessons || [];
    const target = lessonIdx + direction;
    if (target < 0 || target >= lessons.length) return;
    await reorderLesson(lessons[lessonIdx].id, lessons[target].order);
    await reorderLesson(lessons[target].id, lessons[lessonIdx].order);
    load();
  };

  function extractYoutubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  const handleAddYoutubeVideo = async () => {
    if (!youtubeLessonId || !youtubeUrl.trim()) return;
    const videoId = extractYoutubeId(youtubeUrl.trim());
    if (!videoId) {
      showError('URL YouTube invalide. Utilisez youtube.com/watch?v=XXX ou youtu.be/XXX');
      return;
    }
    try {
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const vid = await addYoutubeVideo(youtubeLessonId, embedUrl, youtubeTitle || 'Vidéo YouTube');
      setLessonVideos(prev => ({ ...prev, [youtubeLessonId]: [...(prev[youtubeLessonId] || []), vid] }));
      setYoutubeUrl('');
      setYoutubeTitle('');
      setYoutubeLessonId(null);
    } catch { showError("Erreur ajout vidéo YouTube. Vérifiez l'URL."); }
  };

  const handleResourceUpload = async (lessonId: string, file: File) => {
    try {
      const r = await uploadResource(lessonId, file, file.name);
      setLessonResources(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), r] }));
    } catch { showError('Erreur upload fichier'); }
  };

  const handleSaveContent = async (lessonId: string) => {
    try {
      await updateLesson(lessonId, { content: { markdown: editContent } });
      setEditingLesson(null);
    } catch { showError('Erreur sauvegarde'); }
  };

  if (loading) return <Loading className="py-20" text="Chargement..." />;

  if (!course) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body">Formation introuvable</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/courses')}>
          ← Retour
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Gestion du contenu de la formation">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-body">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/admin/courses')} className="text-sm text-kleia-gray hover:text-kleia-burgundy mb-1 block">
            ← Retour aux formations
          </button>
          <h1 className="text-2xl font-extrabold font-heading text-kleia-dark">{course.title}</h1>
          <p className="text-sm text-kleia-gray font-body">{modules.length} module{modules.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowNewMod(true)}>
          + Module
        </Button>
      </div>

      {showNewMod && (
        <Card className="border-l-4 border-kleia-gold">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newModTitle}
              onChange={(e) => setNewModTitle(e.target.value)}
              placeholder="Titre du nouveau module"
              className="flex-1 px-4 py-2 rounded-lg border border-kleia-dark/20 focus:border-kleia-burgundy focus:ring-2 focus:ring-kleia-burgundy/20 outline-none font-body"
              autoFocus
            />
            <Button variant="primary" size="sm" onClick={handleNewModule} disabled={!newModTitle.trim()}>
              Créer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowNewMod(false); setNewModTitle(''); }}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {modules.length === 0 && !showNewMod && (
        <EmptyState
          title="Aucun module"
          description="Créez votre premier module pour structurer cette formation."
          actionLabel="Créer un module"
          onAction={() => setShowNewMod(true)}
        />
      )}

      <div className="space-y-4">
        {modules.map((mod: any, mi: number) => {
          const lessons: Lesson[] = mod.lessons || [];
          const isExpanded = expandedModule === mod.id;
          return (
            <Card key={mod.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-kleia-dark/5 transition-colors"
                onClick={() => toggleModule(mod.id)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleModule(mod.id); } }}
              >
                <div className="flex items-center gap-1">
                  <div className="flex flex-col">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveModule(mi, -1); }}
                      disabled={mi === 0}
                      className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none"
                      aria-label="Remonter le module"
                    >▲</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveModule(mi, 1); }}
                      disabled={mi >= modules.length - 1}
                      className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none"
                      aria-label="Descendre le module"
                    >▼</button>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-kleia-dark">{mod.title}</h3>
                    <p className="text-xs text-kleia-gray font-body">{lessons.length} leçon{lessons.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e: any) => { e.stopPropagation(); setNewLessonModId(mod.id); }}>
                    + Leçon
                  </Button>
                  <Button variant="ghost" size="sm" className="!text-red-400" onClick={(e: any) => { e.stopPropagation(); handleDeleteModule(mod.id); }}>
                    Suppr.
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-kleia-dark/10">
                  {newLessonModId === mod.id && (
                    <div className="p-4 bg-kleia-cream/50 border-b border-kleia-dark/10">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Titre de la leçon"
                          className="flex-1 px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy"
                          autoFocus
                        />
                        <select value={newLessonType} onChange={(e) => setNewLessonType(e.target.value)} className="px-2 py-1.5 rounded border border-kleia-dark/20 text-sm font-body bg-white">
                          <option value="video">Vidéo</option>
                          <option value="quiz">Quiz</option>
                          <option value="text">Texte</option>
                          <option value="certificate">Certificat</option>
                        </select>
                        <input
                          type="number"
                          value={newLessonDur}
                          onChange={(e) => setNewLessonDur(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none"
                          placeholder="Durée (s)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => handleNewLesson(mod.id)} disabled={!newLessonTitle.trim()}>
                          Créer
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setNewLessonModId(null)}>Annuler</Button>
                      </div>
                    </div>
                  )}

                  {lessons.length === 0 && newLessonModId !== mod.id && (
                    <p className="p-4 text-sm text-kleia-gray font-body text-center">Aucune leçon</p>
                  )}

                  {lessons.map((lesson, li) => (
                    <div key={lesson.id} className="p-4 border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
                      <div className="flex items-start">
                        <div className="flex flex-col mr-2 pt-0.5">
                          <button
                            onClick={() => handleMoveLesson(mi, li, -1)}
                            disabled={li === 0}
                            className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none"
                            aria-label="Remonter la leçon"
                          >▲</button>
                          <button
                            onClick={() => handleMoveLesson(mi, li, 1)}
                            disabled={li >= lessons.length - 1}
                            className="text-xs text-kleia-gray hover:text-kleia-burgundy disabled:opacity-20 leading-none"
                            aria-label="Descendre la leçon"
                          >▼</button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={lesson.lesson_type === 'video' ? 'info' : lesson.lesson_type === 'quiz' ? 'warning' : 'default'}>
                              {lesson.lesson_type}
                            </Badge>
                            <h4 className="font-medium font-body text-kleia-dark truncate">{lesson.title}</h4>
                            <span className="text-xs text-kleia-gray/60">{Math.round(lesson.duration_seconds / 60)} min</span>
                          </div>

                          {/* Action buttons */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => { setYoutubeLessonId(lesson.id); setYoutubeUrl(''); setYoutubeTitle(''); setVideoFileLessonId(null); }}
                              className="text-xs text-kleia-burgundy cursor-pointer hover:underline"
                            >
                              + Ajouter une vidéo YouTube
                            </button>
                            <button
                              onClick={() => { setVideoFileLessonId(lesson.id); setYoutubeLessonId(null); }}
                              className="text-xs text-kleia-burgundy cursor-pointer hover:underline"
                            >
                              + Uploader une vidéo (fichier)
                            </button>
                            <label className="text-xs text-kleia-burgundy cursor-pointer hover:underline">
                              + Ajouter un fichier (PDF, doc...)
                              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResourceUpload(lesson.id, f); }} />
                            </label>
                            {lesson.lesson_type === 'quiz' && (
                              <button onClick={() => { setQuizLessonId(lesson.id); }} className="text-xs text-kleia-burgundy hover:underline">
                                + Gérer le quiz
                              </button>
                            )}
                            {lesson.lesson_type === 'text' && (
                              <button onClick={() => { setEditingLesson(lesson.id); setEditContent(''); }} className="text-xs text-kleia-burgundy hover:underline">
                                + Éditer le contenu texte
                              </button>
                            )}
                          </div>

                          {/* YouTube URL input */}
                          {youtubeLessonId === lesson.id && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-kleia-gray font-body mb-2">
                                Collez le lien YouTube de votre vidéo (publique ou non répertoriée)
                              </p>
                              <div className="flex items-center gap-2">
                                <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=XXXXXXXXXXX" className="flex-1 px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy" autoFocus />
                                <input type="text" value={youtubeTitle} onChange={(e) => setYoutubeTitle(e.target.value)} placeholder="Titre (optionnel)" className="w-40 px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy" />
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button variant="primary" size="sm" onClick={handleAddYoutubeVideo} disabled={!youtubeUrl.trim()}>Ajouter</Button>
                                <Button variant="ghost" size="sm" onClick={() => setYoutubeLessonId(null)}>Annuler</Button>
                              </div>
                            </div>
                          )}

                          {/* Video file upload */}
                          {videoFileLessonId === lesson.id && (
                            <VideoUploader
                              lessonId={lesson.id}
                              onUploaded={(vid) => {
                                setLessonVideos(prev => ({
                                  ...prev,
                                  [lesson.id]: [...(prev[lesson.id] || []), vid],
                                }));
                                setVideoFileLessonId(null);
                              }}
                              onCancel={() => setVideoFileLessonId(null)}
                            />
                          )}

                          {/* Quiz editor */}
                          {quizLessonId === lesson.id && (
                            <div className="mt-3">
                              <QuizEditor lessonId={lesson.id} onClose={() => setQuizLessonId(null)} />
                            </div>
                          )}

                          {/* Videos list */}
                          {(lessonVideos[lesson.id]?.length || 0) > 0 && (
                            <div className="mt-2 space-y-1">
                              {lessonVideos[lesson.id]?.map((v) => {
                                const isYt = v.playback_url && v.playback_url.includes('youtube.com/embed/');
                                return (
                                  <div key={v.id} className="flex items-center gap-2 text-xs text-kleia-gray group">
                                    <span>{isYt ? '▶️' : '🎬'} {v.title}</span>
                                    {v.playback_url && <a href={v.playback_url} target="_blank" rel="noopener noreferrer" className="text-kleia-burgundy hover:underline">{isYt ? 'Voir sur YouTube' : 'Voir'}</a>}
                                    <button
                                      onClick={async () => { await deleteVideo(v.id); load(); }}
                                      className="ml-auto text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label={`Supprimer la vidéo ${v.title}`}
                                    >✕</button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Resources list */}
                          {(lessonResources[lesson.id]?.length || 0) > 0 && (
                            <div className="mt-2 space-y-1">
                              {lessonResources[lesson.id]?.map((r) => (
                                <div key={r.id} className="flex items-center gap-2 text-xs text-kleia-gray">
                                  <span>📎 {r.title}</span>
                                  <a href={r.file_url} target="_blank" className="text-kleia-burgundy hover:underline">Télécharger</a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Content editor */}
                          {editingLesson === lesson.id && (
                            <div className="mt-3">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-burgundy resize-y"
                                placeholder="Contenu markdown / texte..."
                              />
                              <div className="flex gap-2 mt-2">
                                <Button variant="primary" size="sm" onClick={() => handleSaveContent(lesson.id)}>Sauvegarder</Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingLesson(null)}>Annuler</Button>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="!text-red-400 flex-shrink-0" onClick={() => handleDeleteLesson(lesson.id)} aria-label="Supprimer la leçon">
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

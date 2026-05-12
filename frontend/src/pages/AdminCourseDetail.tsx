import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { getCourse, getCourseModules } from '@/api/courses';
import { api } from '@/api';
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

  // New module form
  const [newModTitle, setNewModTitle] = useState('');
  const [showNewMod, setShowNewMod] = useState(false);

  // New lesson form
  const [newLessonModId, setNewLessonModId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');
  const [newLessonDur, setNewLessonDur] = useState(600);

  // Content editor
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const load = useCallback(async () => {
    if (!courseId || courseId === 'new') return;
    setLoading(true);
    try {
      const c = await getCourse(courseId);
      setCourse(c);
      // Load modules via slug
      const mods = await getCourseModules(c.slug);
      setModules(mods || []);
    } catch { setCourse(null); }
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const toggleModule = async (modId: string) => {
    if (expandedModule === modId) { setExpandedModule(null); return; }
    setExpandedModule(modId);
    // Load videos and resources for each lesson in this module
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    for (const lesson of (mod as any).lessons || []) {
      if (!lessonVideos[lesson.id]) {
        try {
          const vids = await api.request<VideoAsset[]>(`/admin/lessons/${lesson.id}/videos`);
          setLessonVideos(prev => ({ ...prev, [lesson.id]: vids || [] }));
        } catch { /* no videos */ }
      }
      if (!lessonResources[lesson.id]) {
        try {
          const res = await api.request<Resource[]>(`/admin/lessons/${lesson.id}/resources`);
          setLessonResources(prev => ({ ...prev, [lesson.id]: res || [] }));
        } catch { /* no resources */ }
      }
    }
  };

  const handleNewModule = async () => {
    if (!newModTitle.trim() || !course) return;
    try {
      await api.request(`/admin/courses/${course.id}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title: newModTitle.trim(), order: modules.length + 1 }),
      });
      setNewModTitle('');
      setShowNewMod(false);
      load();
    } catch { alert('Erreur création module'); }
  };

  const handleNewLesson = async (modId: string) => {
    if (!newLessonTitle.trim()) return;
    try {
      await api.request(`/admin/modules/${modId}/lessons`, {
        method: 'POST',
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          order: ((modules.find(m => m.id === modId) as any)?.lessons?.length || 0) + 1,
          lesson_type: newLessonType,
          duration_seconds: newLessonDur,
        }),
      });
      setNewLessonTitle('');
      setNewLessonType('video');
      setNewLessonModId(null);
      load();
    } catch { alert('Erreur création leçon'); }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    try {
      await api.request(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
      load();
    } catch { alert('Erreur suppression'); }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!window.confirm('Supprimer ce module et toutes ses leçons ?')) return;
    try {
      await api.request(`/admin/modules/${modId}`, { method: 'DELETE' });
      setExpandedModule(null);
      load();
    } catch { alert('Erreur suppression'); }
  };

  const handleVideoUpload = async (lessonId: string, file: File) => {
    const token = api.getToken();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}/videos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error();
      const vid = await res.json();
      setLessonVideos(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), vid] }));
    } catch { alert('Erreur upload vidéo'); }
  };

  const handleResourceUpload = async (lessonId: string, file: File) => {
    const token = api.getToken();
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    try {
      const res = await fetch(`/api/v1/admin/lessons/${lessonId}/resources`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error();
      const r = await res.json();
      setLessonResources(prev => ({ ...prev, [lessonId]: [...(prev[lessonId] || []), r] }));
    } catch { alert("Erreur upload fichier"); }
  };

  const handleSaveContent = async (lessonId: string) => {
    try {
      await api.request(`/admin/lessons/${lessonId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: { markdown: editContent } }),
      });
      setEditingLesson(null);
    } catch { alert('Erreur sauvegarde'); }
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
        <Card className="text-center py-12">
          <p className="text-kleia-gray font-body">Aucun module pour cette formation.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowNewMod(true)}>
            Créer un module
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {modules.map((mod: any) => {
          const lessons: Lesson[] = mod.lessons || [];
          const isExpanded = expandedModule === mod.id;
          return (
            <Card key={mod.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-kleia-dark/5 transition-colors" onClick={() => toggleModule(mod.id)} role="button" tabIndex={0} aria-expanded={isExpanded}>
                <div>
                  <h3 className="font-heading font-bold text-kleia-dark">{mod.title}</h3>
                  <p className="text-xs text-kleia-gray font-body">{lessons.length} leçon{lessons.length > 1 ? 's' : ''}</p>
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

                  {lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 border-b border-kleia-dark/5 last:border-0 hover:bg-kleia-dark/5 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={lesson.lesson_type === 'video' ? 'info' : lesson.lesson_type === 'quiz' ? 'warning' : 'default'}>
                              {lesson.lesson_type}
                            </Badge>
                            <h4 className="font-medium font-body text-kleia-dark truncate">{lesson.title}</h4>
                            <span className="text-xs text-kleia-gray/60">{Math.round(lesson.duration_seconds / 60)} min</span>
                          </div>

                          {/* Video section */}
                          <div className="mt-2 flex flex-wrap gap-2">
                            <label className="text-xs text-kleia-burgundy cursor-pointer hover:underline">
                              + Ajouter une vidéo
                              <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoUpload(lesson.id, f); }} />
                            </label>
                            <label className="text-xs text-kleia-burgundy cursor-pointer hover:underline">
                              + Ajouter un fichier (PDF, doc...)
                              <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResourceUpload(lesson.id, f); }} />
                            </label>
                            {lesson.lesson_type === 'text' && (
                              <button onClick={() => { setEditingLesson(lesson.id); setEditContent(''); }} className="text-xs text-kleia-burgundy hover:underline">
                                + Éditer le contenu texte
                              </button>
                            )}
                          </div>

                          {/* Videos list */}
                          {(lessonVideos[lesson.id]?.length || 0) > 0 && (
                            <div className="mt-2 space-y-1">
                              {lessonVideos[lesson.id]?.map((v) => (
                                <div key={v.id} className="flex items-center gap-2 text-xs text-kleia-gray">
                                  <span>🎬 {v.title}</span>
                                  {v.playback_url && <a href={v.playback_url} target="_blank" className="text-kleia-burgundy hover:underline">Voir</a>}
                                </div>
                              ))}
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
                        <Button variant="ghost" size="sm" className="!text-red-400 flex-shrink-0" onClick={() => handleDeleteLesson(lesson.id)}>
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

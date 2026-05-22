import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AdminCourseTree from '@/components/admin/AdminCourseTree';
import AdminLessonPanel from '@/components/admin/AdminLessonPanel';
import {
  getCourse, getCourseModules,
} from '@/api/courses';
import {
  createModule, deleteModule,
  createLesson, updateLesson, deleteLesson,
  addYoutubeVideo, listLessonVideos, deleteVideo,
  updateModule, reorderLesson,
  updateCourse,
} from '@/api/admin';
import type { CourseDetail, Module } from '@/api/courses';

/* ── Auto-save hook with debounce ── */
function useAutoSave(saveFn: () => Promise<void>, deps: any[], ms = 1500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSaving(true);
      try { await saveFnRef.current(); setLastSaved(new Date()); } catch {}
      setSaving(false);
    }, ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, deps);

  return { saving, lastSaved };
}

export default function AdminCourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sélection
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Lesson editor state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('video');
  const [editDur, setEditDur] = useState(600);
  const [editOrder, setEditOrder] = useState(0);

  // YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');

  // Drive links
  const [driveAudio, setDriveAudio] = useState('');
  const [drivePdf, setDrivePdf] = useState('');

  // Content editor
  const [editContent, setEditContent] = useState('');

  // Videos per lesson
  const [lessonVideos, setLessonVideos] = useState<Record<string, { id: string; title: string; playback_url: string | null }[]>>({});

  // Course info state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseShortDesc, setCourseShortDesc] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLevel, setCourseLevel] = useState('débutant');
  const [courseCat, setCourseCat] = useState('');
  const [courseDur, setCourseDur] = useState(3600);
  const [courseStatus, setCourseStatus] = useState('draft');

  // Preview mode
  const [preview, setPreview] = useState(false);

  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(null), 4000); };

  const load = useCallback(async () => {
    if (!courseId || courseId === 'new') { setLoading(false); return; }
    setLoading(true);
    try {
      const c = await getCourse(courseId);
      setCourse(c);
      setCourseTitle(c.title);
      setCourseShortDesc(c.short_description || '');
      setCourseDesc(c.description || '');
      setCourseLevel(c.level);
      setCourseCat(c.category || '');
      setCourseDur(c.duration_seconds);
      setCourseStatus(c.status);
      const mods = await getCourseModules(c.slug);
      setModules(mods || []);
    } catch { setCourse(null); }
    setLoading(false);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  // Load videos when selecting a lesson
  useEffect(() => {
    if (!selectedLessonId || lessonVideos[selectedLessonId]) return;
    listLessonVideos(selectedLessonId).then(vids => {
      setLessonVideos(prev => ({ ...prev, [selectedLessonId]: vids || [] }));
    }).catch(() => {});
  }, [selectedLessonId]);

  const selectedLesson = (() => {
    if (!selectedLessonId) return null;
    for (const mod of modules as any[]) {
      for (const les of (mod.lessons || [])) {
        if (les.id === selectedLessonId) return les;
      }
    }
    return null;
  })();

  // Sync selected lesson into editor state
  useEffect(() => {
    if (!selectedLesson) return;
    setEditTitle(selectedLesson.title || '');
    setEditDesc(selectedLesson.description || '');
    setEditType(selectedLesson.lesson_type || 'video');
    setEditDur(selectedLesson.duration_seconds || 600);
    setEditOrder(selectedLesson.order || 0);
    setYoutubeUrl('');
    setYoutubeTitle('');
    setDriveAudio('');
    setDrivePdf('');
    setEditContent('');
  }, [selectedLessonId]);

  // Auto-save course info
  const courseSave = useAutoSave(async () => {
    if (!course) return;
    await updateCourse(course.id, {
      title: courseTitle, short_description: courseShortDesc,
      description: courseDesc, level: courseLevel,
      category: courseCat, duration_seconds: courseDur, status: courseStatus,
    });
  }, [courseTitle, courseShortDesc, courseDesc, courseLevel, courseCat, courseDur, courseStatus, course?.id], 2000);

  // Auto-save lesson
  const lessonSave = useAutoSave(async () => {
    if (!selectedLesson) return;
    await updateLesson(selectedLesson.id, {
      title: editTitle, description: editDesc,
      lesson_type: editType, duration_seconds: editDur, order: editOrder,
    });
  }, [editTitle, editDesc, editType, editDur, editOrder, selectedLesson?.id], 2000);

  const handleAddModule = async () => {
    const title = prompt('Titre du module :');
    if (!title?.trim() || !course) return;
    try { await createModule(course.id, { title: title.trim(), order: modules.length + 1 }); load(); }
    catch { showError('Erreur création module'); }
  };

  const handleAddLesson = async (modId: string) => {
    const title = prompt('Titre de la leçon :');
    if (!title?.trim()) return;
    const mod = (modules as any[]).find(m => m.id === modId);
    const order = (mod?.lessons?.length || 0) + 1;
    try { await createLesson(modId, { title: title.trim(), order, lesson_type: 'video', duration_seconds: 600 }); load(); }
    catch { showError('Erreur création leçon'); }
  };

  const handleDeleteModule = async (modId: string) => {
    try { await deleteModule(modId); setExpandedModule(null); load(); }
    catch { showError('Erreur suppression'); }
  };

  const handleDeleteLesson = async (lesId: string) => {
    try { await deleteLesson(lesId); if (selectedLessonId === lesId) setSelectedLessonId(null); load(); }
    catch { showError('Erreur suppression'); }
  };

  const handleMoveModule = async (mi: number, dir: 1 | -1) => {
    const target = mi + dir;
    if (target < 0 || target >= modules.length) return;
    const a = modules[mi] as any; const b = modules[target] as any;
    await updateModule(a.id, { order: b.order || target + 1 });
    await updateModule(b.id, { order: a.order || mi + 1 });
    load();
  };

  const handleMoveLesson = async (mi: number, li: number, dir: 1 | -1) => {
    const mod = modules[mi] as any;
    const lessons = mod.lessons || [];
    const target = li + dir;
    if (target < 0 || target >= lessons.length) return;
    await reorderLesson(lessons[li].id, lessons[target].order);
    await reorderLesson(lessons[target].id, lessons[li].order);
    load();
  };

  const handleAddYoutube = async () => {
    if (!selectedLessonId || !youtubeUrl.trim()) return;
    const m = youtubeUrl.match(/(?:v=|\\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    if (!m) { showError('URL YouTube invalide'); return; }
    const embedUrl = `https://www.youtube.com/embed/${m[1]}`;
    try {
      await addYoutubeVideo(selectedLessonId, embedUrl, youtubeTitle || 'Vidéo YouTube');
      const vids = await listLessonVideos(selectedLessonId);
      setLessonVideos(prev => ({ ...prev, [selectedLessonId]: vids || [] }));
      setYoutubeUrl(''); setYoutubeTitle('');
    } catch { showError("Erreur ajout vidéo"); }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try { await deleteVideo(videoId); if (selectedLessonId) { const vids = await listLessonVideos(selectedLessonId); setLessonVideos(prev => ({ ...prev, [selectedLessonId]: vids || [] })); } }
    catch { showError('Erreur suppression vidéo'); }
  };

  const handleSaveContent = async () => {
    if (!selectedLesson) return;
    try { await updateLesson(selectedLesson.id, { content: { markdown: editContent } }); showError('Contenu sauvegardé'); }
    catch { showError('Erreur sauvegarde contenu'); }
  };

  if (loading) return <Loading className="py-20" text="Chargement..." />;
  if (!course && courseId !== 'new') {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body">Formation introuvable</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/courses')}>← Retour</Button>
      </Card>
    );
  }

  const treeData = {
    id: course?.id || '',
    title: courseTitle,
    modules,
    selectedLessonId,
  };

  const lessonPanelData = selectedLesson ? {
    id: selectedLesson.id,
    title: editTitle,
    description: editDesc,
    lesson_type: editType,
    duration_seconds: editDur,
    order: editOrder,
  } : null;

  const courseInfoData = {
    title: courseTitle, short_description: courseShortDesc, description: courseDesc,
    level: courseLevel, category: courseCat, duration_seconds: courseDur,
    status: courseStatus, slug: course?.slug || '',
  };

  return (
    <div className="flex flex-col -m-6 lg:-m-8 h-[calc(100vh-4rem)]">
      {/* Toast notifications */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-2 text-sm font-body text-center">{error}</div>
      )}

      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-kleia-border bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/courses')} className="text-sm text-kleia-gray hover:text-kleia-violet transition-colors font-body">
            ← Retour
          </button>
          <h1 className="text-lg font-heading font-bold text-kleia-dark">{courseTitle || 'Nouvelle formation'}</h1>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant={courseStatus === 'published' ? 'success' : 'default'}>
              {courseStatus === 'published' ? 'Publié' : 'Brouillon'}
            </Badge>
            {(courseSave.saving || lessonSave.saving) && (
              <Badge variant="default" className="!bg-kleia-violet/10 !text-kleia-violet animate-pulse">
                Sauvegarde…
              </Badge>
            )}
            {courseSave.lastSaved && !courseSave.saving && (
              <span className="text-[10px] text-kleia-gray/50 font-body">Auto-sauvegardé</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreview(!preview)}
            aria-label={preview ? 'Quitter le mode aperçu' : 'Aperçu apprenant'}
          >
            {preview ? '✕ Quitter l\'aperçu' : '👁️ Aperçu'}
          </Button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {!preview ? (
          <>
            <AdminCourseTree
              course={treeData}
              onSelectLesson={(id) => setSelectedLessonId(id)}
              onAddModule={handleAddModule}
              onAddLesson={handleAddLesson}
              onDeleteModule={handleDeleteModule}
              onDeleteLesson={handleDeleteLesson}
              onMoveModule={handleMoveModule}
              onMoveLesson={handleMoveLesson}
              onTitleChange={setCourseTitle}
              expandedModule={expandedModule}
              onToggleModule={(id) => setExpandedModule(expandedModule === id ? null : id)}
            />
            <AdminLessonPanel
              selectedLesson={lessonPanelData}
              courseInfo={courseInfoData}
              youtubeUrl={youtubeUrl}
              youtubeTitle={youtubeTitle}
              driveAudioUrl={driveAudio}
              drivePdfUrl={drivePdf}
              editContent={editContent}
              lessonVideos={selectedLessonId ? (lessonVideos[selectedLessonId] || []) : []}
              onLessonFieldChange={(f, v) => {
                if (f === 'title') setEditTitle(String(v));
                else if (f === 'description') setEditDesc(String(v));
                else if (f === 'lesson_type') setEditType(String(v));
                else if (f === 'duration_seconds') setEditDur(Number(v));
              }}
              onCourseFieldChange={(f, v) => {
                if (f === 'title') setCourseTitle(String(v));
                else if (f === 'short_description') setCourseShortDesc(String(v));
                else if (f === 'description') setCourseDesc(String(v));
                else if (f === 'level') setCourseLevel(String(v));
                else if (f === 'category') setCourseCat(String(v));
                else if (f === 'duration_seconds') setCourseDur(Number(v));
                else if (f === 'status') setCourseStatus(String(v));
              }}
              onYoutubeUrlChange={setYoutubeUrl}
              onYoutubeTitleChange={setYoutubeTitle}
              onAddYoutube={handleAddYoutube}
              onDriveAudioChange={setDriveAudio}
              onDrivePdfChange={setDrivePdf}
              onSaveLesson={handleSaveLesson}
              onSaveCourse={handleSaveCourse}
              onDeleteVideo={handleDeleteVideo}
              onEditContentChange={setEditContent}
              onSaveContent={handleSaveContent}
              saving={courseSave.saving || lessonSave.saving}
            />
          </>
        ) : (
          /* Preview mode: show what the learner sees */
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-kleia-cream via-white to-kleia-alt p-8">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold font-heading text-kleia-dark tracking-tight">
                  {courseTitle || 'Sans titre'}
                </h1>
                <p className="text-kleia-gray font-body">{courseShortDesc}</p>
              </div>
              {modules.length === 0 ? (
                <Card className="text-center py-12">
                  <p className="text-kleia-gray font-body">Aucun module pour le moment.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod: any, idx) => (
                    <Card key={mod.id} variant="surface" className="!p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-kleia-gray font-heading font-bold">{idx + 1}</span>
                        <div className="flex-1">
                          <h3 className="font-heading font-bold text-kleia-dark">{mod.title}</h3>
                          <p className="text-xs text-kleia-gray font-body mt-0.5">
                            {(mod.lessons || []).length} leçon(s)
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

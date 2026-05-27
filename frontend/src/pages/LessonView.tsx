import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import PlayerShell from '@/components/player/PlayerShell';
import JournalEditor from '@/components/journal/JournalEditor';
import { getLessonDetail, getLessonContent, type LessonDetail, type LessonContent } from '@/api/courses';
import { completeLesson } from '@/api/progress';
import type { VideoAssetRead } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface TranscriptCue {
  start: number;
  end: number;
  text: string;
}

/** Parse simple transcript text with timestamps like "[00:00] text" or VTT-style */
function parseTranscript(raw: string | null | undefined): TranscriptCue[] {
  if (!raw) return [];
  const cues: TranscriptCue[] = [];

  // Try VTT-style: "00:00:01.000 --> 00:00:05.000\nText"
  const vttBlock = /(\d{1,2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{3})\s*\n([\s\S]*?)(?=\n\d|$)/g;
  let match: RegExpExecArray | null;
  while ((match = vttBlock.exec(raw)) !== null) {
    const startH = parseInt(match[1]), startM = parseInt(match[2]), startS = parseInt(match[3]), startMs = parseInt(match[4]);
    const endH = parseInt(match[5]), endM = parseInt(match[6]), endS = parseInt(match[7]), endMs = parseInt(match[8]);
    const text = match[9].trim();
    cues.push({
      start: startH * 3600 + startM * 60 + startS + startMs / 1000,
      end: endH * 3600 + endM * 60 + endS + endMs / 1000,
      text,
    });
  }
  if (cues.length > 0) return cues;

  // Try simple [MM:SS] or [HH:MM:SS] prefix per line
  const lines = raw.split('\n');
  for (const line of lines) {
    const m = line.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.*)/);
    if (m) {
      const h = m[3] ? parseInt(m[1]) : 0;
      const min = m[3] ? parseInt(m[2]) : parseInt(m[1]);
      const sec = m[3] ? parseInt(m[3]) : parseInt(m[2]);
      cues.push({
        start: h * 3600 + min * 60 + sec,
        end: h * 3600 + min * 60 + sec + 5, // default 5s per cue
        text: m[4].trim(),
      });
    }
  }

  // Fallback: split into paragraphs
  if (cues.length === 0) {
    const paragraphs = raw.split(/\n\n+/).filter(Boolean);
    let t = 0;
    for (const p of paragraphs) {
      cues.push({ start: t, end: t + 10, text: p.trim() });
      t += 10;
    }
  }

  return cues;
}

// ── Component ────────────────────────────────────────────────────────────

export default function LessonView() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // ── Fetch lesson data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [lessonData, contentData] = await Promise.all([
          getLessonDetail(lessonId!),
          getLessonContent(lessonId!).catch(() => null), // content is optional
        ]);
        if (!cancelled) {
          setLesson(lessonData);
          setContent(contentData);
          if (lessonData.videos?.[0]?.duration_seconds) {
            setDuration(lessonData.videos[0].duration_seconds);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Leçon introuvable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [lessonId]);

  // ── Collect transcript cues ────────────────────────────────────────────
  const transcriptCues = (() => {
    // Prefer audio transcript_text
    const audioWithTranscript = lesson?.audio?.find(a => a.transcript_text);
    if (audioWithTranscript) {
      return parseTranscript(audioWithTranscript.transcript_text);
    }
    const contentAudio = content?.audio_files?.find(a => a.transcript_text);
    if (contentAudio) {
      return parseTranscript(contentAudio.transcript_text);
    }
    return [];
  })();

  const activeCueIndex = transcriptCues.findIndex(
    (cue, i) =>
      currentTime >= cue.start &&
      currentTime < cue.end &&
      (i === transcriptCues.length - 1 || currentTime < transcriptCues[i + 1].start),
  );

  // Auto-scroll transcript to active cue
  useEffect(() => {
    if (activeCueIndex < 0 || !transcriptRef.current) return;
    const activeEl = transcriptRef.current.querySelector(`[data-cue-index="${activeCueIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCueIndex]);

  // ── Navigation: prev / next ────────────────────────────────────────────
  const moduleLessons = lesson?.module?.lessons ?? [];
  const currentIdx = moduleLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? moduleLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < moduleLessons.length - 1 ? moduleLessons[currentIdx + 1] : null;

  // ── Complete lesson handler ────────────────────────────────────────────
  const handleComplete = useCallback(async () => {
    if (!lessonId || completed || completing) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      await completeLesson(lessonId);
      setCompleted(true);
    } catch (err: unknown) {
      setCompleteError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setCompleting(false);
    }
  }, [lessonId, completed, completing]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return <Loading className="py-20" text="Chargement de la leçon..." />;
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !lesson) {
    return (
      <Card className="text-center py-12">
        <p className="text-kleia-gray font-body text-lg">{error || 'Leçon introuvable'}</p>
        <Link to="/formations" className="text-kleia-violet font-heading font-semibold underline underline-offset-2 mt-2 inline-block">
          Retour aux formations
        </Link>
      </Card>
    );
  }

  // ── Build VideoAssetRead for PlayerShell ───────────────────────────────
  const firstVideo = lesson.videos?.[0];
  const videoForPlayer: VideoAssetRead | undefined = firstVideo ? {
    id: firstVideo.id,
    lesson_id: lesson.id,
    title: firstVideo.title,
    description: null,
    order: 0,
    source_storage_key: null,
    playback_manifest_url: firstVideo.playback_manifest_url,
    playback_url: firstVideo.playback_url,
    thumbnail_url: null,
    duration_seconds: firstVideo.duration_seconds,
    status: 'ready',
    language: 'fr',
    visibility: 'published',
    completion_threshold_percent: 80,
    tracks: firstVideo.tracks?.map(t => ({
      id: t.id,
      video_asset_id: firstVideo.id,
      kind: t.kind,
      language: t.language,
      label: t.label,
      file_url: t.file_url,
      is_default: t.is_default,
      status: 'ready',
      created_at: '',
    })) ?? null,
    created_by: '',
    created_at: '',
    updated_at: '',
  } : undefined;

  const lessonType = lesson.lesson_type;
  const durationStr = formatDuration(lesson.duration_seconds);
  const hasTranscript = transcriptCues.length > 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-kleia-gray hover:text-kleia-violet font-body transition-colors inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Main content (2 cols) ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player */}
          <PlayerShell
            video={videoForPlayer}
            onTimeUpdate={setCurrentTime}
          />

          {/* Lesson header */}
          <div className="space-y-2">
            <h1>{lesson.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {durationStr && <Badge variant="warning">{durationStr}</Badge>}
              {lessonType === 'quiz' && <Badge variant="warning">Quiz</Badge>}
              {lessonType === 'certificate' && <Badge variant="success">Certificat</Badge>}
              {completed && <Badge variant="success">Terminé ✓</Badge>}
            </div>
            {lesson.description && (
              <p className="text-kleia-gray font-body text-sm leading-relaxed">{lesson.description}</p>
            )}
          </div>

          {/* Action bar: navigation + complete */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {prevLesson ? (
                <Link to={`/lecon/${prevLesson.id}`}>
                  <Button variant="outline" size="sm">← Précédent</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>← Précédent</Button>
              )}
              {nextLesson ? (
                <Link to={`/lecon/${nextLesson.id}`}>
                  <Button variant="outline" size="sm">Suivant →</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" className="!border-kleia-success !text-kleia-success" disabled>
                  Fin de la formation
                </Button>
              )}
            </div>
            <Button
              variant={completed ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleComplete}
              disabled={completing || completed}
              aria-label={completed ? 'Leçon terminée' : 'Marquer comme terminé'}
            >
              {completing ? 'Enregistrement...' : completed ? '✓ Terminé' : 'Marquer comme terminé'}
            </Button>
          </div>
          {completeError && (
            <p className="text-sm text-red-500 font-body">{completeError}</p>
          )}

          {/* Transcription panel */}
          <Card>
            <button
              onClick={() => setTranscriptOpen(!transcriptOpen)}
              className="w-full flex items-center justify-between text-left"
              aria-expanded={transcriptOpen}
            >
              <h2 className="font-heading font-bold text-kleia-dark">
                Transcription
                {hasTranscript && (
                  <span className="ml-2 text-xs font-normal text-kleia-gray font-body">
                    ({transcriptCues.length} segments)
                  </span>
                )}
              </h2>
              <svg
                className={clsx('w-5 h-5 text-kleia-gray transition-transform', transcriptOpen && 'rotate-180')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {transcriptOpen && (
              <div
                ref={transcriptRef}
                className="mt-4 border-t border-kleia-dark/10 pt-4 max-h-[50vh] overflow-y-auto space-y-1"
              >
                {hasTranscript ? (
                  transcriptCues.map((cue, i) => (
                    <div
                      key={i}
                      data-cue-index={i}
                      className={clsx(
                        'flex gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                        i === activeCueIndex
                          ? 'bg-kleia-violet/10 border-l-3 border-kleia-violet'
                          : 'hover:bg-kleia-dark/5 border-l-3 border-transparent',
                      )}
                      onClick={() => {
                        // Seek video — dispatch to the <video> element
                        const videoEl = document.querySelector('video');
                        if (videoEl) {
                          videoEl.currentTime = cue.start;
                        }
                      }}
                      title={`${formatTime(cue.start)} → ${formatTime(cue.end)}`}
                    >
                      <span className={clsx(
                        'text-xs font-mono shrink-0 mt-0.5',
                        i === activeCueIndex ? 'text-kleia-violet font-bold' : 'text-kleia-gray',
                      )}>
                        {formatTime(cue.start)}
                      </span>
                      <span className={clsx(
                        'text-sm font-body leading-relaxed',
                        i === activeCueIndex ? 'text-kleia-dark' : 'text-kleia-gray',
                      )}>
                        {cue.text}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3 text-sm text-kleia-gray font-body leading-relaxed">
                    <p>Aucune transcription n'est disponible pour cette leçon. Les sous-titres sont accessibles directement dans le lecteur vidéo.</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Journal editor */}
          <div className="mt-6">
            <JournalEditor lessonId={lesson.id} />
          </div>
        </div>

        {/* ── Sidebar (1 col) ────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Module navigation */}
          <Card>
            <h2 className="font-heading font-bold text-kleia-dark mb-3">
              {lesson.module?.title || 'Navigation'}
            </h2>
            <div className="space-y-2">
              {moduleLessons.map((l) => (
                <Link
                  key={l.id}
                  to={`/lecon/${l.id}`}
                  className={clsx(
                    'block p-3 rounded-lg transition-colors',
                    l.id === lessonId
                      ? 'bg-kleia-violet/10 border border-kleia-violet/20'
                      : 'bg-kleia-dark/5 hover:bg-kleia-violet/10',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'text-xs font-mono shrink-0',
                      l.id === lessonId ? 'text-kleia-violet font-bold' : 'text-kleia-gray',
                    )}>
                      {l.order}.
                    </span>
                    <p className={clsx(
                      'text-sm font-medium font-body truncate',
                      l.id === lessonId ? 'text-kleia-violet' : 'text-kleia-dark',
                    )}>
                      {l.title}
                    </p>
                    {l.id === lessonId && (
                      <span className="ml-auto text-xs text-kleia-violet font-bold">●</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Previous / Next navigation */}
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-3">Navigation</h3>
            <div className="space-y-2">
              {prevLesson && (
                <Link
                  to={`/lecon/${prevLesson.id}`}
                  className="block p-3 rounded-lg bg-kleia-dark/5 hover:bg-kleia-violet/10 transition-colors"
                >
                  <span className="text-xs text-kleia-gray font-body">← Leçon précédente</span>
                  <p className="text-sm font-medium text-kleia-dark font-body truncate">{prevLesson.title}</p>
                </Link>
              )}
              {nextLesson && (
                <Link
                  to={`/lecon/${nextLesson.id}`}
                  className="block p-3 rounded-lg bg-kleia-gold/10 hover:bg-kleia-gold/20 transition-colors border border-kleia-gold/20"
                >
                  <span className="text-xs text-kleia-gray font-body">Leçon suivante →</span>
                  <p className="text-sm font-medium text-kleia-dark font-body truncate">{nextLesson.title}</p>
                </Link>
              )}
              {!prevLesson && !nextLesson && (
                <p className="text-sm text-kleia-gray font-body text-center py-2">Module unique</p>
              )}
            </div>
          </Card>

          {/* Lesson info */}
          <Card>
            <h3 className="font-heading font-bold text-kleia-dark mb-2">À propos de cette leçon</h3>
            <div className="space-y-2 text-sm text-kleia-gray font-body">
              <p>Type : {lessonType === 'video' ? '🎬 Vidéo' : lessonType === 'quiz' ? '📝 Quiz' : '🏆 Certificat'}</p>
              <p>Durée : {durationStr}</p>
              <p>Statut : {completed ? 'Terminé ✓' : 'En cours'}</p>
              {lesson.module && <p>Module : {lesson.module.title}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

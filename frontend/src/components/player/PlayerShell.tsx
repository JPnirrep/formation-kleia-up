import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { recordVideoEvent, updateVideoProgress } from '@/api';
import type { VideoAssetRead } from '@/types';
import YouTubePlayer from './YouTubePlayer';

interface PlayerShellProps {
  video?: VideoAssetRead;
  className?: string;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function PlayerShell({ video, className }: PlayerShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef(generateSessionId());
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRefState = useRef(video);
  videoRefState.current = video;

  const playbackUrl = video?.playback_url ?? null;
  const isYoutube = playbackUrl?.includes('youtube.com/embed/') ?? false;

  const sendEventRef = useRef((_eventType: string, _position?: number) => {});
  sendEventRef.current = (eventType: string, position?: number) => {
    const v = videoRefState.current;
    if (!v) return;
    recordVideoEvent(v.id, {
      session_id: sessionRef.current,
      event_type: eventType,
      position_seconds: position ?? currentTime,
    }).catch(() => {});
  };

  const sendProgressRef = useRef((_completed?: boolean) => {});
  sendProgressRef.current = (completed = false) => {
    const el = videoRef.current;
    if (!videoRefState.current || !el) return;
    updateVideoProgress(videoRefState.current.id, {
      last_position_seconds: el.currentTime,
      max_position_seconds: el.duration,
      percent_watched: el.duration > 0 ? (el.currentTime / el.duration) * 100 : 0,
      completed,
    }).catch(() => {});
  };

  // Handle video element events (only for non-YouTube)
  useEffect(() => {
    if (isYoutube) return;
    const el = videoRef.current;
    if (!el || !playbackUrl) return;

    setStatus('loading');
    el.src = playbackUrl;
    el.load();

    const onLoaded = () => {
      setStatus('ready');
      setDuration(el.duration);
      sendEventRef.current('play', 0);
    };

    const onError = () => {
      setStatus('error');
      setErrorMsg('Erreur de chargement de la vidéo.');
    };

    const onPlay = () => {
      setIsPlaying(true);
      sendEventRef.current('play', el.currentTime);
    };

    const onPause = () => {
      setIsPlaying(false);
      sendEventRef.current('pause', el.currentTime);
      sendProgressRef.current();
    };

    const onEnded = () => {
      setIsPlaying(false);
      sendEventRef.current('ended', el.duration);
      sendProgressRef.current(true);
    };

    const onSeeked = () => {
      sendEventRef.current('seek', el.currentTime);
    };

    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
    };

    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('error', onError);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('seeked', onSeeked);
    el.addEventListener('timeupdate', onTimeUpdate);

    heartbeatRef.current = setInterval(() => {
      sendEventRef.current('heartbeat', el.currentTime);
      sendProgressRef.current();
    }, 30000);

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('error', onError);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('seeked', onSeeked);
      el.removeEventListener('timeupdate', onTimeUpdate);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      sendEventRef.current('ended', el.currentTime);
    };
  }, [playbackUrl, isYoutube]);

  if (!playbackUrl) {
    return (
      <div className={clsx('relative w-full aspect-video glass-dark flex items-center justify-center overflow-hidden', className)}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          <svg className="w-16 h-16 text-kleia-burgundy/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          <h3 className="text-lg font-bold font-heading text-kleia-dark">{video?.title || 'Vidéo'}</h3>
          <p className="text-sm text-kleia-gray">Aucune vidéo disponible pour cette leçon.</p>
        </div>
      </div>
    );
  }

  // YouTube embed
  if (isYoutube) {
    const videoId = playbackUrl.split('/').pop()?.split('?')[0] || '';
    
    return (
      <div className={clsx('relative w-full aspect-video bg-black overflow-hidden rounded-kleia', className)}>
        <YouTubePlayer 
          videoId={videoId}
          className="w-full h-full"
          onProgress={(percent, currentTime, duration) => {
            setCurrentTime(currentTime);
            setDuration(duration);
            sendProgressRef.current();
          }}
          onEnded={() => {
            sendEventRef.current('ended');
            sendProgressRef.current(true);
          }}
        />
        {video?.title && (
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <h3 className="text-white text-sm font-bold font-heading truncate">{video.title}</h3>
          </div>
        )}
      </div>
    );
  }

  // HTML5 video player
  return (
    <div className={clsx('relative w-full aspect-video bg-black overflow-hidden rounded-kleia', className)}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-kleia-burgundy border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-body">Chargement...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60">
          <p className="text-kleia-gold text-sm font-body">{errorMsg}</p>
        </div>
      )}

      <video ref={videoRef} className="w-full h-full object-contain" controls playsInline preload="metadata" aria-label={video?.title || 'Lecteur vidéo'}>
        {video?.tracks?.map((track) => (
          <track key={track.id} kind={track.kind as TextTrackKind} src={track.file_url} srcLang={track.language} label={track.label} default={track.is_default} />
        ))}
      </video>

      {video?.title && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
          <h3 className="text-white text-sm font-bold font-heading truncate">{video.title}</h3>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/40 pointer-events-none text-right">
        <span className="text-white/60 text-xs font-body">
          {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
          {' / '}
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

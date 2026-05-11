import clsx from 'clsx';

interface PlayerShellProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
  className?: string;
}

export default function PlayerShell({ videoUrl, posterUrl, title, className }: PlayerShellProps) {
  return (
    <div
      className={clsx(
        'relative w-full aspect-video glass-dark flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      {posterUrl && (
        <img
          src={posterUrl}
          alt={title || 'Aperçu de la vidéo'}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <svg
          className="w-16 h-16 text-kleia-burgundy/60"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>

        {title && (
          <h3 className="text-lg font-bold font-heading text-kleia-dark">
            {title}
          </h3>
        )}

        <p className="text-sm text-kleia-gray">
          {videoUrl
            ? 'Lecteur vidéo prêt'
            : 'Player vidéo — à implémenter en Phase 2'}
        </p>
      </div>
    </div>
  );
}
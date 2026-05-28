import { useState } from 'react';
import Button from '@/components/ui/Button';
import { uploadVideoFile } from '@/api/admin';

interface VideoUploaderProps {
  lessonId: string;
  onUploaded: (video: { id: string; title: string; playback_url: string | null }) => void;
  onCancel: () => void;
}

export default function VideoUploader({ lessonId, onUploaded, onCancel }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const result = await uploadVideoFile(lessonId, file, title || undefined, setProgress);
      onUploaded(result);
    } catch {
      setError("Erreur lors de l'upload. Vérifiez le fichier et réessayez.");
    }
    setUploading(false);
  };

  return (
    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
      <p className="text-xs text-kleia-gray font-body mb-2">
        Sélectionnez un fichier vidéo (.mp4, .webm, .mov) à uploader
      </p>

      {!uploading && (
        <>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la vidéo (optionnel)"
              className="w-full px-3 py-1.5 rounded border border-kleia-dark/20 text-sm font-body outline-none focus:border-kleia-violet focus:ring-2 focus:ring-kleia-gold focus:ring-offset-1"
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setError(null);
              }}
              className="text-sm font-body"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="primary" size="sm" onClick={handleUpload} disabled={!file}>
              Uploader
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>Annuler</Button>
          </div>
        </>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-kleia-dark/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-kleia-violet h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-kleia-gray font-body">{progress}% — {file?.name}</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

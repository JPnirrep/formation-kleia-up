import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface KleiaCraftErrorProps {
  errorMessage: string;
  onRetry: () => void;
  onReset: () => void;
}

export default function KleiaCraftError({ errorMessage, onRetry, onReset }: KleiaCraftErrorProps) {
  return (
    <Card variant="surface" className="max-w-2xl mx-auto border-l-4 border-kleia-error">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0" aria-hidden="true">❌</span>
          <div>
            <h2 className="text-lg font-bold font-heading text-kleia-error">Erreur de génération</h2>
            <p className="text-sm font-body text-kleia-dark mt-1 leading-relaxed">
              {errorMessage}
            </p>
            {errorMessage.includes('clé API') && (
              <div className="mt-3 p-3 bg-kleia-warning/10 border border-kleia-warning/20 rounded-kleia">
                <p className="text-xs font-body text-kleia-dark">
                  <strong>💡 Conseil :</strong> Vérifiez que la variable d'environnement <code className="bg-kleia-dark/10 px-1 py-0.5 rounded text-xs">KLEIA_CRAFT_API_KEY</code> est configurée sur le serveur backend.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" size="md" onClick={onRetry}>
            Réessayer
          </Button>
          <Button variant="ghost" size="md" onClick={onReset}>
            Effacer et recommencer
          </Button>
        </div>
      </div>
    </Card>
  );
}

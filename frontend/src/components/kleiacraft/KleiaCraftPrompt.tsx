import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useRef } from 'react';

interface KleiaCraftPromptProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  onGenerate: () => void;
  isValid: boolean;
}

export default function KleiaCraftPrompt({ prompt, onPromptChange, onGenerate, isValid }: KleiaCraftPromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Card variant="elevated" className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="kleiacraft-prompt"
            className="block text-sm font-semibold font-heading text-kleia-dark"
          >
            Votre description
          </label>
          <textarea
            ref={textareaRef}
            id="kleiacraft-prompt"
            data-testid="kleiacraft-prompt"
            rows={6}
            className="w-full px-4 py-3 rounded-kleia border border-kleia-dark/20 bg-white text-kleia-dark placeholder:text-kleia-gray/60 font-body text-sm resize-y transition-colors focus:outline-none focus:ring-2 focus:ring-kleia-violet focus:border-kleia-violet"
            placeholder="Ex: Une formation sur la communication non-violente pour managers, avec des modules sur l'écoute active, la gestion des conflits et les feedbacks constructifs."
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            aria-describedby={!isValid && prompt.trim().length > 0 ? 'prompt-error' : undefined}
          />
          {!isValid && prompt.trim().length > 0 && (
            <p id="prompt-error" className="text-sm text-kleia-error font-body" role="alert">
              Minimum 10 caractères requis ({prompt.trim().length}/10).
            </p>
          )}
          <p className="text-xs text-kleia-gray font-body">
            Soyez précis·e : indiquez le public cible, les objectifs et les thèmes souhaités.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="premium"
            size="lg"
            disabled={!isValid}
            data-testid="kleiacraft-generate"
            onClick={onGenerate}
            aria-label="Générer la formation avec l'intelligence artificielle"
          >
            🚀 Générer la formation
          </Button>
        </div>
      </div>
    </Card>
  );
}

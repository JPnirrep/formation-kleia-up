import Loading from '@/components/ui/Loading';

export default function KleiaCraftGenerating() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6" role="status" aria-live="polite">
      <Loading size="lg" />
      <p className="text-lg font-heading font-bold text-kleia-violet animate-pulse">
        KleiaCraft réfléchit
        <span className="animate-[dot-pulse_1.5s_steps(4)_infinite]">.</span>
        <span className="animate-[dot-pulse_1.5s_steps(4)_infinite_0.3s]">.</span>
        <span className="animate-[dot-pulse_1.5s_steps(4)_infinite_0.6s]">.</span>
      </p>
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
      <p className="text-sm text-kleia-gray font-body max-w-md text-center">
        Analyse de votre requête, recherche des meilleures structures pédagogiques et génération du contenu…
      </p>
    </div>
  );
}

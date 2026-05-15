import { MessageCircle, Send, Mail, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function CoachingHub() {
  const coach = {
    name: "Sandrina",
    role: "Master Coach KLEIA",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    description: "Je vous accompagne tout au long de votre parcours pour assurer votre progression et l'atteinte de vos objectifs les plus ambitieux.",
    whatsapp: "https://wa.me/33600000000",
    telegram: "https://t.me/sandrinakleia",
    email: "mailto:coach@kleia.com"
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-kleia-dark">
          Conciergerie <span className="text-transparent bg-clip-text gradient-gold">KLEIA</span>
        </h1>
        <p className="text-lg text-kleia-gray font-body max-w-2xl mx-auto">
          Un accompagnement d'élite, sur-mesure et réactif. Connectez-vous directement avec votre coach dédié.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Profil du coach */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white/60 backdrop-blur-md">
          <div className="aspect-video relative overflow-hidden rounded-t-xl -mx-6 -mt-6 mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-kleia-dark/80 to-transparent z-10" />
            <img 
              src={coach.avatar} 
              alt={`Portrait de ${coach.name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-6 z-20 text-white">
              <h2 className="text-2xl font-heading font-bold">{coach.name}</h2>
              <p className="font-body opacity-90">{coach.role}</p>
            </div>
          </div>
          <p className="text-kleia-dark/80 font-body leading-relaxed">
            "{coach.description}"
          </p>
        </Card>

        {/* Canaux de communication */}
        <div className="space-y-4">
          <h3 className="text-xl font-heading font-bold text-kleia-dark mb-4">Connexion Rapide</h3>
          
          <a href={coach.whatsapp} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="hover:shadow-lg transition-shadow border-kleia-dark/5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-kleia-dark">WhatsApp Privé</h4>
                <p className="text-sm text-kleia-gray font-body">Réponse garantie en moins de 4h</p>
              </div>
            </Card>
          </a>

          <a href={coach.telegram} target="_blank" rel="noopener noreferrer" className="block">
            <Card className="hover:shadow-lg transition-shadow border-kleia-dark/5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-kleia-dark">Canal Telegram</h4>
                <p className="text-sm text-kleia-gray font-body">Échanges vocaux et ressources rapides</p>
              </div>
            </Card>
          </a>

          <a href={coach.email} className="block">
            <Card className="hover:shadow-lg transition-shadow border-kleia-dark/5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-kleia-burgundy/10 flex items-center justify-center text-kleia-burgundy group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-kleia-dark">Email Premium</h4>
                <p className="text-sm text-kleia-gray font-body">Pour les revues détaillées</p>
              </div>
            </Card>
          </a>

          <div className="pt-4 border-t border-kleia-dark/10">
            <Button className="w-full" variant="secondary" size="lg">
              <Calendar className="w-5 h-5" />
              Planifier un Audit (H1)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

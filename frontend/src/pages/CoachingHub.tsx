import { useState, useEffect } from 'react';
import { MessageCircle, Send, Mail } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';

export default function CoachingHub() {
  useEffect(() => { document.title = 'Coaching — Kleia-up'; }, []);
  const [channels, setChannels] = useState({
    whatsapp: true,
    telegram: false,
    email: true,
  });

  const coach = {
    name: 'Sandrina',
    whatsapp: 'https://wa.me/33600000000',
    telegram: 'https://t.me/sandrinakleia',
    email: 'mailto:coach@kleia.com',
  };

  const handleChannelToggle = (channel: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const allConnected = Object.values(channels).every(status => status);

  return (
    <div className='max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <div className='text-center space-y-4'>
        <h1 className='text-3xl md:text-5xl font-heading font-bold text-kleia-dark'>
          Lien Direct avec <span className='text-transparent bg-clip-text gradient-gold'>{coach.name}</span>
        </h1>
        <p className='text-lg text-kleia-gray font-body max-w-2xl mx-auto'>
          Votre espace privilégié pour un accompagnement fluide. Activez vos canaux de communication préférés.
        </p>
      </div>

      {!allConnected && (
        <Card className='bg-kleia-cream border-kleia-gold/50'>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='flex-1'>
              <h2 className='text-xl font-heading font-bold text-kleia-violet'>Activez vos Canaux</h2>
              <p className='text-kleia-gray font-body mt-2'>
                Pour une expérience optimale, activez les canaux que vous utilisez au quotidien pour échanger avec Sandrina.
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <div className='space-y-4'>
        <h3 className='text-xl font-heading font-bold text-kleia-dark'>Vos Canaux de Communication</h3>
        
        <Card className='p-4 sm:p-6 flex items-center justify-between transition-all'>
          <a href={coach.whatsapp} target='_blank' rel='noopener noreferrer' className='flex items-center gap-4 group'>
            <div className='w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform'>
              <MessageCircle className='w-6 h-6' />
            </div>
            <div>
              <h4 className='font-heading font-bold text-kleia-dark'>WhatsApp Privé</h4>
              <p className='text-sm text-kleia-gray font-body'>Pour les échanges rapides et directs.</p>
            </div>
          </a>
          <div className='flex items-center space-x-2'>
            <Label htmlFor='whatsapp-toggle' className='text-sm text-kleia-gray'>{channels.whatsapp ? 'Activé' : 'Activer'}</Label>
            <Switch id='whatsapp-toggle' checked={channels.whatsapp} onChange={() => handleChannelToggle('whatsapp')} />
          </div>
        </Card>

        <Card className='p-4 sm:p-6 flex items-center justify-between transition-all'>
          <a href={coach.telegram} target='_blank' rel='noopener noreferrer' className='flex items-center gap-4 group'>
            <div className='w-12 h-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform'>
              <Send className='w-6 h-6' />
            </div>
            <div>
              <h4 className='font-heading font-bold text-kleia-dark'>Canal Telegram</h4>
              <p className='text-sm text-kleia-gray font-body'>Idéal pour les messages vocaux et les partages.</p>
            </div>
          </a>
          <div className='flex items-center space-x-2'>
            <Label htmlFor='telegram-toggle' className='text-sm text-kleia-gray'>{channels.telegram ? 'Activé' : 'Activer'}</Label>
            <Switch id='telegram-toggle' checked={channels.telegram} onChange={() => handleChannelToggle('telegram')} />
          </div>
        </Card>
        
        <Card className='p-4 sm:p-6 flex items-center justify-between transition-all'>
          <a href={coach.email} className='flex items-center gap-4 group'>
            <div className='w-12 h-12 rounded-full bg-kleia-violet/10 flex items-center justify-center text-kleia-violet group-hover:scale-110 transition-transform'>
              <Mail className='w-6 h-6' />
            </div>
            <div>
              <h4 className='font-heading font-bold text-kleia-dark'>Email Premium</h4>
              <p className='text-sm text-kleia-gray font-body'>Parfait pour les réflexions et bilans détaillés.</p>
            </div>
          </a>
          <div className='flex items-center space-x-2'>
            <Label htmlFor='email-toggle' className='text-sm text-kleia-gray'>{channels.email ? 'Activé' : 'Activer'}</Label>
            <Switch id='email-toggle' checked={channels.email} onChange={() => handleChannelToggle('email')} />
          </div>
        </Card>
      </div>
    </div>
  );
}

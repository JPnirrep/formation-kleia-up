import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeNotificationProps {
  badge: {
    name: string;
    description: string;
    image_url?: string;
  };
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-8 right-8 z-50 glass p-1 bg-gradient-to-br from-kleia-gold/20 to-transparent"
    >
      <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-xl rounded-kleia border border-kleia-gold/30 shadow-gold">
        <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-kleia-gold to-kleia-gold-light rounded-full flex items-center justify-center shadow-lg">
          {badge.image_url ? (
            <img src={badge.image_url} alt={badge.name} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-2xl">🏆</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-kleia-gold uppercase tracking-widest">Nouveau Badge !</span>
          <h3 className="text-lg font-bold font-heading text-kleia-dark">{badge.name}</h3>
          <p className="text-sm text-kleia-gray leading-tight">{badge.description}</p>
        </div>
        <button 
          onClick={onClose}
          className="ml-2 p-1 hover:bg-kleia-dark/5 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-kleia-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

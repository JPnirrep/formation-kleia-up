import React from 'react';
import { motion } from 'framer-motion';

interface LinearProgressGuardProps {
  isLocked: boolean;
  requiredLessonTitle?: string;
  children: React.ReactNode;
}

export default function LinearProgressGuard({ isLocked, requiredLessonTitle, children }: LinearProgressGuardProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="filter blur-[4px] pointer-events-none select-none">
        {children}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-kleia-dark/40 backdrop-blur-[2px] rounded-kleia"
      >
        <div className="glass-dark p-8 max-w-md text-center border-white/10 shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-kleia-dark/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-kleia-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold font-heading text-white mb-2">Contenu Verrouillé</h3>
          <p className="text-white/70 text-sm mb-6">
            Cette leçon fait partie d'un parcours linéaire. Vous devez terminer la leçon précédente pour y accéder.
          </p>
          
          {requiredLessonTitle && (
            <div className="bg-white/10 rounded-lg p-3 mb-6">
              <span className="text-xs text-white/50 uppercase block mb-1">Prérequis</span>
              <span className="text-kleia-gold font-bold">{requiredLessonTitle}</span>
            </div>
          )}
          
          <button className="w-full py-3 bg-white text-kleia-dark font-bold rounded-lg hover:bg-kleia-gold hover:text-white transition-all shadow-lg">
            Retourner à la leçon précédente
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getMyGamification } from '@/api/gamification';
import type { GamificationData } from '@/api/gamification';

interface GamificationContextType {
  gamification: GamificationData | null;
  loading: boolean;
  error: string | null;
  refreshGamification: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);
export { GamificationContext };

const POLLING_INTERVAL = 60_000; // 60 secondes

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamification = useCallback(async () => {
    try {
      const data = await getMyGamification();
      setGamification(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement des données de gamification';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamification();

    const interval = setInterval(fetchGamification, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchGamification]);

  const refreshGamification = useCallback(async () => {
    setLoading(true);
    await fetchGamification();
  }, [fetchGamification]);

  return (
    <GamificationContext.Provider
      value={{ gamification, loading, error, refreshGamification }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification(): GamificationContextType {
  const ctx = useContext(GamificationContext);
  if (!ctx) {
    throw new Error('useGamification doit être utilisé dans un GamificationProvider');
  }
  return ctx;
}

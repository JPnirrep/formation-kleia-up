import { useState, useEffect, useRef, useCallback } from 'react';

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null, loading: true, error: null
  });
  const abortRef = useRef<AbortController | null>(null);

  // Stabiliser le fetcher (évite les re-créations de callback)
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const depsKey = deps.map(d => String(d)).join('|');

  // Déclarer runFetch avec useCallback pour qu'il soit stable et disponible partout
  const runFetch = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      if (controller.signal.aborted) return;
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (controller.signal.aborted) return;
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setState({ data: null, loading: false, error: msg });
    }
  }, []);

  useEffect(() => {
    runFetch();
    return () => { abortRef.current?.abort(); };
  }, [depsKey, runFetch]);

  return { ...state, refetch: runFetch };
}

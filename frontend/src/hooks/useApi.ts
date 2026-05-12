import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null, loading: true, error: null
  });
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher(controller.signal);
      if (!mountedRef.current) return;
      setState({ data, loading: false, error: null });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setState({ data: null, loading: false, error: msg });
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    execute();
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [execute]);

  return { ...state, refetch: execute };
}

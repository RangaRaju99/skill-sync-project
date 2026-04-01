import { useState, useCallback } from 'react';

/**
 * Custom Hook: useFetch
 * Replaces Angular's HTTP client consumption in components
 *
 * Angular pattern (using observables):
 * constructor(private http: HttpClient) {}
 * data$ = this.http.get('/api/data');
 *
 * React pattern (using custom hooks):
 * const { data, loading, error } = useFetch('/api/data');
 */
export function useFetch(url, options = {}, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  // Auto-fetch on mount
  React.useEffect(
    () => {
      fetch();
    },
    dependencies.length > 0 ? dependencies : [fetch]
  );

  return { data, loading, error, refetch: fetch };
}

/**
 * Custom Hook: useAsync
 * Handles async operations with loading and error states
 *
 * Replaces Angular's Observable pattern for handling async operations
 */
export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setData(null);
      setError(null);
      try {
        const response = await asyncFunction(...args);
        setData(response);
        setStatus('success');
        return response;
      } catch (err) {
        setError(err);
        setStatus('error');
        throw err;
      }
    },
    [asyncFunction]
  );

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isLoading: status === 'pending',
  };
}

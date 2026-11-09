import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an API call when the component mounts and returns its result, loading and error state,
 * plus `reload()` to run it again (e.g. after saving). Pass a function defined outside the
 * component, like `configurationApi.list`, so it doesn't re-run on every render.
 */
export function useApi<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true; // ignore the answer if the page was left before it arrived
    setLoading(true);
    load()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(undefined);
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, reload };
}

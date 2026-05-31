import { useCallback, useRef, useState } from "react";

export function useSimulation<T>(initialState: T, tickFn: (state: T) => T) {
  const [state, setState] = useState<T>(initialState);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState((prev) => tickFn(prev));
  }, [tickFn]);

  const start = useCallback(
    (intervalMs: number = 1000) => {
      if (intervalRef.current) return;
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setState((prev) => tickFn(prev));
      }, intervalMs);
    },
    [tickFn],
  );

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setState(initialState);
  }, [stop, initialState]);

  return { state, running, tick, start, stop, reset, setState };
}

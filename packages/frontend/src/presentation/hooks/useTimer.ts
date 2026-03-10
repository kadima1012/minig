import { useState, useEffect, useRef, useCallback } from "react";
import { TimerService } from "../../application/services/TimerService";

export function useTimer(durationMs: number, onExpired?: () => void) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(false);
  const serviceRef = useRef(new TimerService());

  const start = useCallback(() => {
    setRemainingMs(durationMs);
    setIsRunning(true);
    serviceRef.current.start(
      durationMs,
      (ms) => setRemainingMs(ms),
      () => {
        setIsRunning(false);
        onExpired?.();
      }
    );
  }, [durationMs, onExpired]);

  const stop = useCallback(() => {
    serviceRef.current.stop();
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setRemainingMs(durationMs);
  }, [stop, durationMs]);

  useEffect(() => () => serviceRef.current.stop(), []);

  return {
    remainingMs,
    isRunning,
    progressFraction: 1 - remainingMs / durationMs,
    start,
    stop,
    reset,
  };
}

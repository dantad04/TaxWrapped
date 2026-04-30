"use client";

import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export function useCountUp(target: number, durationMs = 700) {
  const finalValue = Math.round(target);
  const [displayValue, setDisplayValue] = useState(() =>
    prefersReducedMotion() ? finalValue : 0,
  );

  useEffect(() => {
    if (prefersReducedMotion() || durationMs <= 0 || finalValue === 0) {
      const timerId = window.setTimeout(() => setDisplayValue(finalValue), 0);
      return () => window.clearTimeout(timerId);
    }

    let timerId: number | undefined;

    const startAnimation = () => {
      const startedAt = Date.now();

      setDisplayValue(0);

      const tick = () => {
        const elapsed = Date.now() - startedAt;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOutCubic(progress);

        setDisplayValue(Math.round(finalValue * easedProgress));

        if (progress < 1) {
          timerId = window.setTimeout(tick, 16);
          return;
        }

        setDisplayValue(finalValue);
      };

      timerId = window.setTimeout(tick, 16);
    };

    timerId = window.setTimeout(startAnimation, 0);

    return () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, [durationMs, finalValue]);

  return displayValue;
}

"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const FIT_TEXT_BINARY_SEARCH_STEPS = 8;

interface UseFitTextOptions<T extends HTMLElement> {
  ref: RefObject<T | null>;
  minPx: number;
  maxPx: number;
  deps?: readonly unknown[];
  paddingPx?: number;
}

function canMeasureText() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function restoreFontSize(element: HTMLElement, previousFontSize: string) {
  if (previousFontSize) {
    element.style.fontSize = previousFontSize;
    return;
  }

  element.style.removeProperty("font-size");
}

function dependencyKey(deps: readonly unknown[]) {
  return deps.map((dependency) => String(dependency)).join("\u0001");
}

export function useFitText<T extends HTMLElement>({
  ref,
  minPx,
  maxPx,
  deps = [],
  paddingPx = 4,
}: UseFitTextOptions<T>) {
  const minimum = Math.min(minPx, maxPx);
  const maximum = Math.max(minPx, maxPx);
  const [fontSize, setFontSize] = useState(maximum);
  const frameRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const depsKey = useMemo(() => dependencyKey(deps), [deps]);

  const cancelFit = useCallback(() => {
    if (frameRef.current !== null && canMeasureText()) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const scheduleFit = useCallback(() => {
    if (!canMeasureText()) {
      setFontSize(maximum);
      return;
    }

    cancelFit();

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      const element = ref.current;
      const parent = element?.parentElement;

      if (!element || !parent) {
        if (mountedRef.current) {
          setFontSize(maximum);
        }
        return;
      }

      const availableWidth = Math.max(0, parent.clientWidth - paddingPx);

      if (availableWidth <= 0) {
        if (mountedRef.current) {
          setFontSize(minimum);
        }
        return;
      }

      const previousFontSize = element.style.fontSize;
      let low = minimum;
      let high = maximum;
      let fitted = minimum;

      const fitsAt = (candidateFontSize: number) => {
        element.style.fontSize = `${candidateFontSize}px`;
        return element.scrollWidth <= availableWidth + 0.5;
      };

      if (fitsAt(maximum)) {
        fitted = maximum;
      } else {
        for (let step = 0; step < FIT_TEXT_BINARY_SEARCH_STEPS; step += 1) {
          const midpoint = (low + high) / 2;

          if (fitsAt(midpoint)) {
            fitted = midpoint;
            low = midpoint;
          } else {
            high = midpoint;
          }
        }
      }

      restoreFontSize(element, previousFontSize);

      if (mountedRef.current) {
        setFontSize(Number(fitted.toFixed(2)));
      }
    });
  }, [cancelFit, maximum, minimum, paddingPx, ref]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cancelFit();
    };
  }, [cancelFit]);

  useEffect(() => {
    if (!canMeasureText()) {
      return undefined;
    }

    const initialFrame = window.requestAnimationFrame(() => scheduleFit());

    const parent = ref.current?.parentElement;

    if (!parent || typeof ResizeObserver === "undefined") {
      return () => {
        window.cancelAnimationFrame(initialFrame);
        cancelFit();
      };
    }

    const observer = new ResizeObserver(scheduleFit);
    observer.observe(parent);

    return () => {
      window.cancelAnimationFrame(initialFrame);
      observer.disconnect();
      cancelFit();
    };
  }, [cancelFit, depsKey, maximum, ref, scheduleFit]);

  return fontSize;
}

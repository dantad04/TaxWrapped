"use client";

import type { CSSProperties, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const FIT_TEXT_BINARY_SEARCH_STEPS = 8;

interface UseFitTextOptions<T extends HTMLElement> {
  ref: RefObject<T | null>;
  minPx: number;
  maxPx: number;
  deps?: readonly unknown[];
  paddingPx?: number;
}

interface FitTextState {
  fontSize: number;
  fittedKey: string | null;
}

interface FitTextResult {
  fontSize: number;
  isFitted: boolean;
  opacity: CSSProperties["opacity"];
  visibility: CSSProperties["visibility"];
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
}: UseFitTextOptions<T>): FitTextResult {
  const minimum = Math.min(minPx, maxPx);
  const maximum = Math.max(minPx, maxPx);
  const depsKey = useMemo(() => dependencyKey(deps), [deps]);
  const fitKey = useMemo(
    () => [minimum, maximum, paddingPx, depsKey].join("\u0002"),
    [depsKey, maximum, minimum, paddingPx],
  );
  const [fitState, setFitState] = useState<FitTextState>({
    fontSize: maximum,
    fittedKey: null,
  });
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const isFitted = fitState.fittedKey === fitKey;
  const fontSize = isFitted ? fitState.fontSize : maximum;

  const setMeasuredFontSize = useCallback(
    (nextFontSize: number) => {
      const roundedFontSize = Number(nextFontSize.toFixed(2));

      setFitState((current) => {
        if (
          current.fontSize === roundedFontSize &&
          current.fittedKey === fitKey
        ) {
          return current;
        }

        return {
          fontSize: roundedFontSize,
          fittedKey: fitKey,
        };
      });
    },
    [fitKey],
  );

  const cancelFit = useCallback(() => {
    if (frameRef.current !== null && canMeasureText()) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (timeoutRef.current !== null && canMeasureText()) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleFit = useCallback(() => {
    if (!canMeasureText()) {
      setMeasuredFontSize(maximum);
      return;
    }

    cancelFit();

    const measureFit = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const element = ref.current;
      const parent = element?.parentElement;

      if (!element || !parent) {
        if (mountedRef.current) {
          setMeasuredFontSize(maximum);
        }
        return;
      }

      const availableWidth = Math.max(0, parent.clientWidth - paddingPx);

      if (availableWidth <= 0) {
        if (mountedRef.current) {
          setMeasuredFontSize(minimum);
        }
        return;
      }

      const previousFontSize = element.style.fontSize;
      let low = minimum;
      let high = maximum;
      let fitted = minimum;

      const fitsAt = (candidateFontSize: number) => {
        element.style.fontSize = `${candidateFontSize}px`;
        const constrainedWidth = Math.min(
          availableWidth,
          element.clientWidth || availableWidth,
        );

        return element.scrollWidth <= constrainedWidth + 0.5;
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
        setMeasuredFontSize(fitted);
      }
    };

    frameRef.current = window.requestAnimationFrame(measureFit);
    // Embedded preview panes can throttle animation frames.
    // Keep the text from staying hidden forever if rAF does not run promptly.
    timeoutRef.current = window.setTimeout(measureFit, 120);
  }, [
    cancelFit,
    maximum,
    minimum,
    paddingPx,
    ref,
    setMeasuredFontSize,
  ]);

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

    const initialTimeout = window.setTimeout(scheduleFit, 0);

    const parent = ref.current?.parentElement;

    if (!parent || typeof ResizeObserver === "undefined") {
      return () => {
        window.clearTimeout(initialTimeout);
        cancelFit();
      };
    }

    const observer = new ResizeObserver(scheduleFit);
    observer.observe(parent);

    return () => {
      window.clearTimeout(initialTimeout);
      observer.disconnect();
      cancelFit();
    };
  }, [cancelFit, ref, scheduleFit]);

  return {
    fontSize,
    isFitted,
    opacity: isFitted ? 1 : 0,
    // Keep layout measurable while preventing oversized fit-text FOUC.
    visibility: isFitted ? "visible" : "hidden",
  };
}

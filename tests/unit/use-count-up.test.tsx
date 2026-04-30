import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCountUp } from "@/hooks/use-count-up";

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useCountUp", () => {
  it("returns the final value immediately when reduced motion is set", () => {
    mockReducedMotion(true);

    const { result } = renderHook(() => useCountUp(19588, 700));

    expect(result.current).toBe(19588);
  });

  it("eventually returns the final target value", () => {
    vi.useFakeTimers();
    mockReducedMotion(false);

    const { result } = renderHook(() => useCountUp(19588, 700));

    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current).toBe(19588);
  });
});

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLayoutEffect, useRef } from "react";
import { useFitText } from "@/hooks/use-fit-text";

class MockResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
}

function FitTextHarness({
  characterWidthFactor = 0.3,
  content,
  maxPx,
  minPx,
  width,
}: {
  characterWidthFactor?: number;
  content: string;
  maxPx: number;
  minPx: number;
  width: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fontSize = useFitText({
    ref,
    minPx,
    maxPx,
    deps: [content],
  });

  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;

    if (!element || !parent) {
      return;
    }

    Object.defineProperty(parent, "clientWidth", {
      configurable: true,
      get: () => width,
    });
    Object.defineProperty(element, "scrollWidth", {
      configurable: true,
      get: () => {
        const measuredFontSize = Number.parseFloat(
          element.style.fontSize || `${fontSize}`,
        );

        return content.length * characterWidthFactor * measuredFontSize;
      },
    });
  }, [characterWidthFactor, content, fontSize, width]);

  return (
    <div>
      <div data-testid="fit-text" ref={ref} style={{ fontSize }}>
        {content}
      </div>
    </div>
  );
}

function getRenderedFontSize() {
  return Number.parseFloat(screen.getByTestId("fit-text").style.fontSize);
}

beforeEach(() => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useFitText", () => {
  it("returns max when text fits the container", async () => {
    render(
      <FitTextHarness content="$5" minPx={40} maxPx={180} width={320} />,
    );

    await waitFor(() => expect(getRenderedFontSize()).toBe(180));
  });

  it("returns a value below max when text exceeds the container", async () => {
    render(
      <FitTextHarness
        content="$1,000,000"
        minPx={40}
        maxPx={180}
        width={280}
      />,
    );

    await waitFor(() => expect(getRenderedFontSize()).toBeLessThan(180));
    expect(getRenderedFontSize()).toBeGreaterThan(40);
  });

  it("returns min and never goes below it when text still overflows", async () => {
    render(
      <FitTextHarness
        characterWidthFactor={1.2}
        content="$1,000,000,000,000"
        minPx={44}
        maxPx={180}
        width={80}
      />,
    );

    await waitFor(() => expect(getRenderedFontSize()).toBe(44));
  });

  it("re-fits when dependency content changes", async () => {
    const { rerender } = render(
      <FitTextHarness content="$5" minPx={40} maxPx={180} width={280} />,
    );

    await waitFor(() => expect(getRenderedFontSize()).toBe(180));

    act(() => {
      rerender(
        <FitTextHarness
          content="$1,000,000"
          minPx={40}
          maxPx={180}
          width={280}
        />,
      );
    });

    await waitFor(() => expect(getRenderedFontSize()).toBeLessThan(180));
  });

  it("returns max on the server when there is no window", () => {
    function ServerHarness() {
      const ref = useRef<HTMLDivElement>(null);
      const fontSize = useFitText({
        ref,
        minPx: 40,
        maxPx: 180,
        deps: ["$1,000,000"],
      });

      return <div style={{ fontSize }}>{fontSize}</div>;
    }

    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");

    try {
      expect(renderToString(<ServerHarness />)).toContain("180");
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: originalDocument,
      });
    }
  });
});

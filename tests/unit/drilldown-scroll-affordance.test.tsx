import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "@/app/page";

function mockReducedMotion() {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
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

function mockDrilldownOverflow() {
  const scrollHeightSpy = vi
    .spyOn(HTMLElement.prototype, "scrollHeight", "get")
    .mockImplementation(function getScrollHeight(this: HTMLElement) {
      return this.dataset.testid === "drilldown-bars" ? 420 : 0;
    });
  const clientHeightSpy = vi
    .spyOn(HTMLElement.prototype, "clientHeight", "get")
    .mockImplementation(function getClientHeight(this: HTMLElement) {
      return this.dataset.testid === "drilldown-bars" ? 120 : 0;
    });

  return { clientHeightSpy, scrollHeightSpy };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("drilldown scroll affordance", () => {
  it("renders the affordance when the drilldown bar list overflows", async () => {
    mockReducedMotion();
    mockDrilldownOverflow();

    render(<Home />);

    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    fireEvent.change(screen.getByLabelText("Annual salary before tax"), {
      target: { value: "90000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Open breakdown" }));

    await waitFor(() => {
      expect(
        screen
          .getByTestId("drilldown-scroll-affordance")
          .getAttribute("data-visible"),
      ).toBe("true");
    });

    const bars = screen.getByTestId("drilldown-bars");

    Object.defineProperty(bars, "scrollTop", {
      configurable: true,
      value: 300,
    });
    fireEvent.scroll(bars);

    await waitFor(() => {
      expect(
        screen
          .getByTestId("drilldown-scroll-affordance")
          .getAttribute("data-visible"),
      ).toBe("false");
    });
  });
});

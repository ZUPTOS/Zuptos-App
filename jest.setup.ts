import "@testing-library/jest-dom";
import React from "react";

class ResizeObserver {
  constructor(callback: ResizeObserverCallback) { }
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined") {
  (window as any).ResizeObserver =
    window.ResizeObserver || ResizeObserver;
}

(globalThis as any).ResizeObserver =
  globalThis.ResizeObserver || ResizeObserver;

// jsdom doesn't provide fetch by default. Provide a stub that fails fast so network
// calls are explicit in tests (mock per-test or mock the API layer).
if (typeof (globalThis as any).fetch === "undefined") {
  (globalThis as any).fetch = jest.fn(async () => {
    throw new Error("fetch is not mocked in tests");
  });
}

// Some parts of the app use blob previews (e.g. file inputs). jsdom doesn't implement these.
if (typeof URL !== "undefined") {
  if (typeof URL.createObjectURL !== "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).createObjectURL = jest.fn(() => "blob:mock");
  }
  if (typeof URL.revokeObjectURL !== "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (URL as any).revokeObjectURL = jest.fn();
  }
}

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    priority: _priority,
    fill: _fill,
    ...props
  }: {
    alt?: string;
    priority?: boolean;
    fill?: boolean;
    [key: string]: unknown;
  }) => React.createElement("img", { alt: alt ?? "mock-image", ...props })
}));

jest.mock("next/navigation", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    forward: jest.fn(),
    back: jest.fn()
  };

  return {
    useRouter: () => mockRouter,
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    useSelectedLayoutSegments: () => []
  };
});

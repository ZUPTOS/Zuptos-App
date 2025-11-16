import "@testing-library/jest-dom";
import React from "react";

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined") {
  (window as typeof window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
    window.ResizeObserver || ResizeObserver;
}

(globalThis as typeof globalThis & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  globalThis.ResizeObserver || ResizeObserver;

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    priority: _priority,
    ...props
  }: {
    alt?: string;
    priority?: boolean;
    [key: string]: unknown;
  }) => React.createElement("img", { alt: alt ?? "mock-image", ...props })
}));

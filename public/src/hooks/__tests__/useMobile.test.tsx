import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useIsMobile } from "@/hooks/useMobile";

const listeners: Record<string, (() => void)[]> = {};

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn((query: string) => ({
      media: query,
      matches: window.innerWidth < 768,
      addEventListener: (_event: string, handler: () => void) => {
        listeners[query] = listeners[query] ?? [];
        listeners[query].push(handler);
      },
      removeEventListener: () => void 0
    }))
  });
});

const triggerListeners = () => {
  const query = `(max-width: 767px)`;
  listeners[query]?.forEach(listener => listener());
};

describe("useIsMobile", () => {
  it("atualiza o valor conforme o tamanho da janela", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 500;
      triggerListeners();
    });

    expect(result.current).toBe(true);
  });
});

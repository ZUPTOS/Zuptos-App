"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/shared/components/LoadingScreen";

type LoadingOverlayContextValue = {
  isLoading: boolean;
  label?: string;
  start: (label?: string) => void;
  stop: () => void;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | undefined>(undefined);

export function LoadingOverlayProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState<string | undefined>("Carregando...");
  const counterRef = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/" ||
    pathname?.startsWith("/nova-senha") ||
    pathname?.startsWith("/recuperar-senha");

  const start = useCallback((nextLabel?: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    counterRef.current += 1;
    setLabel(nextLabel || "Carregando...");
    setIsLoading(true);
  }, []);

  const stop = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 120);
    }
  }, []);

  const withLoading = useCallback(
    async <T,>(task: () => Promise<T>, nextLabel?: string) => {
      start(nextLabel);
      try {
        return await task();
      } finally {
        stop();
      }
    },
    [start, stop]
  );

  // Show overlay briefly on pathname changes (covers app router navigations).
  useEffect(() => {
    if (!pathname) return;
    start("Carregando...");
    const id = setTimeout(() => stop(), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Patch fetch on client to surface backend waits.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as typeof window & { _zuptosFetchPatched?: boolean };
    if (w._zuptosFetchPatched) return;

    const originalFetch = window.fetch;
    w._zuptosFetchPatched = true;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      start("Carregando...");
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        stop();
      }
    };

    return () => {
      window.fetch = originalFetch;
      w._zuptosFetchPatched = false;
    };
  }, [start, stop]);

  const value = useMemo(
    () => ({
      isLoading,
      label,
      start,
      stop,
      withLoading,
    }),
    [isLoading, label, start, stop, withLoading]
  );

  return (
    <LoadingOverlayContext.Provider value={value}>
      {children}
      {isLoading && isAuthRoute && <LoadingScreen label={label} fullscreen />}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const context = useContext(LoadingOverlayContext);
  if (context) return context;

  // Fallback for renders outside the provider (e.g., tests or storybook).
  // Keep references stable to avoid re-running effects that depend on these fns.
  return fallbackOverlay;
}

const noop = () => {};
const passthrough = async <T,>(task: () => Promise<T>) => task();
const fallbackOverlay: LoadingOverlayContextValue = {
  isLoading: false,
  label: undefined,
  start: noop,
  stop: noop,
  withLoading: passthrough,
};

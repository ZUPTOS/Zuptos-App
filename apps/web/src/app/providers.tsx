"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";
import { Toaster } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { LoadingOverlayProvider, useLoadingOverlay } from "@/contexts/LoadingOverlayContext";

function LoadingBar() {
  const { isLoading } = useLoadingOverlay();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress(prev => (prev < 15 ? 15 : prev));
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          if (prev < 60) return prev + 12;
          if (prev < 80) return prev + 6;
          return prev + 2;
        });
      }, 150);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setProgress(100);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-[4px] bg-foreground/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#6c27d7] via-[#9b5cf8] to-[#6c27d7] transition-[width] duration-200 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <TooltipProvider>
            <LoadingOverlayProvider>
              <LoadingBar />
              <Toaster />
              {children}
            </LoadingOverlayProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

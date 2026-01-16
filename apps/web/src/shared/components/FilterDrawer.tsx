'use client';

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { X } from "lucide-react";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClassName?: string;
};

export function FilterDrawer({ open, onClose, title = "Filtrar", children, widthClassName }: FilterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const panelWidth = useMemo(() => widthClassName ?? "w-full max-w-[380px]", [widthClassName]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70"
        role="button"
        tabIndex={-1}
        aria-label="Fechar filtros"
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full flex-col rounded-l-[7px] border-l border-foreground/15 bg-card px-6 pb-8 pt-6 shadow-[0_20px_80px_rgba(0,0,0,0.65)] ${panelWidth}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between border-b border-foreground/10 pb-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-[6px] p-1"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1 text-sm text-foreground">
          {children}
        </div>
      </aside>
    </>
  );
}

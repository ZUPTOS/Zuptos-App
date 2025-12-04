'use client';

import type { ReactNode } from "react";
import { X } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancelButton?: boolean;
};

export default function ConfirmModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  showCancelButton = false
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70"
        role="button"
        tabIndex={-1}
        aria-label="Fechar modal"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-foreground/15 bg-card px-6 py-6 text-foreground shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        {description ? <div className="mt-4 text-sm text-muted-foreground">{description}</div> : null}

        <div className={`mt-6 flex gap-3 ${showCancelButton ? "justify-between" : "justify-end"}`}>
          {showCancelButton && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="flex-1 rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

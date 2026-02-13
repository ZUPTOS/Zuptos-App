"use client";

import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { X } from "lucide-react";
import type { MembersStudent } from "../types";

type RemoveAccessModalProps = {
  student: MembersStudent | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function RemoveAccessModal({ student, onClose, onConfirm }: RemoveAccessModalProps) {
  const open = Boolean(student);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        onClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[620px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <DialogTitle className="text-2xl font-semibold text-white">
            Remover acesso
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-[4px] p-2 text-zinc-500 transition hover:text-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        <div className="mt-6 h-px w-full bg-white/10" />

        <p className="mt-5 text-sm text-white/80">
          Você tem certeza que quer remover o acesso à área de membros completa e de todos produtos comprados?
        </p>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            className="h-10 min-w-[140px] rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-10 min-w-[140px] rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
            onClick={onConfirm}
          >
            Sim, remover
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


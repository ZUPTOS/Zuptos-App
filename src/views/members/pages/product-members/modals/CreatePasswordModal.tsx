"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { notify } from "@/shared/ui/notification-toast";
import { X } from "lucide-react";
import type { MembersStudent } from "../types";

type CreatePasswordModalProps = {
  student: MembersStudent | null;
  onClose: () => void;
  onSave: (password: string) => void;
};

export function CreatePasswordModal({ student, onClose, onSave }: CreatePasswordModalProps) {
  const open = Boolean(student);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setConfirm("");
  }, [open, student?.id]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        onClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <DialogTitle className="text-2xl font-semibold text-white">
            Criar nova senha
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

        <div className="mt-5 space-y-5">
          <div className="space-y-2">
            <label className="text-base font-semibold text-white">Nova senha</label>
            <input
              type="password"
              placeholder="senha"
              className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold text-white">Confirmar nova senha</label>
            <input
              type="password"
              placeholder="senha"
              className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-8 h-12 w-full rounded-[6px] bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!password || password !== confirm}
          onClick={() => {
            if (!password || password !== confirm) {
              notify.error("Senha inválida", "As senhas precisam ser iguais.");
              return;
            }
            onSave(password);
          }}
        >
          Salvar
        </button>
      </DialogContent>
    </Dialog>
  );
}


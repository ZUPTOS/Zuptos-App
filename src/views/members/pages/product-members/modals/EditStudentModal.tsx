"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { notify } from "@/shared/ui/notification-toast";
import { X } from "lucide-react";
import type { MembersStudent } from "../types";

type EditStudentModalProps = {
  student: MembersStudent | null;
  onClose: () => void;
  onSave: (next: { email: string; active: boolean }) => void;
};

export function EditStudentModal({ student, onClose, onSave }: EditStudentModalProps) {
  const open = Boolean(student);
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!open || !student) return;
    setEmail(student.email);
    setActive(student.active);
  }, [open, student]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        onClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[740px] max-h-[calc(100vh-4rem)] overflow-y-auto rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <DialogTitle className="text-2xl font-semibold text-white">
            Editar aluno
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

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/60">Nome</span>
              <span className="font-semibold text-white">{student?.name ?? ""}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/60">Turma</span>
              <span className="font-semibold text-white/80">Turma 01</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/60">Inclusão</span>
              <span className="font-semibold text-white/80">dd/mm/aaaa</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/60">Último acesso</span>
              <span className="font-semibold text-white/80">{student?.lastAccess ?? "dd/mm/aaaa"}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-white/60">Progresso</span>
              <div className="flex w-[220px] items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${student?.progressPercent ?? 0}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-white/80">
                  {String(student?.progressPercent ?? 0).padStart(2, "0")}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold text-white">E-mail</label>
            <input
              type="email"
              placeholder="email@email.com"
              className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold text-white">Status</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setActive(true)}
                className={`h-10 min-w-[140px] rounded-[6px] px-5 text-xs font-semibold transition ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/10 text-white/70 hover:bg-white/15"
                }`}
              >
                Ativo
              </button>
              <button
                type="button"
                onClick={() => setActive(false)}
                className={`h-10 min-w-[140px] rounded-[6px] px-5 text-xs font-semibold transition ${
                  active
                    ? "bg-white/10 text-white/70 hover:bg-white/15"
                    : "bg-white/15 text-white"
                }`}
              >
                Bloquear aluno
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-base font-semibold text-white">Produtos</p>
            <div className="rounded-[8px] border border-white/10 bg-[#141414] p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[8px] bg-primary/20" aria-hidden="true" />
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-white">
                    {student?.products?.[0]?.name ?? "Produto 01"}
                  </p>
                  <p className="text-xs text-white/50">Curso</p>
                </div>
                <p className="ml-auto text-sm font-semibold text-white/80">R$ 497,00</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-base font-semibold text-white">Adicionar produtos</p>
            <button
              type="button"
              onClick={() => notify.warning("Em breve", "A adição de produtos será implementada.")}
              className="h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-left text-sm text-white/60 transition hover:border-white/20"
            >
              Produto 01
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              onClick={() => {
                if (!student) return;
                const nextEmail = email.trim() || student.email;
                onSave({ email: nextEmail, active });
              }}
            >
              Salvar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


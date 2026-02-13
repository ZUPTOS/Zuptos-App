"use client";

import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { X } from "lucide-react";
import type { ImportableProduct } from "../types";

type ImportProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ImportableProduct[];
  loading: boolean;
  selectedId: string;
  onSelectedIdChange: (id: string) => void;
  onImport: () => void;
};

export function ImportProductModal({
  open,
  onOpenChange,
  options,
  loading,
  selectedId,
  onSelectedIdChange,
  onImport,
}: ImportProductModalProps) {
  const isDisabled = !selectedId || selectedId === "__loading" || selectedId === "__empty";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[520px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <DialogTitle className="text-2xl font-semibold text-white sm:text-3xl">
            Importar produto
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

        <div className="mt-5 space-y-3">
          <label className="text-base font-semibold text-white">Nome do produto</label>

          <Select value={selectedId} onValueChange={onSelectedIdChange}>
            <SelectTrigger className="mt-2 h-11 w-full rounded-[6px] border border-white/10 bg-[#141414] px-4 text-sm text-white shadow-none focus:ring-2 focus:ring-primary/40">
              <SelectValue placeholder="Insira o nome" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#141414] text-white">
              {loading ? (
                <SelectItem value="__loading" disabled>
                  Carregando...
                </SelectItem>
              ) : options.length > 0 ? (
                options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__empty" disabled>
                  Nenhum produto encontrado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          className="mt-6 h-12 w-full rounded-[6px] bg-primary text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onImport}
        >
          Importar
        </button>
      </DialogContent>
    </Dialog>
  );
}


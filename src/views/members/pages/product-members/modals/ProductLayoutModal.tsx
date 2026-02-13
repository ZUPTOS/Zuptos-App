"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { notify } from "@/shared/ui/notification-toast";
import type { MembersProduct } from "@/views/members/types/members.types";
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react";
import { MAX_LAYOUT_FILE_BYTES } from "../constants";

type ProductLayoutModalProps = {
  product: MembersProduct | null;
  onClose: () => void;
};

export function ProductLayoutModal({ product, onClose }: ProductLayoutModalProps) {
  const open = Boolean(product);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setCoverFile(null);
    setBannerFile(null);
  }, [open, product?.id]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(bannerFile);
    setBannerPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
        setCoverFile(null);
        setBannerFile(null);
        onClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[560px] rounded-[6px] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-2xl sm:p-8"
        showCloseButton={false}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-[6px] p-2 text-zinc-300 transition hover:bg-white/5 hover:text-white"
              aria-label="Voltar"
              onClick={() => {
                setCoverFile(null);
                setBannerFile(null);
                onClose();
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <DialogTitle className="text-2xl font-semibold text-white">
              Layout
            </DialogTitle>
          </div>

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
            <h3 className="text-base font-semibold text-white">Capa do curso</h3>
            <p className="text-xs leading-relaxed text-white/60">
              Esta será a imagem que aparecerá nas seções do tipo &quot;curso&quot; da sua área de membros.
            </p>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) {
                  setCoverFile(null);
                  return;
                }
                if (file.size > MAX_LAYOUT_FILE_BYTES) {
                  notify.error("Arquivo muito grande", "Envie uma imagem de até 2MB.");
                  event.target.value = "";
                  return;
                }
                setCoverFile(file);
              }}
            />

            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-[#2a2a2a] text-center text-xs text-white/50 transition hover:border-white/20"
            >
              {coverPreviewUrl ? (
                <span
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverPreviewUrl})` }}
                  aria-label={coverFile?.name ?? "Capa selecionada"}
                />
              ) : null}
              <span className="relative flex flex-col items-center gap-2 px-4">
                <ImageIcon className="h-10 w-10 text-white/30" />
                <span>
                  Selecione do computador
                  <br />
                  ou arraste/solte aqui
                </span>
                <span className="text-[10px] text-white/35">
                  JPEG, JPG, PNG, WEBP até 2 MB
                </span>
                {coverFile ? (
                  <span className="mt-1 text-[10px] font-semibold text-white/70">
                    {coverFile.name}
                  </span>
                ) : null}
              </span>
            </button>

            <p className="text-xs text-white/60">Tamanho recomendado: 450x160 pixels</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Banner do curso</h3>
            <p className="text-xs leading-relaxed text-white/60">
              Esta será a imagem que aparecerá no topo da página do curso.
            </p>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (!file) {
                  setBannerFile(null);
                  return;
                }
                if (file.size > MAX_LAYOUT_FILE_BYTES) {
                  notify.error("Arquivo muito grande", "Envie uma imagem de até 2MB.");
                  event.target.value = "";
                  return;
                }
                setBannerFile(file);
              }}
            />

            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="relative flex h-[150px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-white/10 bg-[#2a2a2a] text-center text-xs text-white/50 transition hover:border-white/20"
            >
              {bannerPreviewUrl ? (
                <span
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bannerPreviewUrl})` }}
                  aria-label={bannerFile?.name ?? "Banner selecionado"}
                />
              ) : null}
              <span className="relative flex flex-col items-center gap-2 px-4">
                <ImageIcon className="h-10 w-10 text-white/30" />
                <span>
                  Selecione do computador
                  <br />
                  ou arraste/solte aqui
                </span>
                <span className="text-[10px] text-white/35">
                  JPEG, JPG, PNG, WEBP até 2 MB
                </span>
                {bannerFile ? (
                  <span className="mt-1 text-[10px] font-semibold text-white/70">
                    {bannerFile.name}
                  </span>
                ) : null}
              </span>
            </button>

            <p className="text-xs text-white/60">Tamanho recomendado: 1348x581 pixels</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            className="h-10 rounded-[6px] bg-white/10 px-5 text-xs font-semibold text-white/80 transition hover:bg-white/15 hover:text-white"
            onClick={() => {
              setCoverFile(null);
              setBannerFile(null);
              onClose();
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="h-10 rounded-[6px] bg-primary px-5 text-xs font-semibold text-primary-foreground transition hover:brightness-105"
            onClick={() => {
              notify.success("Layout atualizado", "As imagens do curso foram atualizadas.");
              setCoverFile(null);
              setBannerFile(null);
              onClose();
            }}
          >
            Atualizar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


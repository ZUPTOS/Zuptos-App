/* eslint-disable @next/next/no-img-element */
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import { SectionCard } from "../shared";
import type { ImagePreview } from "../utils";
import { formatBytes, truncateFileName } from "../utils";

type VisualSectionProps = {
  showLogo: boolean;
  setShowLogo: Dispatch<SetStateAction<boolean>>;
  logoInputRef: RefObject<HTMLInputElement | null>;
  logoPreview: ImagePreview | null;
  logoPreviewImageSrc?: string | null;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveLogo: () => void;
  logoPosition: "left" | "center" | "right";
  setLogoPosition: Dispatch<SetStateAction<"left" | "center" | "right">>;
  showBanner: boolean;
  setShowBanner: Dispatch<SetStateAction<boolean>>;
  bannerInputRef: RefObject<HTMLInputElement | null>;
  bannerPreview: ImagePreview | null;
  bannerPreviewImageSrc?: string | null;
  onBannerChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveBanner: () => void;
  theme: "light" | "dark";
  setTheme: Dispatch<SetStateAction<"light" | "dark">>;
  setAccentColor: Dispatch<SetStateAction<string>>;
};

export const VisualSection = ({
  showLogo,
  setShowLogo,
  logoInputRef,
  logoPreview,
  logoPreviewImageSrc,
  onLogoChange,
  onRemoveLogo,
  logoPosition,
  setLogoPosition,
  showBanner,
  setShowBanner,
  bannerInputRef,
  bannerPreview,
  bannerPreviewImageSrc,
  onBannerChange,
  onRemoveBanner,
  theme,
  setTheme,
  setAccentColor,
}: VisualSectionProps) => (
  <SectionCard title="Visual" iconSrc="/images/editar-produtos/visual.svg">
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
        <span>Logotipo</span>
        <button
          type="button"
          className={`relative inline-flex h-5 w-10 items-center rounded-full ${showLogo ? "bg-primary/70" : "bg-muted"}`}
          onClick={() => setShowLogo(prev => !prev)}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white transition ${
              showLogo ? "left-[calc(100%-18px)]" : "left-[6px]"
            }`}
          />
        </button>
      </div>
      {showLogo && (
        <>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onLogoChange}
          />
          {logoPreview ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => logoInputRef.current?.click()}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  logoInputRef.current?.click();
                }
              }}
              className="relative flex cursor-pointer items-center gap-3 rounded-[10px] border border-foreground/15 bg-card/60 p-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <button
                type="button"
                aria-label="Remover logo"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-foreground/20 bg-card text-xs text-muted-foreground transition hover:text-foreground"
                onClick={event => {
                  event.stopPropagation();
                  onRemoveLogo();
                }}
              >
                X
              </button>
              <div className="h-12 w-12 overflow-hidden rounded-[10px] border border-foreground/10 bg-foreground/5">
                {logoPreviewImageSrc ? (
                  <img
                    src={logoPreviewImageSrc}
                    alt={logoPreview.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    IMG
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">
                  {truncateFileName(logoPreview.name)}
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">{logoPreview.ext}</span>
                </p>
                <p>Tamanho: {formatBytes(logoPreview.size)}</p>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-foreground/20 bg-card/50 px-4 py-6 text-base font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
              >
                <span>Arraste a imagem ou</span>
                <span className="underline">clique aqui</span>
              </button>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Aceitamos os formatos .jpg, .jpeg e .png com menos de 10mb.</p>
                <p>Sugestão de tamanho: 300 X 300</p>
              </div>
            </>
          )}
        </>
      )}
      {showLogo && (
        <div className="space-y-1 text-sm text-muted-foreground">
          <span className="text-foreground">Posicionamento</span>
          <div className="relative">
            <select
              className="h-10 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
              value={logoPosition}
              onChange={event => setLogoPosition(event.target.value as "left" | "center" | "right")}
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
        <span>Banner</span>
        <button
          type="button"
          className={`relative inline-flex h-5 w-10 items-center rounded-full ${showBanner ? "bg-primary/70" : "bg-muted"}`}
          onClick={() => setShowBanner(prev => !prev)}
        >
          <span
            className={`absolute h-4 w-4 rounded-full bg-white transition ${
              showBanner ? "left-[calc(100%-18px)]" : "left-[6px]"
            }`}
          />
        </button>
      </div>
      {showBanner && (
        <>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onBannerChange}
          />
          {bannerPreview ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => bannerInputRef.current?.click()}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  bannerInputRef.current?.click();
                }
              }}
              className="relative flex cursor-pointer items-center gap-3 rounded-[10px] border border-foreground/15 bg-card/60 p-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <button
                type="button"
                aria-label="Remover banner"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-foreground/20 bg-card text-xs text-muted-foreground transition hover:text-foreground"
                onClick={event => {
                  event.stopPropagation();
                  onRemoveBanner();
                }}
              >
                X
              </button>
              <div className="h-12 w-20 overflow-hidden rounded-[10px] border border-foreground/10 bg-foreground/5">
                {bannerPreviewImageSrc ? (
                  <img
                    src={bannerPreviewImageSrc}
                    alt={bannerPreview.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    IMG
                  </div>
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="text-sm font-semibold text-foreground">
                  {truncateFileName(bannerPreview.name)}
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">{bannerPreview.ext}</span>
                </p>
                <p>Tamanho: {formatBytes(bannerPreview.size)}</p>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-foreground/20 bg-card/50 px-4 py-6 text-base font-semibold text-foreground transition hover:border-primary/60 hover:text-primary"
              >
                Arraste a imagem ou <span className="underline">clique aqui</span>
              </button>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Aceitamos os formatos .jpg, .jpeg e .png com menos de 10mb.</p>
                <p>Sugestão de tamanho: 300 X 300</p>
              </div>
            </>
          )}
        </>
      )}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Plano de Fundo</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={() => setTheme("light")}
            className={`rounded-[10px] border px-3 py-4 text-sm font-semibold shadow-inner ${
              theme === "light"
                ? "border-foreground/20 bg-[#d9d9d9] text-black"
                : "border-foreground/20 bg-card text-foreground"
            }`}
            type="button"
          >
            Claro
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`rounded-[10px] border px-3 py-4 text-sm font-semibold ${
              theme === "dark"
                ? "border-foreground/20 bg-[#232323] text-foreground"
                : "border-foreground/20 bg-card text-foreground"
            }`}
            type="button"
          >
            Escuro
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Cores de destaque</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { color: "#000000", label: "Clean (padrão)" },
            { color: "#5f17ff", label: "Clean (padrão)" },
            { color: "#d000ff", label: "Clean (padrão)" },
            { color: "#007c35", label: "Clean (padrão)" },
            { color: "#c7a100", label: "Clean (padrão)" },
          ].map(option => (
            <div
              key={option.color}
              className="space-y-1 rounded-[10px] border border-foreground/15 bg-card p-2 text-center"
            >
              <button
                className="h-10 w-full rounded-[8px]"
                style={{ backgroundColor: option.color }}
                aria-label={option.label}
                onClick={() => setAccentColor(option.color)}
              />
              <p className="text-[11px] text-foreground">{option.label}</p>
            </div>
          ))}
          <div className="space-y-1 rounded-[10px] border border-foreground/15 bg-card p-2 text-center">
            <input
              type="color"
              className="h-10 w-full cursor-pointer rounded-[8px] border border-foreground/20 bg-card"
              aria-label="Personalizado"
              defaultValue="#6C27D7"
              onChange={event => setAccentColor(event.target.value)}
            />
            <p className="text-[11px] text-foreground">Personalizado</p>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
);

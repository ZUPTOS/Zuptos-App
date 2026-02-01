import CheckoutPreview from "@/components/CheckoutPreview";
import { SectionCard } from "../shared";

type PreviewSectionProps = {
  theme: "light" | "dark";
  showLogo: boolean;
  showBanner: boolean;
  previewLogoSrc?: string;
  previewBannerSrc?: string;
  logoPosition: "left" | "center" | "right";
  reviewsEnabled: boolean;
  requiredAddress: boolean;
  requiredPhone: boolean;
  requiredBirthdate: boolean;
  requiredDocument: boolean;
  countdownEnabled: boolean;
  accentColor: string;
  counterBgColor: string;
  counterTextColor: string;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
};

export const PreviewSection = ({
  theme,
  showLogo,
  showBanner,
  previewLogoSrc,
  previewBannerSrc,
  logoPosition,
  reviewsEnabled,
  requiredAddress,
  requiredPhone,
  requiredBirthdate,
  requiredDocument,
  countdownEnabled,
  accentColor,
  counterBgColor,
  counterTextColor,
  onCancel,
  onSave,
  isSaving,
}: PreviewSectionProps) => (
  <SectionCard title="Pré-visualização">
    <div className="flex flex-col items-center gap-2">
      <CheckoutPreview
        theme={theme}
        showLogo={showLogo}
        showBanner={showBanner}
        logoSrc={previewLogoSrc}
        bannerSrc={previewBannerSrc}
        logoPosition={logoPosition}
        showTestimonials={reviewsEnabled}
        showOrderBumps
        requiredAddress={requiredAddress}
        requiredPhone={requiredPhone}
        requiredBirthdate={requiredBirthdate}
        requiredDocument={requiredDocument}
        countdownEnabled={countdownEnabled}
        accentColor={accentColor}
        counterBgColor={counterBgColor}
        counterTextColor={counterTextColor}
      />
      <p className="text-xs text-muted-foreground">
        Esta pré-visualização reflete as opções ativadas acima (logo, banner, campos obrigatórios, tema).
      </p>
    </div>
    <div className="flex items-center justify-end gap-3 pt-3">
      <button
        type="button"
        className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm text-foreground"
        onClick={onCancel}
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] disabled:opacity-60"
      >
        {isSaving ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  </SectionCard>
);

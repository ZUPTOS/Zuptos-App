'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { productApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import CheckoutPreview from "@/components/CheckoutPreview";
import type { CheckoutPayload, Product } from "@/lib/api";
import { CheckoutTemplate } from "@/lib/api";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { notify } from "@/shared/ui/notification-toast";

const fieldClass =
  "h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const SectionCard = ({
  children,
  title,
  subtitle,
  iconSrc,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  iconSrc?: string;
}) => (
  <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {iconSrc && (
          <div className="flex h-6 w-6 items-center justify-center rounded-[8px] bg-foreground/5">
            <Image src={iconSrc} alt={title} width={16} height={16} className="h-4 w-4 object-contain" />
          </div>
        )}
        <p className="text-base font-semibold text-foreground">{title}</p>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </div>
);

type ImagePreview = {
  src: string;
  name: string;
  ext: string;
  size: number | null;
  objectUrl?: string;
};

const formatBytes = (bytes: number | null) => {
  if (bytes === null) return "-";
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  const precision = value < 10 && index > 0 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[index]}`;
};

const truncateFileName = (name: string, maxLength = 7) =>
  name.length > maxLength ? name.slice(0, maxLength) : name;

const loadImageFromFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    img.src = objectUrl;
  });

const compressImageFile = async (
  file: File,
  options: { maxWidth: number; maxHeight: number; quality?: number }
) => {
  const img = await loadImageFromFile(file);
  const scale = Math.min(
    options.maxWidth / img.width,
    options.maxHeight / img.height,
    1
  );
  const targetWidth = Math.max(1, Math.round(img.width * scale));
  const targetHeight = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível criar o contexto do canvas");
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = mime === "image/png" ? undefined : options.quality ?? 0.82;
  return canvas.toDataURL(mime, quality);
};

const parseFileName = (src: string) => {
  try {
    const url = new URL(src);
    const segment = url.pathname.split("/").pop();
    return decodeURIComponent(segment || "imagem");
  } catch {
    const segment = src.split("/").pop();
    return decodeURIComponent(segment || "imagem");
  }
};

const buildPreviewFromUrl = (src: string): ImagePreview => {
  const name = parseFileName(src);
  const dotIndex = name.lastIndexOf(".");
  const baseName = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const ext = dotIndex > 0 ? name.slice(dotIndex + 1) : "";
  return {
    src,
    name: baseName,
    ext: ext.toUpperCase() || "IMG",
    size: null,
  };
};

const buildStoredPreview = (src: string, label: string): ImagePreview => {
  if (src.startsWith("blob:")) {
    return {
      src,
      name: label,
      ext: "IMG",
      size: null,
    };
  }
  return buildPreviewFromUrl(src);
};

const buildPreviewFromFile = (file: File, srcOverride?: string): ImagePreview => {
  const rawName = file.name || "imagem";
  const dotIndex = rawName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? rawName.slice(0, dotIndex) : rawName;
  const ext = dotIndex > 0 ? rawName.slice(dotIndex + 1) : "";
  const objectUrl = srcOverride ? undefined : URL.createObjectURL(file);
  return {
    src: srcOverride ?? objectUrl ?? "",
    name: baseName,
    ext: ext.toUpperCase() || "IMG",
    size: file.size,
    objectUrl,
  };
};

type Props = {
  productId?: string;
  checkoutId?: string;
  onBack?: () => void;
  backLabel?: string;
  onClose?: () => void;
  onSaved?: () => void;
};

export function CheckoutEditor({
  productId: productIdProp,
  checkoutId,
  onBack,
  backLabel,
  onClose,
  onSaved,
}: Props) {
  const productId = useMemo(() => {
    if (productIdProp) return productIdProp;
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastProductId") ?? "";
    }
    return "";
  }, [productIdProp]);
  const { token } = useAuth();
  const { withLoading } = useLoadingOverlay();
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [checkoutName, setCheckoutName] = useState("Checkout");
  const [requiredAddress] = useState(true);
  const [requiredPhone] = useState(true);
  const [requiredBirthdate] = useState(true);
  const [requiredDocument] = useState(true);
  const [requiredEmailConfirmation, setRequiredEmailConfirmation] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [, setLogoFile] = useState<File | null>(null);
  const [, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<ImagePreview | null>(null);
  const [bannerPreview, setBannerPreview] = useState<ImagePreview | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [bannerDataUrl, setBannerDataUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<"left" | "center" | "right">("left");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [counterBgColor, setCounterBgColor] = useState("#111111");
  const [counterTextColor, setCounterTextColor] = useState("#FFFFFF");
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [accentColor, setAccentColor] = useState("#5f17ff");
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [discountCard, setDiscountCard] = useState("");
  const [discountPix, setDiscountPix] = useState("");
  const [discountBoleto, setDiscountBoleto] = useState("");
  const [installmentsLimit, setInstallmentsLimit] = useState("12");
  const [installmentsPreselected, setInstallmentsPreselected] = useState("12");
  const [boletoDueDays, setBoletoDueDays] = useState("3");
  const [pixExpireMinutes, setPixExpireMinutes] = useState("");
  const [salesNotificationsEnabled, setSalesNotificationsEnabled] = useState(false);
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [reviewsEnabled, setReviewsEnabled] = useState(false);
  const [acceptedDocuments, setAcceptedDocuments] = useState<Array<"cpf" | "cnpj">>(["cpf"]);
  const [paymentMethods, setPaymentMethods] = useState<Array<"card" | "boleto" | "pix">>(["card"]);
  const [testimonials, setTestimonials] = useState<
    { id?: string; name: string; text: string; rating: number; active: boolean; image?: string }[]
  >([]);
  const [testimonialDraft, setTestimonialDraft] = useState<{
    name: string;
    text: string;
    rating: number;
    image: string;
  }>({
    name: "",
    text: "",
    rating: 5,
    image: "",
  });
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const testimonialImageInputRef = useRef<HTMLInputElement | null>(null);
  const previewLogoSrc =
    logoDataUrl ?? (logoPreview && !logoPreview.src.startsWith("blob:") ? logoPreview.src : undefined);
  const previewBannerSrc =
    bannerDataUrl ??
    (bannerPreview && !bannerPreview.src.startsWith("blob:") ? bannerPreview.src : undefined);
  const logoPreviewImageSrc = logoPreview && !logoPreview.src.startsWith("blob:") ? logoPreview.src : "";
  const bannerPreviewImageSrc =
    bannerPreview && !bannerPreview.src.startsWith("blob:") ? bannerPreview.src : "";

  const readFileAsDataUrl = useCallback((file: File, onLoad: (value: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) onLoad(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleLogoChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setLogoFile(file);
      if (!file) {
        setLogoDataUrl(null);
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        notify.error("Formato de imagem inválido. Use JPG ou PNG.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        notify.error("A imagem deve ter menos de 10MB.");
        return;
      }
      try {
        const dataUrl = await compressImageFile(file, { maxWidth: 400, maxHeight: 400, quality: 0.85 });
        setLogoPreview(buildPreviewFromFile(file, dataUrl));
        setLogoDataUrl(dataUrl);
      } catch (error) {
        console.error("Erro ao comprimir logo:", error);
        readFileAsDataUrl(file, value => {
          setLogoPreview(buildPreviewFromFile(file, value));
          setLogoDataUrl(value);
        });
      }
    },
    [readFileAsDataUrl]
  );

  const handleBannerChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setBannerFile(file);
      if (!file) {
        setBannerDataUrl(null);
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        notify.error("Formato de imagem inválido. Use JPG ou PNG.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        notify.error("A imagem deve ter menos de 10MB.");
        return;
      }
      try {
        const dataUrl = await compressImageFile(file, { maxWidth: 1400, maxHeight: 400, quality: 0.8 });
        setBannerPreview(buildPreviewFromFile(file, dataUrl));
        setBannerDataUrl(dataUrl);
      } catch (error) {
        console.error("Erro ao comprimir banner:", error);
        readFileAsDataUrl(file, value => {
          setBannerPreview(buildPreviewFromFile(file, value));
          setBannerDataUrl(value);
        });
      }
    },
    [readFileAsDataUrl]
  );

  const handleTestimonialImageChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      notify.error("Formato de imagem inválido. Use JPG ou PNG.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notify.error("A imagem deve ter menos de 10MB.");
      return;
    }
    readFileAsDataUrl(file, value => setTestimonialDraft(prev => ({ ...prev, image: value })));
  }, [readFileAsDataUrl]);

  useEffect(() => {
    return () => {
      if (logoPreview?.objectUrl) {
        URL.revokeObjectURL(logoPreview.objectUrl);
      }
    };
  }, [logoPreview?.objectUrl]);

  useEffect(() => {
    return () => {
      if (bannerPreview?.objectUrl) {
        URL.revokeObjectURL(bannerPreview.objectUrl);
      }
    };
  }, [bannerPreview?.objectUrl]);

  useEffect(() => {
    const fetchSize = async (
      preview: ImagePreview,
      setter: Dispatch<SetStateAction<ImagePreview | null>>
    ) => {
      if (preview.size !== null || preview.objectUrl) return;
      if (preview.src.startsWith("blob:") || preview.src.startsWith("data:")) return;
      try {
        const response = await fetch(preview.src, { method: "HEAD" });
        const size = response.headers.get("content-length");
        if (!size) return;
        const parsed = Number(size);
        if (Number.isNaN(parsed)) return;
        setter(current => (current && current.src === preview.src ? { ...current, size: parsed } : current));
      } catch {
      }
    };

    if (logoPreview) {
      void fetchSize(logoPreview, setLogoPreview);
    }
    if (bannerPreview) {
      void fetchSize(bannerPreview, setBannerPreview);
    }
  }, [logoPreview, bannerPreview]);

  const handleToggleTestimonialActive = useCallback(
    async (index: number) => {
      const current = testimonials[index];
      if (!current) return;
      const nextActive = !current.active;
      setTestimonials(prev => prev.map((item, i) => (i === index ? { ...item, active: nextActive } : item)));
      if (!current.id || !productId || !checkoutId || !token) return;
      try {
        await productApi.updateCheckoutDepoiment(
          productId,
          checkoutId,
          current.id,
          { active: nextActive },
          token
        );
        notify.success("Depoimento atualizado");
      } catch (error) {
        console.error("Erro ao atualizar depoimento:", error);
        setTestimonials(prev => prev.map((item, i) => (i === index ? { ...item, active: current.active } : item)));
        notify.error("Erro ao atualizar depoimento.");
      }
    },
    [testimonials, productId, checkoutId, token]
  );

  const handleDeleteTestimonial = useCallback(
    async (index: number) => {
      const current = testimonials[index];
      if (!current) return;
      if (current.id && productId && checkoutId && token) {
        try {
          await productApi.deleteCheckoutDepoiment(productId, checkoutId, current.id, token);
          notify.success("Depoimento removido");
        } catch (error) {
          console.error("Erro ao excluir depoimento:", error);
          notify.error("Erro ao excluir depoimento.");
          return;
        }
      } else {
        notify.success("Depoimento removido");
      }
      setTestimonials(prev => prev.filter((_, i) => i !== index));
    },
    [testimonials, productId, checkoutId, token]
  );

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      setProductLoading(true);
      try {
        const data = await withLoading(
          () => productApi.getProductById(productId, token),
          "Carregando produto"
        );
        setProduct(data);
      } catch (error) {
        console.error("Erro ao carregar produto do checkout:", error);
      } finally {
        setProductLoading(false);
      }
    };
    void fetchProduct();
  }, [productId, token, withLoading]);

  useEffect(() => {
    const fetchCheckout = async () => {
      if (!productId || !checkoutId || !token) return;
      try {
        const data = await withLoading(
          () => productApi.getCheckoutById(productId, checkoutId, token),
          "Carregando checkout"
        );
        console.log("[checkout] Dados carregados no GET /product/{id}/checkouts/{checkoutId}:", data);
        let depoiments: unknown = [];
        try {
          depoiments = await productApi.getCheckoutDepoiments(productId, checkoutId, token);
        } catch (error) {
          console.error("Erro ao buscar depoimentos do checkout:", error);
        }
        const depoimentsList = Array.isArray(depoiments)
          ? depoiments
          : (depoiments as { depoiments?: unknown; data?: unknown } | null)?.depoiments ??
            (depoiments as { data?: unknown } | null)?.data ??
            [];
        const mappedDepoiments = Array.isArray(depoimentsList)
          ? depoimentsList.map(t => {
              const raw = t as { [key: string]: unknown };
              const imageValue =
                (raw.image as string | undefined) ??
                (raw.image_url as string | undefined) ??
                (raw.imageUrl as string | undefined) ??
                (raw.avatar as string | undefined) ??
                (raw.avatar_url as string | undefined) ??
                (raw.avatarUrl as string | undefined) ??
                "";
              return {
                id: (raw.id as string | undefined) ?? undefined,
                name: (raw.name as string | undefined) ?? "",
                text: (raw.depoiment as string | undefined) ?? (raw.text as string | undefined) ?? "",
                rating: Number(raw.ratting ?? raw.rating ?? 0),
                active: (raw.active as boolean | undefined) ?? true,
                image: imageValue,
              };
            })
          : [];
        setCheckoutName(data.name || "Checkout");
        setTheme((data.theme as "dark" | "light") || "dark");
        setAccentColor(data.defaultColor || "#5f17ff");
        setShowLogo(Boolean(data.logo));
        setLogoPosition((data.position_logo as "left" | "center" | "right") || "left");
        setShowBanner(Boolean(data.banner));
        if (data.logo) {
          setLogoPreview(buildStoredPreview(String(data.logo), "Logo cadastrada"));
        } else {
          setLogoPreview(null);
        }
        setLogoDataUrl(null);
        if (data.banner) {
          setBannerPreview(buildStoredPreview(String(data.banner), "Banner cadastrado"));
        } else {
          setBannerPreview(null);
        }
        setBannerDataUrl(null);
        setRequiredEmailConfirmation(Boolean(data.required_email_confirmation));
        setCountdownEnabled(Boolean(data.countdown_active || data.countdown));
        setCounterBgColor(data.countdown_background || "#111111");
        setCounterTextColor(data.countdown_text_color || "#FFFFFF");
        setAcceptedDocuments(
          data.accepted_documents && data.accepted_documents.length > 0
            ? (data.accepted_documents as Array<"cpf" | "cnpj">)
            : ["cpf"]
        );
        setPaymentMethods(
          data.payment_methods && data.payment_methods.length > 0
            ? (data.payment_methods as Array<"card" | "boleto" | "pix">)
            : ["card"]
        );
        setCouponEnabled(Boolean(data.coupon_enabled));
        setDiscountCard(data.discount_card != null ? String(data.discount_card) : "");
        setDiscountPix(data.discount_pix != null ? String(data.discount_pix) : "");
        setDiscountBoleto(data.discount_boleto != null ? String(data.discount_boleto) : "");
        setInstallmentsLimit(data.installments_limit != null ? String(data.installments_limit) : "12");
        setInstallmentsPreselected(data.installments_preselected != null ? String(data.installments_preselected) : "12");
        setBoletoDueDays(data.boleto_due_days != null ? String(data.boleto_due_days) : "3");
        setPixExpireMinutes(data.pix_expire_minutes != null ? String(data.pix_expire_minutes) : "");
        setSalesNotificationsEnabled(Boolean(data.sales_notifications_enabled));
        setSocialProofEnabled(Boolean(data.social_proof_enabled));
        const payloadTestimonials = Array.isArray(data.testimonials)
          ? data.testimonials.map(t => {
              const raw = t as { [key: string]: unknown };
              const imageValue =
                t.image ||
                t.avatar ||
                (raw.image_url as string | undefined) ||
                (raw.imageUrl as string | undefined) ||
                (raw.avatar_url as string | undefined) ||
                (raw.avatarUrl as string | undefined) ||
                "";
              return {
                id: t.id,
                name: t.name || "",
                text: t.text || "",
                rating: t.rating ?? 0,
                active: t.active ?? true,
                image: imageValue,
              };
            })
          : [];
        const resolvedTestimonials = mappedDepoiments.length ? mappedDepoiments : payloadTestimonials;
        setReviewsEnabled(Boolean(data.testimonials_enabled) || resolvedTestimonials.length > 0);
        setTestimonials(resolvedTestimonials);
      } catch (error) {
        console.error("Erro ao carregar checkout para edição:", error);
      } finally {
      }
    };
    void fetchCheckout();
  }, [productId, checkoutId, token, withLoading]);

  const handleSave = async () => {
    if (!productId || !token) return;
    const normalizedName = checkoutName.trim();
    if (!normalizedName || normalizedName.toLowerCase() === "checkout") {
      notify.error("Informe um nome válido para o checkout.");
      return;
    }
    if (!acceptedDocuments.length) {
      alert("Selecione ao menos um documento (CPF/CNPJ).");
      return;
    }
    if (!paymentMethods.length) {
      alert("Selecione ao menos um método de pagamento.");
      return;
    }
    const payload: CheckoutPayload = {
      name: normalizedName,
      template: CheckoutTemplate.DEFAULT,
      required_address: true,
      required_phone: true,
      required_birthdate: true,
      required_document: true,
      required_email_confirmation: Boolean(requiredEmailConfirmation),
    };
    payload.theme = theme;
    payload.defaultColor = accentColor;
    payload.accepted_documents = acceptedDocuments;
    payload.payment_methods = paymentMethods;
    payload.coupon_enabled = couponEnabled;
    if (couponEnabled) {
      if (discountCard) payload.discount_card = Number(discountCard) || 0;
      if (discountPix) payload.discount_pix = Number(discountPix) || 0;
      if (discountBoleto) payload.discount_boleto = Number(discountBoleto) || 0;
      if (installmentsLimit) payload.installments_limit = Number(installmentsLimit);
      if (installmentsPreselected) payload.installments_preselected = Number(installmentsPreselected);
      if (boletoDueDays) payload.boleto_due_days = Number(boletoDueDays);
      if (pixExpireMinutes) payload.pix_expire_minutes = Number(pixExpireMinutes);
    }

    if (countdownEnabled) {
      payload.countdown = true;
      payload.countdown_active = true;
      payload.countdown_background = counterBgColor;
      payload.countdown_text_color = counterTextColor;
    }
    const logoValue = logoDataUrl ?? logoPreview?.src ?? undefined;
    if (showLogo && logoValue) payload.logo = logoValue;
    if (showLogo) payload.position_logo = logoPosition;
    const bannerValue = bannerDataUrl ?? bannerPreview?.src ?? undefined;
    if (showBanner && bannerValue) payload.banner = bannerValue;
    payload.social_proof_enabled = socialProofEnabled;
    payload.sales_notifications_enabled = salesNotificationsEnabled;
    payload.testimonials_enabled = reviewsEnabled;
    if (reviewsEnabled && testimonials.length) {
      payload.testimonials = testimonials.map(item => ({
        id: item.id,
        name: item.name,
        text: item.text,
        rating: item.rating,
        active: item.active,
        image: item.image || undefined,
      }));
    }

    setIsSaving(true);
    try {
      console.log("[checkout] Payload enviado:", payload);
      const response = checkoutId
        ? await productApi.updateCheckout(productId, checkoutId, payload, token)
        : await productApi.createCheckout(productId, payload, token);
      console.log("[checkout] Resposta do servidor:", response);
      const targetCheckoutId = checkoutId ?? (response as { id?: string } | undefined)?.id;
      if (reviewsEnabled && targetCheckoutId) {
        const newTestimonials = testimonials.filter(item => !item.id);
        if (newTestimonials.length > 0) {
          const created = await Promise.all(
            newTestimonials.map(item =>
              productApi.createCheckoutDepoiment(
                productId,
                targetCheckoutId,
                {
                  ...(item.image ? { image: item.image } : {}),
                  name: item.name || "Nome",
                  depoiment: item.text || "Depoimento",
                  active: item.active ?? true,
                  ratting: String(item.rating ?? ""),
                },
                token
              )
            )
          );
          setTestimonials(prev => {
            let createdIndex = 0;
            return prev.map(item => {
              if (item.id) return item;
              const createdItem = created[createdIndex];
              createdIndex += 1;
              return { ...item, id: (createdItem as { id?: string } | undefined)?.id ?? item.id };
            });
          });
        }
      }
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Erro ao salvar checkout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = onClose || onBack;

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl 2xl:max-w-7xl flex-col items-stretch gap-6">
        {onBack && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              {backLabel || "← Voltar"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="overflow-hidden rounded-[10px] bg-foreground/10">
              {productLoading ? (
                <Skeleton className="h-[72px] w-[72px]" />
              ) : (
                <Image
                  src={product?.image_url || "/images/produto.png"}
                  alt={product?.name || "Produto"}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] object-cover"
                />
              )}
            </div>
            <div className="space-y-1">
              {productLoading ? (
                <>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-16" />
                </>
              ) : (
                <>
                  <p className="text-base font-semibold text-foreground">{product?.name ?? "-----"}</p>
                  <p className="text-xs font-semibold text-emerald-400">
                    {product?.status && product.status.trim() ? product.status : "Ativo"}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {productLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 ml-auto" />
                <Skeleton className="h-3 w-24 ml-auto" />
              </div>
            ) : (
              <>
                <p className="font-semibold text-foreground">
                  {product?.total_invoiced !== undefined
                    ? `${currencyFormatter.format(Number(product.total_invoiced))} faturados`
                    : "R$ ----- faturados"}
                </p>
                <p>
                  {product?.total_sold !== undefined
                    ? `${product.total_sold} vendas realizadas`
                    : "-- vendas realizadas"}
                </p>
              </>
            )}
          </div>
        </div>

        <h1 className="text-xl font-semibold text-foreground">Editar Checkout</h1>

        <div className="flex flex-col gap-3 overflow-y-auto pb-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
            <div className="space-y-3">
              <SectionCard title="Nome">
                <input
                  className={fieldClass}
                  placeholder="Digite um nome"
                  value={checkoutName}
                  onChange={event => setCheckoutName(event.target.value)}
                />
              </SectionCard>

              <SectionCard title="Campos obrigatórios no Checkout" iconSrc="/images/editar-produtos/warning.svg">
                <div className="space-y-4 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Itens Obrigatórios</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Endereço", active: requiredAddress },
                      { label: "Telefone", active: requiredPhone },
                      { label: "Data de nascimento", active: requiredBirthdate },
                      { label: "CPF", active: requiredDocument },
                    ].map(field => (
                      <button
                        key={field.label}
                        type="button"
                        disabled
                        className="rounded-[6px] px-3 py-2 text-[11px] font-semibold bg-primary text-primary-foreground cursor-not-allowed opacity-90"
                      >
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Confirmação de email</span>
                  <button
                    type="button"
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${requiredEmailConfirmation ? "bg-primary/70" : "bg-muted"}`}
                    onClick={() => setRequiredEmailConfirmation(prev => !prev)}
                  >
                    <span
                      className={`absolute h-4 w-4 rounded-full bg-white transition ${
                        requiredEmailConfirmation ? "left-[calc(100%-18px)]" : "left-[6px]"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  O usuário será condicionado a reportar o email informado em um campo específico para sua confirmação.
                </p>
              </SectionCard>

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
                        onChange={handleLogoChange}
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
                              setLogoFile(null);
                              setLogoPreview(null);
                              setLogoDataUrl(null);
                              if (logoInputRef.current) {
                                logoInputRef.current.value = "";
                              }
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
                              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                                {logoPreview.ext}
                              </span>
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
                          onChange={event =>
                            setLogoPosition(event.target.value as "left" | "center" | "right")
                          }
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
                        onChange={handleBannerChange}
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
                              setBannerFile(null);
                              setBannerPreview(null);
                              setBannerDataUrl(null);
                              if (bannerInputRef.current) {
                                bannerInputRef.current.value = "";
                              }
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
                              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                                {bannerPreview.ext}
                              </span>
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
            </div>

            <div className="space-y-2">
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
                    onClick={handleCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] disabled:opacity-60"
                  >
                    {isSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-[400px]">
            <SectionCard title="Pagamentos" iconSrc="/images/editar-produtos/pagamentos.svg">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Aceitar pagamentos de</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "CPF", value: "cpf" },
                    { label: "CNPJ", value: "cnpj" },
                  ].map(doc => {
                    const active = acceptedDocuments.includes(doc.value as "cpf" | "cnpj");
                    return (
                      <button
                        key={doc.value}
                        type="button"
                        className={`rounded-[8px] border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-foreground/20 bg-card text-foreground"
                        }`}
                        onClick={() =>
                          setAcceptedDocuments(prev => {
                            const exists = prev.includes(doc.value as "cpf" | "cnpj");
                            if (exists) {
                              const next = prev.filter(item => item !== doc.value);
                              return next.length ? next : prev;
                            }
                            return [...prev, doc.value as "cpf" | "cnpj"];
                          })
                        }
                      >
                        {doc.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm font-semibold text-foreground">Métodos aceitos</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Cartão de crédito", value: "card" },
                    { label: "Boleto", value: "boleto" },
                    { label: "Pix", value: "pix" },
                  ].map(method => {
                    const active = paymentMethods.includes(method.value as "card" | "boleto" | "pix");
                    return (
                      <button
                        key={method.value}
                        type="button"
                        className={`rounded-[8px] border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "border-primary/60 bg-primary/10 text-primary"
                            : "border-foreground/20 bg-card text-foreground"
                        }`}
                        onClick={() =>
                          setPaymentMethods(prev => {
                            const exists = prev.includes(method.value as "card" | "boleto" | "pix");
                            if (exists) {
                              const next = prev.filter(item => item !== method.value);
                              return next.length ? next : prev;
                            }
                            return [...prev, method.value as "card" | "boleto" | "pix"];
                          })
                        }
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-foreground pt-2">
                  <span>Cupom de desconto</span>
                  <button
                    type="button"
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${couponEnabled ? "bg-primary/70" : "bg-muted"}`}
                    onClick={() => setCouponEnabled(prev => !prev)}
                  >
                    <span
                      className={`absolute h-4 w-4 rounded-full bg-white transition ${
                        couponEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
                      }`}
                    />
                  </button>
                </div>
                {couponEnabled && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-xs text-muted-foreground">
                        <span>Cartão de crédito</span>
                        <div className="relative">
                          <input
                            className={`${fieldClass} pr-10`}
                            placeholder="0"
                            value={discountCard}
                            onChange={event => setDiscountCard(event.target.value)}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                        </div>
                      </label>
                      <label className="space-y-2 text-xs text-muted-foreground">
                        <span>Pix</span>
                        <div className="relative">
                          <input
                            className={`${fieldClass} pr-10`}
                            placeholder="0"
                            value={discountPix}
                            onChange={event => setDiscountPix(event.target.value)}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                        </div>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="space-y-2 text-xs text-muted-foreground">
                        <span>Boleto</span>
                        <div className="relative">
                          <input
                            className={`${fieldClass} pr-10`}
                            placeholder="0"
                            value={discountBoleto}
                            onChange={event => setDiscountBoleto(event.target.value)}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                        </div>
                      </label>
                      <div className="hidden sm:block" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Cartão de crédito</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="relative">
                          <input
                            className={`${fieldClass} pr-8`}
                            placeholder="Limite de parcelas"
                            value={installmentsLimit}
                            onChange={event => setInstallmentsLimit(event.target.value.replace(/\D/g, ""))}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">x</span>
                        </div>
                        <div className="relative">
                          <input
                            className={`${fieldClass} pr-8`}
                            placeholder="Parcela pré-selecionada"
                            value={installmentsPreselected}
                            onChange={event => setInstallmentsPreselected(event.target.value.replace(/\D/g, ""))}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">x</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-semibold text-foreground">Boleto</p>
                      <label className="space-y-2 text-xs text-muted-foreground">
                        <span>Dias para vencimento</span>
                        <select
                          className={`${fieldClass} appearance-none`}
                          value={boletoDueDays}
                          onChange={event => setBoletoDueDays(event.target.value)}
                        >
                          {["1", "2", "3", "4", "5"].map(day => (
                            <option key={day} value={day}>
                              {day} dia{day === "1" ? "" : "s"}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Pix</p>
                      <label className="space-y-2 text-xs text-muted-foreground">
                        <span>Tempo de expiração</span>
                        <div className="relative">
                          <input
                            type="number"
                            className={`${fieldClass} pr-16`}
                            placeholder="00"
                            min={0}
                            value={pixExpireMinutes}
                            onChange={event => setPixExpireMinutes(event.target.value.replace(/\D/g, ""))}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">Minutos</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Preferências</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="ui-checkbox" />
                      Mostrar nomes do vendedor no rodapé
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="ui-checkbox" />
                      Solicitar endereço do comprador
                    </label>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Gatilhos e Depoimentos" iconSrc="/images/editar-produtos/gatilhos.svg">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[15px] font-semibold text-foreground">
                  <span>Contador Regressivo</span>
                  <button
                    type="button"
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${countdownEnabled ? "bg-primary/70" : "bg-muted"}`}
                    onClick={() => setCountdownEnabled(prev => !prev)}
                  >
                    <span
                      className={`absolute h-4 w-4 rounded-full bg-white transition ${
                        countdownEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
                      }`}
                    />
                  </button>
                </div>

                {countdownEnabled && (
                  <>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <span>Texto de mensagem ativa</span>
                      <textarea
                        className="min-h-[72px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Seu tempo acabou! Finalize a compra imediatamente."
                      />
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <span>Texto da contagem zerada</span>
                      <textarea
                        className="min-h-[72px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Seu tempo acabou! Finalize a compra imediatamente."
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Cor do fundo do contador</p>
                      <div className="flex items-center gap-2">
                        <input
                          className="h-11 flex-1 rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="#FFFFFF"
                          value={counterBgColor}
                          onChange={e => setCounterBgColor(e.target.value)}
                        />
                        <input
                          type="color"
                          className="h-11 w-16 cursor-pointer rounded-[10px] border border-foreground/15 bg-card p-1"
                          aria-label="Selecionar cor de fundo"
                          value={counterBgColor}
                          onChange={e => setCounterBgColor(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">Cor do Texto do contador</p>
                      <div className="flex items-center gap-2">
                        <input
                          className="h-11 flex-1 rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="#FFFFFF"
                          value={counterTextColor}
                          onChange={e => setCounterTextColor(e.target.value)}
                        />
                        <input
                          type="color"
                          className="h-11 w-16 cursor-pointer rounded-[10px] border border-foreground/15 bg-card p-1"
                          aria-label="Selecionar cor do texto"
                          value={counterTextColor}
                          onChange={e => setCounterTextColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Notificações de vendas</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        salesNotificationsEnabled ? "bg-primary/70" : "bg-muted"
                      }`}
                      onClick={() => setSalesNotificationsEnabled(prev => !prev)}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${
                          salesNotificationsEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
                        }`}
                      />
                    </button>
                  </div>
                  {salesNotificationsEnabled && (
                    <input
                      className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="15 segundos"
                    />
                  )}
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <span>Configure as notificações</span>
                    <span className="text-[11px] text-muted-foreground">Qnt mínima</span>
                  </div>
                  {[
                    "XX pessoas estão comprando o produto.",
                    "XX pessoas compraram o produto agora mesmo.",
                    "XX pessoas compraram o produto nos últimos 30 minutos.",
                    "XX pessoas compraram o produto na última hora.",
                  ].map(label => (
                    <label key={label} className="flex items-center gap-3 text-foreground">
                      <input type="checkbox" className="ui-checkbox" />
                      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                      <input
                        className="h-9 w-14 rounded-[8px] border border-foreground/20 bg-card px-2 text-xs text-foreground focus:outline-none"
                        placeholder="1"
                      />
                    </label>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Prova Social</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        socialProofEnabled ? "bg-primary/70" : "bg-muted"
                      }`}
                      onClick={() => setSocialProofEnabled(prev => !prev)}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${
                          socialProofEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
                        }`}
                      />
                    </button>
                  </div>
                  {socialProofEnabled && (
                    <textarea
                      className="min-h-[70px] w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Outras ( num-visitantes ) visitantes estão finalizando a compra neste momento."
                    />
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-sm font-semibold text-foreground">Mínimo de visitantes</p>
                  <input
                    className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="15 visitantes"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-foreground/5">
                      ⭐
                    </span>
                    <p>Depoimentos/Reviews</p>
                    <button
                      type="button"
                      className={`relative ml-auto inline-flex h-5 w-10 items-center rounded-full ${
                        reviewsEnabled ? "bg-primary/70" : "bg-muted"
                      }`}
                      onClick={() => setReviewsEnabled(prev => !prev)}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${
                          reviewsEnabled ? "left-[calc(100%-18px)]" : "left-[6px]"
                        }`}
                      />
                    </button>
                  </div>
                  {reviewsEnabled && (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        Com os reviews, você cria argumentos de confiança para seu cliente finalizar a compra.
                      </p>

                      {testimonials.map((item, idx) => (
                        <div
                          key={item.id ?? idx}
                          className="space-y-2 rounded-[10px] border border-foreground/15 bg-card p-3"
                        >
                          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-foreground">#{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                                    item.active ? "bg-primary/70" : "bg-muted"
                                  }`}
                                  onClick={() => handleToggleTestimonialActive(idx)}
                                >
                                  <span
                                    className={`absolute h-4 w-4 rounded-full bg-white transition ${
                                      item.active ? "left-[calc(100%-18px)]" : "left-[6px]"
                                    }`}
                                  />
                                </button>
                                <span className="text-xs text-foreground">{item.active ? "Ativo" : "Inativo"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-[6px] border border-blue-500/40 bg-blue-500/10 px-2 py-1 text-xs text-blue-200 transition hover:border-blue-500/70"
                                onClick={() => {
                                  setEditingTestimonialIndex(idx);
                                    setTestimonialDraft({
                                      name: item.name,
                                      text: item.text,
                                      rating: item.rating ?? 5,
                                      image: item.image || "",
                                    });
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                                Editar
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-[6px] border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-xs text-rose-200 transition hover:border-rose-500/70"
                                onClick={() => handleDeleteTestimonial(idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Excluir
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name || "Depoimento"}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/70" />
                            )}
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-foreground">{item.name || "Nome"}</p>
                              <div className="flex gap-1 text-[#8ea000]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < (item.rating ?? 0) ? "★" : "☆"}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.text || "Depoimento do cliente."}</p>
                        </div>
                      ))}

                      <div className="space-y-4 rounded-[10px] border border-foreground/15 bg-card p-3">
                        <p className="text-sm font-semibold text-foreground">
                          {editingTestimonialIndex !== null ? "Editar depoimento" : "Novo depoimento"}
                        </p>
                        <div className="space-y-2">
                          <button
                            type="button"
                            className="flex w-full items-center justify-center rounded-[10px] border border-dashed border-foreground/20 bg-foreground/5 px-4 py-6 text-xs text-muted-foreground transition hover:border-primary/60"
                            onClick={() => testimonialImageInputRef.current?.click()}
                          >
                            {testimonialDraft.image ? (
                              <Image
                                src={testimonialDraft.image}
                                alt="Preview depoimento"
                                width={120}
                                height={120}
                                className="h-20 w-20 rounded-full object-cover"
                              />
                            ) : (
                              <span>Arraste a imagem ou clique aqui</span>
                            )}
                          </button>
                          <input
                            ref={testimonialImageInputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleTestimonialImageChange}
                          />
                          <p className="text-[11px] text-muted-foreground">
                            Aceitamos .jpg, .jpeg e .png com menos de 10mb. Sugestão de tamanho: 300 x 300.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className="text-sm font-semibold text-foreground">Classificação</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setTestimonialDraft(prev => ({ ...prev, rating: i + 1 }))}
                                className={`text-lg ${
                                  i < testimonialDraft.rating ? "text-[#8ea000]" : "text-muted-foreground/50"
                                }`}
                                aria-label={`Nota ${i + 1}`}
                                aria-pressed={i < testimonialDraft.rating}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <label className="space-y-2 text-xs text-muted-foreground">
                          <span className="text-sm font-semibold text-foreground">Nome</span>
                          <input
                            className={fieldClass}
                            placeholder="Insira um nome"
                            value={testimonialDraft.name}
                            onChange={event => setTestimonialDraft(prev => ({ ...prev, name: event.target.value }))}
                          />
                        </label>

                        <label className="space-y-2 text-xs text-muted-foreground">
                          <span className="text-sm font-semibold text-foreground">Depoimento</span>
                          <textarea
                            className="min-h-[96px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            placeholder="Insira um depoimento"
                            value={testimonialDraft.text}
                            onChange={event => setTestimonialDraft(prev => ({ ...prev, text: event.target.value }))}
                          />
                        </label>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="rounded-[8px] bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                            onClick={async () => {
                              const activeValue =
                                editingTestimonialIndex !== null
                                  ? testimonials[editingTestimonialIndex]?.active ?? true
                                  : true;
                              const nextItem = {
                                name: testimonialDraft.name || "Nome",
                                text: testimonialDraft.text || "Depoimento do cliente",
                                rating: testimonialDraft.rating,
                                active: activeValue,
                                image: testimonialDraft.image || "",
                              };
                              if (editingTestimonialIndex !== null) {
                                const current = testimonials[editingTestimonialIndex];
                                if (current?.id && productId && checkoutId && token) {
                                  try {
                                    await productApi.updateCheckoutDepoiment(
                                      productId,
                                      checkoutId,
                                      current.id,
                                      {
                                        ...(nextItem.image ? { image: nextItem.image } : {}),
                                        name: nextItem.name,
                                        depoiment: nextItem.text,
                                        active: nextItem.active,
                                        ratting: String(nextItem.rating ?? ""),
                                      },
                                      token
                                    );
                                    notify.success("Depoimento atualizado");
                                  } catch (error) {
                                    console.error("Erro ao atualizar depoimento:", error);
                                    notify.error("Erro ao atualizar depoimento.");
                                    return;
                                  }
                                } else {
                                  notify.success("Depoimento atualizado");
                                }
                              } else {
                                notify.success("Depoimento adicionado");
                              }
                              setTestimonials(prev => {
                                if (editingTestimonialIndex === null) {
                                  return [nextItem, ...prev];
                                }
                                return prev.map((item, i) => (i === editingTestimonialIndex ? { ...item, ...nextItem } : item));
                              });
                              setTestimonialDraft({ name: "", text: "", rating: 5, image: "" });
                              setEditingTestimonialIndex(null);
                            }}
                          >
                            {editingTestimonialIndex !== null ? "Salvar edição" : "Inserir novo depoimento"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Pós-compra" iconSrc="/images/editar-produtos/poscompra.svg">
              <div className="space-y-3">
                <label className="space-y-1 text-xs text-muted-foreground">
                  <span>Título da mensagem</span>
                  <input className={fieldClass} placeholder="Agradecemos pela sua compra!" />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  <span>Descritivo</span>
                  <textarea
                    className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Você receberá um e-mail confirmando o seu pedido."
                  />
                </label>
              </div>
            </SectionCard>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm text-foreground"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)]"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

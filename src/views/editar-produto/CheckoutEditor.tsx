'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { productApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { CheckoutPayload, Product } from "@/lib/api";
import { CheckoutTemplate } from "@/lib/api";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { notify } from "@/shared/ui/notification-toast";
import { SectionCard, fieldClass } from "./checkout-editor/shared";
import {
  buildPreviewFromFile,
  buildStoredPreview,
  compressImageFile,
  normalizeImageUrl,
  resolveUploadedImageUrl,
  resolveUploadedUrl,
  type ImagePreview,
} from "./checkout-editor/utils";
import { RequiredFieldsSection } from "./checkout-editor/sections/RequiredFieldsSection";
import { VisualSection } from "./checkout-editor/sections/VisualSection";
import { PaymentsSection } from "./checkout-editor/sections/PaymentsSection";
import { PreviewSection } from "./checkout-editor/sections/PreviewSection";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

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
  const [checkoutName, setCheckoutName] = useState("");
  const [currentCheckoutName, setCurrentCheckoutName] = useState("Checkout");
  const [requiredAddress, setRequiredAddress] = useState(true);
  const [requiredPhone, setRequiredPhone] = useState(true);
  const [requiredBirthdate, setRequiredBirthdate] = useState(true);
  const [requiredDocument, setRequiredDocument] = useState(true);
  const [requiredEmailConfirmation, setRequiredEmailConfirmation] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
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
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [salesNotificationsEnabled, setSalesNotificationsEnabled] = useState(false);
  const [socialProofEnabled, setSocialProofEnabled] = useState(false);
  const [socialProofMessage, setSocialProofMessage] = useState("");
  const [socialProofMinClient, setSocialProofMinClient] = useState("");
  const [reviewsEnabled, setReviewsEnabled] = useState(false);
  const [acceptedDocuments, setAcceptedDocuments] = useState<Array<"cpf" | "cnpj">>(["cpf"]);
  const [paymentMethods, setPaymentMethods] = useState<Array<"card" | "boleto" | "pix">>(["card"]);
  const [showSellerDetail, setShowSellerDetail] = useState(false);
  const [afterSaleTitle, setAfterSaleTitle] = useState("");
  const [afterSaleMessage, setAfterSaleMessage] = useState("");
  const [testimonials, setTestimonials] = useState<
    {
      id?: string;
      name: string;
      text: string;
      rating: number;
      active: boolean;
      image?: string;
      imageFile?: File | null;
    }[]
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
  const [testimonialImageFile, setTestimonialImageFile] = useState<File | null>(null);
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
        const preview = buildPreviewFromFile(file);
        setLogoPreview(preview);
        setLogoDataUrl(null);
      }
    },
    []
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
        const preview = buildPreviewFromFile(file);
        setBannerPreview(preview);
        setBannerDataUrl(null);
      }
    },
    []
  );

  const handleRemoveLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoDataUrl(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  }, []);

  const handleRemoveBanner = useCallback(() => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerDataUrl(null);
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  }, []);

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
    const objectUrl = URL.createObjectURL(file);
    setTestimonialImageFile(file);
    setTestimonialDraft(prev => {
      if (prev.image?.startsWith("blob:")) {
        URL.revokeObjectURL(prev.image);
      }
      return { ...prev, image: objectUrl };
    });
  }, []);

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
      if (current.image?.startsWith("blob:")) {
        URL.revokeObjectURL(current.image);
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
        const depoimentsDetailed = Array.isArray(depoimentsList)
          ? await Promise.all(
              depoimentsList.map(async item => {
                const raw = item as { [key: string]: unknown };
                const depoimentId = raw.id as string | undefined;
                if (!depoimentId) return item;
                try {
                  return await productApi.getCheckoutDepoiment(productId, checkoutId, depoimentId, token);
                } catch (error) {
                  console.error("Erro ao buscar depoimento específico:", error);
                  return item;
                }
              })
            )
          : [];
        const mappedDepoiments = Array.isArray(depoimentsDetailed) && depoimentsDetailed.length
          ? depoimentsDetailed.map(t => {
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
          : Array.isArray(depoimentsList)
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

        let paymentMethod: unknown = null;
        const paymentMethodDetail: unknown = null;
        try {
          paymentMethod = await productApi.getCheckoutPaymentMethod(productId, checkoutId, token);
          console.log("[checkout] PaymentMethod GET:", paymentMethod);
          const rawPayment = paymentMethod as { id?: string; paymentMethodId?: string; payment_method_id?: string };
          const resolvedPaymentMethodId =
            rawPayment?.id ?? rawPayment?.paymentMethodId ?? rawPayment?.payment_method_id;
          if (resolvedPaymentMethodId) {
            setPaymentMethodId(resolvedPaymentMethodId);
          }
        } catch (error) {
          console.error("Erro ao buscar payment method do checkout:", error);
        }

        try {
          const messages = await productApi.getCheckoutMessages(productId, checkoutId, token);
          console.log("[checkout] Messages GET:", messages);
          const messagesList = Array.isArray(messages)
            ? messages
            : (messages as { messages?: unknown; data?: unknown } | null)?.messages ??
              (messages as { data?: unknown } | null)?.data ??
              [];
          if (Array.isArray(messagesList)) {
            await Promise.all(
              messagesList.map(async item => {
                const raw = item as { [key: string]: unknown };
                const messageId = raw.id as string | undefined;
                if (!messageId) return;
                try {
                  const detail = await productApi.getCheckoutMessageById(
                    productId,
                    checkoutId,
                    messageId,
                    token
                  );
                  console.log("[checkout] Message detail GET:", detail);
                } catch (error) {
                  console.error("Erro ao buscar mensagem específica:", error);
                }
              })
            );
          }
        } catch (error) {
          console.error("Erro ao buscar mensagens do checkout:", error);
        }
        const loadedName = data.name || "Checkout";
        setCurrentCheckoutName(loadedName);
        setCheckoutName("");
        setTheme((data.theme as "dark" | "light") || "dark");
        setAccentColor((data.defaultColor as string | undefined) || (data.default_color as string | undefined) || "#5f17ff");
        const normalizedLogo = normalizeImageUrl((data.logo as string | null | undefined) ?? "");
        const normalizedBanner = normalizeImageUrl((data.banner as string | null | undefined) ?? "");
        setShowLogo(Boolean(normalizedLogo));
        setLogoPosition((data.position_logo as "left" | "center" | "right") || "left");
        setShowBanner(Boolean(normalizedBanner));
        if (normalizedLogo) {
          setLogoPreview(buildStoredPreview(String(normalizedLogo), "Logo cadastrada"));
        } else {
          setLogoPreview(null);
        }
        setLogoDataUrl(null);
        if (normalizedBanner) {
          setBannerPreview(buildStoredPreview(String(normalizedBanner), "Banner cadastrado"));
        } else {
          setBannerPreview(null);
        }
        setBannerDataUrl(null);
        setRequiredAddress(data.required_address ?? true);
        setRequiredPhone(data.required_phone ?? true);
        setRequiredBirthdate(data.required_birthdate ?? true);
        setRequiredDocument(data.required_document ?? true);
        setRequiredEmailConfirmation(Boolean(data.required_email_confirmation));
        setCountdownEnabled(Boolean(data.countdown_active || data.countdown));
        setCounterBgColor(data.countdown_background || "#111111");
        setCounterTextColor(data.countdown_text_color || "#FFFFFF");
        const paymentSource =
          (paymentMethodDetail as Record<string, unknown> | null) ??
          (paymentMethod as Record<string, unknown> | null);
        const acceptCompany =
          (paymentSource?.accept_document_company as boolean | undefined) ??
          (paymentSource?.acceptDocumentCompany as boolean | undefined) ??
          false;
        const acceptIndividual =
          (paymentSource?.accept_document_individual as boolean | undefined) ??
          (paymentSource?.acceptDocumentIndividual as boolean | undefined) ??
          false;
        const acceptPix =
          (paymentSource?.accept_pix as boolean | undefined) ??
          (paymentSource?.acceptPix as boolean | undefined) ??
          false;
        const acceptCard =
          (paymentSource?.accept_credit_card as boolean | undefined) ??
          (paymentSource?.acceptCreditCard as boolean | undefined) ??
          false;
        const acceptTicket =
          (paymentSource?.accept_ticket as boolean | undefined) ??
          (paymentSource?.acceptTicket as boolean | undefined) ??
          false;
        const acceptCoupon =
          (paymentSource?.accept_coupon as boolean | undefined) ??
          (paymentSource?.acceptCoupon as boolean | undefined) ??
          false;
        const shownSeller =
          (paymentSource?.shown_seller_detail as boolean | undefined) ??
          (paymentSource?.shownSellerDetail as boolean | undefined) ??
          false;
        const requireAddress =
          (paymentSource?.require_address as boolean | undefined) ??
          (paymentSource?.requireAddress as boolean | undefined);

        const acceptDocs = [
          ...(acceptIndividual ? (["cpf"] as Array<"cpf" | "cnpj">) : []),
          ...(acceptCompany ? (["cnpj"] as Array<"cpf" | "cnpj">) : []),
        ];
        const acceptPayments = [
          ...(acceptCard ? (["card"] as Array<"card" | "boleto" | "pix">) : []),
          ...(acceptTicket ? (["boleto"] as Array<"card" | "boleto" | "pix">) : []),
          ...(acceptPix ? (["pix"] as Array<"card" | "boleto" | "pix">) : []),
        ];
        setAcceptedDocuments(acceptDocs.length ? acceptDocs : ["cpf"]);
        setPaymentMethods(acceptPayments.length ? acceptPayments : ["card"]);
        setCouponEnabled(Boolean(acceptCoupon));
        setShowSellerDetail(Boolean(shownSeller));
        if (typeof requireAddress === "boolean") {
          setRequiredAddress(requireAddress);
        }

        const detailDiscount =
          (paymentSource?.detail_discount as Record<string, unknown> | undefined) ??
          (paymentSource?.detailDiscount as Record<string, unknown> | undefined);
        const detailPayment =
          (paymentSource?.detail_payment_method as Record<string, unknown> | undefined) ??
          (paymentSource?.detailPaymentMethod as Record<string, unknown> | undefined);

        setDiscountCard(detailDiscount?.card != null ? String(detailDiscount.card) : "");
        setDiscountPix(detailDiscount?.pix != null ? String(detailDiscount.pix) : "");
        setDiscountBoleto(detailDiscount?.boleto != null ? String(detailDiscount.boleto) : "");
        setInstallmentsLimit(detailPayment?.installments_limit != null ? String(detailPayment.installments_limit) : "12");
        setInstallmentsPreselected(
          detailPayment?.installments_preselected != null ? String(detailPayment.installments_preselected) : "12"
        );
        setBoletoDueDays(detailPayment?.boleto_due_days != null ? String(detailPayment.boleto_due_days) : "3");
        setPixExpireMinutes(detailPayment?.pix_expire_minutes != null ? String(detailPayment.pix_expire_minutes) : "");
        setSalesNotificationsEnabled(Boolean(data.sales_notifications_enabled));
        setSocialProofEnabled(Boolean(data.social_proof_enabled));
        setSocialProofMessage((data.social_proofs_message as string | undefined) || "");
        setSocialProofMinClient(
          data.social_proofs_min_client != null
            ? String(data.social_proofs_min_client)
            : ""
        );
        setAfterSaleTitle(
          (data.after_sale_title as string | undefined) ||
            (data.after_sale_title as string | undefined) ||
            ""
        );
        setAfterSaleMessage(
          (data.after_sale_message as string | undefined) ||
            (data.after_sale_message as string | undefined) ||
            ""
        );
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
    const fallbackName = currentCheckoutName.trim();
    const finalName = normalizedName || fallbackName;
    if (!finalName || finalName.toLowerCase() === "checkout") {
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
      name: finalName,
      template: CheckoutTemplate.DEFAULT,
      required_address: requiredAddress,
      required_phone: requiredPhone,
      required_birthdate: requiredBirthdate,
      required_document: requiredDocument,
      required_email_confirmation: Boolean(requiredEmailConfirmation),
    };
    payload.theme = theme;
    payload.default_color = accentColor;

    if (countdownEnabled) {
      payload.countdown = true;
      payload.countdown_active = true;
      payload.countdown_background = counterBgColor;
      payload.countdown_text_color = counterTextColor;
    }
    if (showLogo) payload.position_logo = logoPosition;
    payload.social_proof_enabled = socialProofEnabled;
    if (socialProofEnabled) {
      if (socialProofMessage.trim()) {
        payload.social_proofs_message = socialProofMessage.trim();
      }
      const minClientValue = socialProofMinClient.trim();
      if (minClientValue) {
        payload.social_proofs_min_client = Number(minClientValue) || 0;
      }
    }
    payload.sales_notifications_enabled = salesNotificationsEnabled;
    payload.testimonials_enabled = reviewsEnabled;
    if (reviewsEnabled && testimonials.length) {
      payload.testimonials = testimonials.map(item => ({
        id: item.id,
        name: item.name,
        text: item.text,
        rating: item.rating,
        active: item.active,
        image: normalizeImageUrl(item.image),
      }));
    }
    if (afterSaleTitle.trim()) {
      payload.after_sale_title = afterSaleTitle.trim();
    }
    if (afterSaleMessage.trim()) {
      payload.after_sale_message = afterSaleMessage.trim();
    }

    setIsSaving(true);
    try {
      console.log("[checkout] Payload enviado:", payload);
      const response = checkoutId
        ? await productApi.updateCheckout(productId, checkoutId, payload, token)
        : await productApi.createCheckout(productId, payload, token);
      console.log("[checkout] Resposta do servidor:", response);
      const targetCheckoutId = checkoutId ?? (response as { id?: string } | undefined)?.id;
      if (targetCheckoutId && productId && token) {
        try {
          const paymentPayload = {
            accept_document_company: acceptedDocuments.includes("cnpj"),
            accept_document_individual: acceptedDocuments.includes("cpf"),
            accept_pix: paymentMethods.includes("pix"),
            accept_credit_card: paymentMethods.includes("card"),
            accept_ticket: paymentMethods.includes("boleto"),
            accept_coupon: couponEnabled,
            shown_seller_detail: showSellerDetail,
            require_address: requiredAddress,
            detail_discount: couponEnabled
              ? {
                  card: discountCard ? Number(discountCard) || 0 : 0,
                  pix: discountPix ? Number(discountPix) || 0 : 0,
                  boleto: discountBoleto ? Number(discountBoleto) || 0 : 0,
                }
              : {},
            detail_payment_method: {
              installments_limit: installmentsLimit ? Number(installmentsLimit) : undefined,
              installments_preselected: installmentsPreselected ? Number(installmentsPreselected) : undefined,
              boleto_due_days: boletoDueDays ? Number(boletoDueDays) : undefined,
              pix_expire_minutes: pixExpireMinutes ? Number(pixExpireMinutes) : undefined,
            },
          };
          console.log("[checkout] Payload métodos de pagamento:", paymentPayload);
          if (paymentMethodId && checkoutId) {
            await productApi.updateCheckoutPaymentMethod(
              productId,
              checkoutId,
              paymentMethodId,
              paymentPayload,
              token
            );
          } else {
            await productApi.saveCheckoutPaymentMethods(productId, targetCheckoutId, paymentPayload, token);
          }
        } catch (error) {
          console.error("Erro ao salvar métodos de pagamento:", error);
          notify.error("Erro ao salvar métodos de pagamento.");
        }
        if (showLogo && logoFile) {
          try {
            console.log("[checkout] Upload logo:", {
              productId,
              checkoutId: targetCheckoutId,
              file: logoFile?.name,
            });
            const uploadResponse = await productApi.uploadCheckoutAsset(
              productId,
              targetCheckoutId,
              "logo",
              logoFile,
              token
            );
            const uploadedUrl = resolveUploadedUrl(uploadResponse, "logo");
            if (uploadedUrl) {
              setLogoPreview(buildStoredPreview(uploadedUrl, "Logo cadastrada"));
              setLogoDataUrl(null);
              setLogoFile(null);
            }
          } catch (error) {
            console.error("Erro ao enviar logo:", error);
            notify.error("Erro ao enviar logo.");
          }
        }
        if (showBanner && bannerFile) {
          try {
            console.log("[checkout] Upload banner:", {
              productId,
              checkoutId: targetCheckoutId,
              file: bannerFile?.name,
            });
            const uploadResponse = await productApi.uploadCheckoutAsset(
              productId,
              targetCheckoutId,
              "banner",
              bannerFile,
              token
            );
            const uploadedUrl = resolveUploadedUrl(uploadResponse, "banner");
            if (uploadedUrl) {
              setBannerPreview(buildStoredPreview(uploadedUrl, "Banner cadastrado"));
              setBannerDataUrl(null);
              setBannerFile(null);
            }
          } catch (error) {
            console.error("Erro ao enviar banner:", error);
            notify.error("Erro ao enviar banner.");
          }
        }
      }
      if (reviewsEnabled && targetCheckoutId) {
        const newTestimonials = testimonials.filter(item => !item.id);
        if (newTestimonials.length > 0) {
                  const created = await Promise.all(
                    newTestimonials.map(item =>
                      productApi.createCheckoutDepoiment(
                        productId,
                        targetCheckoutId,
                        {
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
          await Promise.all(
            newTestimonials.map(async (item, index) => {
              const depoimentId = (created[index] as { id?: string } | undefined)?.id;
              if (!depoimentId || !item.imageFile) return;
              try {
                console.log("[checkout] Upload imagem depoimento (create):", {
                  productId,
                  checkoutId: targetCheckoutId,
                  depoimentId,
                  file: item.imageFile?.name,
                });
                const uploadResponse = await productApi.uploadCheckoutDepoimentImage(
                  productId,
                  targetCheckoutId,
                  depoimentId,
                  item.imageFile,
                  token
                );
                const uploadedUrl = resolveUploadedImageUrl(uploadResponse);
                if (uploadedUrl) {
                  if (item.image?.startsWith("blob:")) {
                    URL.revokeObjectURL(item.image);
                  }
                  setTestimonials(prev =>
                    prev.map(testimonial =>
                      testimonial.id === depoimentId ? { ...testimonial, image: uploadedUrl, imageFile: null } : testimonial
                    )
                  );
                }
              } catch (error) {
                console.error("Erro ao enviar imagem do depoimento:", error);
                notify.error("Erro ao enviar imagem do depoimento.");
              }
            })
          );
        }
      }
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Erro ao salvar checkout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    if (onBack) {
      onBack();
    }
  }, [onClose, onBack]);

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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,470px)_1fr]">
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <input
                  className={fieldClass}
                  placeholder={checkoutId ? currentCheckoutName || "Checkout" : "Digite um nome"}
                  value={checkoutName}
                  onChange={event => setCheckoutName(event.target.value)}
                />
              </div>
              <RequiredFieldsSection
                requiredAddress={requiredAddress}
                setRequiredAddress={setRequiredAddress}
                requiredPhone={requiredPhone}
                setRequiredPhone={setRequiredPhone}
                requiredBirthdate={requiredBirthdate}
                setRequiredBirthdate={setRequiredBirthdate}
                requiredDocument={requiredDocument}
                setRequiredDocument={setRequiredDocument}
                requiredEmailConfirmation={requiredEmailConfirmation}
                setRequiredEmailConfirmation={setRequiredEmailConfirmation}
              />

              <VisualSection
                showLogo={showLogo}
                setShowLogo={setShowLogo}
                logoInputRef={logoInputRef}
                logoPreview={logoPreview}
                logoPreviewImageSrc={logoPreviewImageSrc}
                onLogoChange={handleLogoChange}
                onRemoveLogo={handleRemoveLogo}
                logoPosition={logoPosition}
                setLogoPosition={setLogoPosition}
                showBanner={showBanner}
                setShowBanner={setShowBanner}
                bannerInputRef={bannerInputRef}
                bannerPreview={bannerPreview}
                bannerPreviewImageSrc={bannerPreviewImageSrc}
                onBannerChange={handleBannerChange}
                onRemoveBanner={handleRemoveBanner}
                theme={theme}
                setTheme={setTheme}
                setAccentColor={setAccentColor}
              />
            </div>

            <div className="space-y-2">
              <PreviewSection
                theme={theme}
                showLogo={showLogo}
                showBanner={showBanner}
                previewLogoSrc={previewLogoSrc}
                previewBannerSrc={previewBannerSrc}
                logoPosition={logoPosition}
                reviewsEnabled={reviewsEnabled}
                requiredAddress={requiredAddress}
                requiredPhone={requiredPhone}
                requiredBirthdate={requiredBirthdate}
                requiredDocument={requiredDocument}
                countdownEnabled={countdownEnabled}
                accentColor={accentColor}
                counterBgColor={counterBgColor}
                counterTextColor={counterTextColor}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </div>
          </div>

          <div className="space-y-3 w-full max-w-[450px]">
            <PaymentsSection
              acceptedDocuments={acceptedDocuments}
              setAcceptedDocuments={setAcceptedDocuments}
              paymentMethods={paymentMethods}
              setPaymentMethods={setPaymentMethods}
              couponEnabled={couponEnabled}
              setCouponEnabled={setCouponEnabled}
              discountCard={discountCard}
              setDiscountCard={setDiscountCard}
              discountPix={discountPix}
              setDiscountPix={setDiscountPix}
              discountBoleto={discountBoleto}
              setDiscountBoleto={setDiscountBoleto}
              installmentsLimit={installmentsLimit}
              setInstallmentsLimit={setInstallmentsLimit}
              installmentsPreselected={installmentsPreselected}
              setInstallmentsPreselected={setInstallmentsPreselected}
              boletoDueDays={boletoDueDays}
              setBoletoDueDays={setBoletoDueDays}
              pixExpireMinutes={pixExpireMinutes}
              setPixExpireMinutes={setPixExpireMinutes}
              showSellerDetail={showSellerDetail}
              setShowSellerDetail={setShowSellerDetail}
              requiredAddress={requiredAddress}
              setRequiredAddress={setRequiredAddress}
            />

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
                      value={socialProofMessage}
                      onChange={event => setSocialProofMessage(event.target.value)}
                    />
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-sm font-semibold text-foreground">Mínimo de visitantes</p>
                  <input
                    className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="15 visitantes"
                    value={socialProofMinClient}
                    onChange={event => setSocialProofMinClient(event.target.value.replace(/[^\d]/g, ""))}
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
                                  setTestimonialImageFile(null);
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
                              <img
                                src={item.image}
                                alt={item.name || "Depoimento"}
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
                              <img
                                src={testimonialDraft.image}
                                alt="Preview depoimento"
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
                                imageFile: testimonialImageFile ?? undefined,
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
                                        name: nextItem.name,
                                        depoiment: nextItem.text,
                                        active: nextItem.active,
                                        ratting: String(nextItem.rating ?? ""),
                                      },
                                      token
                                    );
                                    if (testimonialImageFile) {
                                      console.log("[checkout] Upload imagem depoimento (update):", {
                                        productId,
                                        checkoutId,
                                        depoimentId: current.id,
                                        file: testimonialImageFile?.name,
                                      });
                                      const uploadResponse = await productApi.uploadCheckoutDepoimentImage(
                                        productId,
                                        checkoutId,
                                        current.id,
                                        testimonialImageFile,
                                        token
                                      );
                                      const uploadedUrl = resolveUploadedImageUrl(uploadResponse);
                                      if (uploadedUrl) {
                                        if (nextItem.image?.startsWith("blob:")) {
                                          URL.revokeObjectURL(nextItem.image);
                                        }
                                        nextItem.image = uploadedUrl;
                                      }
                                    }
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
                              setTestimonialImageFile(null);
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
                  <input
                    className={fieldClass}
                    placeholder="Agradecemos pela sua compra!"
                    value={afterSaleTitle}
                    onChange={event => setAfterSaleTitle(event.target.value)}
                  />
                </label>
                <label className="space-y-1 text-xs text-muted-foreground">
                  <span>Descritivo</span>
                  <textarea
                    className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Você receberá um e-mail confirmando o seu pedido."
                    value={afterSaleMessage}
                    onChange={event => setAfterSaleMessage(event.target.value)}
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

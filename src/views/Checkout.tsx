
'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, CreditCard, Lock, ShieldCheck, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Checkout, Product, ProductCoupon, ProductOffer } from "@/lib/api";
import { formatDocument, formatPhone, formatCardNumber, formatCardExpiry } from "@/lib/utils/formatters";

const paymentButtons = [
  { id: "pix", label: "Pix", iconSrc: "/images/pix.svg" },
  { id: "card", label: "Cartão", iconSrc: "/images/card.svg" },
  { id: "boleto", label: "Boleto", iconSrc: "/images/boleto.svg" },
];

const paymentMethodMap: Record<string, "credit_card" | "pix" | "ticket"> = {
  card: "credit_card",
  pix: "pix",
  boleto: "ticket",
};

type Props = {
  checkout?: Checkout | null;
  product?: Product | null;
  offer?: ProductOffer | null;
  offerId?: string;
  productId?: string;
  publicApiBase?: string;
};

export default function Checkout({ checkout, product, offer, offerId, productId, publicApiBase }: Props) {
  const router = useRouter();
  const accent = checkout?.defaultColor || "#0f864b";
  const title = product?.name || checkout?.name || "Produto";
  const showCountdown = Boolean(checkout?.countdown_active && checkout?.countdown);
  const showLogo = Boolean(checkout?.logo);
  const showBanner = Boolean(checkout?.banner);
  const logoPosition = (checkout?.position_logo as "left" | "center" | "right") || "left";
  const logoPositionClass =
    logoPosition === "center"
      ? "left-1/2 -translate-x-1/2"
      : logoPosition === "right"
      ? "right-4 sm:right-6"
      : "left-4 sm:left-6";
  const toBoolean = (value: unknown) =>
    value === true || value === "true" || value === 1 || value === "1";
  const pick = <T,>(...values: Array<T | null | undefined>) =>
    values.find(value => value !== undefined && value !== null);
  const toNumber = (value: unknown): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };
  const toText = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;
  const rawCheckout = checkout as Record<string, unknown> | null | undefined;
  const paymentData = rawCheckout?.productCheckoutPayment as Record<string, unknown> | undefined;
  const rawProduct = product as Record<string, unknown> | null | undefined;
  const coupons = useMemo(() => {
    const rawCoupons = rawProduct?.coupons;
    if (!Array.isArray(rawCoupons)) return [] as ProductCoupon[];
    return rawCoupons.map(item => {
      const data = item as Record<string, unknown>;
      return {
        id: toText(data.id) ?? "",
        internal_name: toText(data.internalName ?? data.internal_name),
        coupon_code: toText(data.couponCode ?? data.coupon_code ?? data.code),
        discount_amount: toNumber(data.discountAmount ?? data.discount_amount ?? data.discount),
        is_percentage: toBoolean(data.isPercentage ?? data.is_percentage),
        minimum_purchase_amount: toNumber(
          data.minimumPurchaseAmount ?? data.minimum_purchase_amount
        ),
        limit_usage: toNumber(data.limitUsage ?? data.limit_usage),
        expires_at: toText(data.expiresAt ?? data.expires_at),
        status: toText(data.status),
        name: toText(data.name),
      } satisfies ProductCoupon;
    });
  }, [rawProduct]);
  const acceptDocumentIndividual = toBoolean(
    paymentData?.acceptDocumentIndividual ?? paymentData?.accept_document_individual
  );
  const acceptDocumentCompany = toBoolean(
    paymentData?.acceptDocumentCompany ?? paymentData?.accept_document_company
  );
  const showEmailConfirmation =
    checkout?.required_email_confirmation ??
    toBoolean(rawCheckout?.requiredEmailConfirmation) ??
    false;
  const rawCountdownExpire = pick(
    checkout?.countdown_expire,
    rawCheckout?.countdownExpire,
    rawCheckout?.countdown_expire
  );
  const countdownMinutes = toNumber(rawCountdownExpire);
  const countdownActiveMessage =
    toText(rawCheckout?.countdown_message_active) ??
    toText(rawCheckout?.countdownMessageActive) ??
    toText(rawCheckout?.countdown_message) ??
    toText(rawCheckout?.countdownMessage) ??
    checkout?.after_sale_title ??
    "Tempo limitado";
  const countdownExpiredMessage =
    toText(rawCheckout?.countdown_message_expired) ??
    toText(rawCheckout?.countdownMessageExpired) ??
    checkout?.after_sale_message ??
    "Tempo esgotado.";
  const acceptAnyDocument = acceptDocumentIndividual || acceptDocumentCompany;
  const showDocument = Boolean(
    checkout?.required_document ??
      toBoolean(rawCheckout?.requiredDocument) ??
      acceptAnyDocument
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showBirthdate =
    checkout?.required_birthdate ??
    toBoolean(rawCheckout?.requiredBirthdate) ??
    false;
  const showPhone =
    checkout?.required_phone ??
    toBoolean(rawCheckout?.requiredPhone) ??
    false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showAddress =
    checkout?.required_address ??
    toBoolean(rawCheckout?.requiredAddress) ??
    toBoolean(paymentData?.requireAddress ?? paymentData?.require_address) ??
    false;
  const testimonials = useMemo(
    () => (checkout?.testimonials ?? []).filter(item => item.active !== false),
    [checkout?.testimonials]
  );
  const showTestimonials = Boolean(checkout?.testimonials_enabled && testimonials.length > 0);
  const isDark = (checkout?.theme || "dark") === "dark";
  const background = isDark ? "#060606" : "#f6f6f6";
  const cardBg = isDark ? "#0b0b0b" : "#ffffff";
  const textPrimary = isDark ? "text-white" : "text-[#0a0a0a]";
  const subCardBg = isDark ? "#0e0e0e" : "#f3f3f3";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const offerType = offer?.type?.toLowerCase();
  const plan = offer?.subscription_plan as
    | {
        normal_price?: number;
        discount_price?: number;
        plan_price?: number;
        price_first_cycle?: number;
        normalPrice?: number;
        discountPrice?: number;
        planPrice?: number;
        priceFirstCycle?: number;
      }
    | undefined;
  const planNormal =
    plan?.normal_price ?? plan?.normalPrice ?? plan?.plan_price ?? plan?.planPrice ?? plan?.price_first_cycle ?? plan?.priceFirstCycle;
  const planPromo = plan?.discount_price ?? plan?.discountPrice;
  const offerBasePrice = offer?.offer_price ?? (offer?.free ? 0 : undefined);
  const formatBRL = (value: number) =>
    Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const hasOrderBumps = Boolean(offer?.order_bumps?.length);
  const productPriceValue =
    offer?.free
      ? 0
      : offerType === "subscription"
      ? Number(planPromo ?? planNormal ?? offerBasePrice ?? 0)
      : Number(offerBasePrice ?? 0);
  const productPriceLabel = offer?.free
    ? "Gratuito"
    : Number.isFinite(productPriceValue)
    ? formatBRL(productPriceValue)
    : "R$ 0,00";
  const availablePaymentMethods = useMemo(() => {
    const methods = checkout?.payment_methods;
    if (methods && methods.length > 0) return methods;
    const fallback: Array<"card" | "pix" | "boleto"> = [];
    const acceptCreditCard = toBoolean(paymentData?.acceptCreditCard ?? paymentData?.accept_credit_card);
    const acceptPix = toBoolean(paymentData?.acceptPix ?? paymentData?.accept_pix);
    const acceptTicket = toBoolean(paymentData?.acceptTicket ?? paymentData?.accept_ticket);
    if (acceptCreditCard) fallback.push("card");
    if (acceptPix) fallback.push("pix");
    if (acceptTicket) fallback.push("boleto");
    return fallback.length ? fallback : ["card", "pix", "boleto"];
  }, [checkout?.payment_methods, paymentData]);
  const [paymentMethod, setPaymentMethod] = useState<string>(availablePaymentMethods[0] ?? "card");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    if (!showCountdown) return 0;
    if (typeof countdownMinutes === "number" && Number.isFinite(countdownMinutes)) {
      return Math.max(0, Math.floor(countdownMinutes * 60));
    }
    return 0;
  });
  useEffect(() => {
    setPaymentMethod(prev =>
      availablePaymentMethods.includes(prev) ? prev : availablePaymentMethods[0] ?? "card"
    );
  }, [availablePaymentMethods]);

  useEffect(() => {
    if (!showCountdown) return;
    if (typeof countdownMinutes === "number" && Number.isFinite(countdownMinutes)) {
      setCountdownSeconds(Math.max(0, Math.floor(countdownMinutes * 60)));
    }
  }, [showCountdown, countdownMinutes]);

  useEffect(() => {
    if (!showCountdown) return;
    if (countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showCountdown, countdownSeconds]);

  const formatCountdown = (totalSeconds: number) => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState<Record<string, boolean>>({});
  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const visiblePaymentButtons = useMemo(
    () => paymentButtons.filter(button => availablePaymentMethods.includes(button.id)),
    [availablePaymentMethods]
  );
  const inputClass = `
    h-10 w-full rounded-[6px] px-3 text-sm focus:outline-none
    ${isDark ? "border border-white/10 bg-[#0b0b0b] text-white placeholder:text-neutral-500" : "border border-black/10 bg-white text-[#0a0a0a] placeholder:text-neutral-500"}
  `;
  const resolveAssetUrl = (src?: string | null) => {
    if (!src) return undefined;
    const trimmed = src.trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const base = (publicApiBase ?? process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? "").replace(/\/$/, "");
    if (trimmed.startsWith("/")) {
      return base && /^https?:\/\//i.test(base) ? `${base}${trimmed}` : trimmed;
    }
    return base && /^https?:\/\//i.test(base) ? `${base}/${trimmed}` : `/${trimmed}`;
  };

  const resolveTestimonialImage = (
    item: NonNullable<Checkout["testimonials"]>[number]
  ) => {
    const raw = item as Record<string, unknown>;
    const candidate =
      item.image ||
      item.avatar ||
      (typeof raw.image_url === "string" ? raw.image_url : undefined) ||
      (typeof raw.imageUrl === "string" ? raw.imageUrl : undefined) ||
      (typeof raw.avatar_url === "string" ? raw.avatar_url : undefined) ||
      (typeof raw.avatarUrl === "string" ? raw.avatarUrl : undefined);
    return resolveAssetUrl(candidate);
  };

  const [formState, setFormState] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    emailConfirm: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardInstallments: "1",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<ProductCoupon | null>(null);

  const [emailError, setEmailError] = useState(false);

  // Update effect to check email match
  useEffect(() => {
    if (showEmailConfirmation && formState.email && formState.emailConfirm) {
      setEmailError(formState.email !== formState.emailConfirm);
    } else {
      setEmailError(false);
    }
  }, [formState.email, formState.emailConfirm, showEmailConfirmation]);

  useEffect(() => {
    if (!availablePaymentMethods.length) return;
    setPaymentMethod(prev =>
      availablePaymentMethods.includes(prev) ? prev : availablePaymentMethods[0]
    );
  }, [availablePaymentMethods]);

  useEffect(() => {
    if (!offer?.order_bumps?.length) return;
    const nextSelected: Record<string, boolean> = {};
    offer.order_bumps.forEach(bump => {
      if (bump.id) {
        nextSelected[bump.id] = true;
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSelectedBumps(nextSelected);
  }, [offer?.order_bumps]);

  useEffect(() => {
    setBannerFailed(false);
  }, [checkout?.banner]);

  useEffect(() => {
    setLogoFailed(false);
  }, [checkout?.logo]);

  const bannerSrc = resolveAssetUrl(checkout?.banner);
  const logoSrc = resolveAssetUrl(checkout?.logo);

  const couponEnabled = toBoolean(paymentData?.acceptCoupon ?? paymentData?.accept_coupon);
  const selectedBumpsTotal = useMemo(() => {
    if (!offer?.order_bumps?.length) return 0;
    return offer.order_bumps.reduce((sum, bump) => {
      if (!bump.id || !selectedBumps[bump.id]) return sum;
      const value = Number(bump.offer_price ?? bump.price ?? 0);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
  }, [offer?.order_bumps, selectedBumps]);
  const subtotalValue = productPriceValue + selectedBumpsTotal;
  const paymentDiscountLine = useMemo(() => {
    const rawDetail = (paymentData?.detailDiscount ?? paymentData?.detail_discount) as
      | Record<string, unknown>
      | undefined;
    if (!rawDetail) return null;
    const methodKey = paymentMethod === "card" ? "card" : paymentMethod === "pix" ? "pix" : "boleto";
    const percent = toNumber(rawDetail[methodKey]);
    if (!percent || percent <= 0) return null;
    const label =
      paymentMethod === "card"
        ? "Cartão de crédito"
        : paymentMethod === "pix"
        ? "Pix"
        : "Boleto";
    const value = (subtotalValue * percent) / 100;
    return {
      id: `payment-${methodKey}`,
      label: `Desconto ${label} (${percent}%)`,
      value: Math.max(0, value),
    };
  }, [paymentData, paymentMethod, subtotalValue]);
  const couponDiscountLine = useMemo(() => {
    if (!couponEnabled || !appliedCoupon) return null;
    const discountValue = Number(appliedCoupon.minimum_purchase_amount ?? 0);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return null;
    }
    const label = appliedCoupon.coupon_code ? `CUPOM: ${appliedCoupon.coupon_code}` : "Desconto";
    return {
      id: appliedCoupon.id,
      label,
      value: Math.max(0, discountValue),
    };
  }, [couponEnabled, appliedCoupon]);
  const discountLines = useMemo(() => {
    const lines: Array<{ id: string; label: string; value: number; code?: string }> = [];
    if (paymentDiscountLine) lines.push(paymentDiscountLine);
    if (couponDiscountLine) lines.push(couponDiscountLine);
    return lines;
  }, [paymentDiscountLine, couponDiscountLine]);
  const totalDiscount = discountLines.reduce((sum, item) => sum + item.value, 0);
  const totalValue = Math.max(0, subtotalValue - totalDiscount);
  const selectedBumpLines = useMemo(() => {
    if (!offer?.order_bumps?.length) return [] as Array<{ id: string; label: string; value: number }>;
    return offer.order_bumps
      .filter(bump => bump.id && selectedBumps[bump.id])
      .map(bump => ({
        id: bump.id as string,
        label: bump.title ? `Order Bump - ${bump.title}` : "Order Bump",
        value: Number(bump.offer_price ?? bump.price ?? 0),
      }));
  }, [offer?.order_bumps, selectedBumps]);


  const handleInputChange = (field: keyof typeof formState, value: string) => {
    let formattedValue = value;

    if (field === "document") formattedValue = formatDocument(value);
    if (field === "phone") formattedValue = formatPhone(value);
    if (field === "cardNumber") formattedValue = formatCardNumber(value);
    if (field === "cardExpiry") formattedValue = formatCardExpiry(value);

    setFormState(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleApplyCoupon = () => {
    if (!couponEnabled) return;
    const code = couponCode.trim();
    if (!code) {
      setAppliedCoupon(null);
      setCouponError(null);
      return;
    }
    const found = coupons.find(coupon => {
      const status = coupon.status?.toLowerCase();
      if (status && status !== "active") return false;
      return (coupon.coupon_code ?? "").toLowerCase() === code.toLowerCase();
    });
    if (!found) {
      setAppliedCoupon(null);
      setCouponError("Cupom não aceito");
      return;
    }
    setAppliedCoupon(found);
    setCouponError(null);
  };

  const handleConfirmPayment = async () => {
    if (!offerId || !productId) return;
    if (showEmailConfirmation && emailError) {
      alert("Os e-mails não conferem. Por favor, verifique.");
      return;
    }

    const baseUrl = publicApiBase ?? "";
    setSubmittingPayment(true);
    try {
      const bumpsPayload = offer?.order_bumps
        ? offer.order_bumps
            .map(bump => bump.id)
            .filter(id => id)
            .map(id => ({ id }))
          .filter(bump => bump.id && selectedBumps[bump.id]) 
        : [];

      const payload = {
        payment_method: paymentMethodMap[paymentMethod] ?? paymentMethodMap.card,
        offer_id: offerId,
        product_id: productId,
        customer: {
          name: formState.name,
          email: formState.email,
          document: formState.document.replace(/\D/g, ""), // Send unmasked
          phone: formState.phone.replace(/\D/g, ""),
        },
        credit_card: paymentMethod === 'card' ? {
          holder_name: formState.cardName,
          number: formState.cardNumber.replace(/\s/g, ""),
          expiry_month: formState.cardExpiry.split('/')[0],
          expiry_year: formState.cardExpiry.split('/')[1],
          ccv: formState.cardCvv,
          installments: Number(formState.cardInstallments) || 1
        } : undefined,
        ...(bumpsPayload.length ? { bumps: bumpsPayload } : {}),
      };
      console.log("[publicCheckout] Enviando pagamento:", payload);
      const response = await fetch(`${baseUrl}/public/sale/${offerId}/product/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      console.log("[publicCheckout] Resposta do pagamento:", { status: response.status, data });
      if (response.ok) {
        const priceValue = totalValue;
        const params = new URLSearchParams({
          product: title,
          price: Number.isFinite(priceValue) ? String(priceValue) : "0",
          method: paymentMethodMap[paymentMethod] ?? paymentMethodMap.card,
          image: product?.image_url || "/images/produto.png",
          theme: isDark ? "dark" : "light",
        });
        router.push(`/pagamento-confirmado?${params.toString()}`);
      } else {
        alert("Erro ao processar pagamento: " + (data?.message || "Tente novamente"));
      }
    } catch (error) {
      console.error("[publicCheckout] Erro ao confirmar pagamento:", error);
      alert("Erro de conexão ao processar pagamento.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: background }}>
      {showCountdown ? (
        <header
          className="flex items-center justify-between gap-4 px-4 py-4 text-xl font-semibold sm:px-8"
          style={{ backgroundColor: checkout?.countdown_background || accent }}
        >
          <span className="tracking-tight">
            {countdownSeconds > 0 ? formatCountdown(countdownSeconds) : "00:00:00"}
          </span>
          <CheckCircle2 className="h-10 w-10" />
          <span className="text-sm sm:text-base" style={{ color: checkout?.countdown_text_color || "#fff" }}>
            {countdownSeconds > 0 ? countdownActiveMessage : countdownExpiredMessage}
          </span>
        </header>
      ) : (
        <div className="h-4" />
      )}

      {showBanner ? (
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <div className="relative mb-12 sm:mb-16">
            <div className="h-[88px] w-full sm:h-[110px] lg:h-[140px]">
            {bannerSrc && !bannerFailed ? (
              <img
                src={bannerSrc}
                alt="Banner"
                className="h-full w-full rounded-[14px] object-cover"
                onError={() => setBannerFailed(true)}
              />
            ) : (
              <div
                className="h-full w-full rounded-[14px] border"
                style={{ backgroundColor: subCardBg, borderColor }}
              />
            )}
            </div>
            {showLogo && (
              <div className={`absolute bottom-0 ${logoPositionClass} translate-y-1/2`}>
                <div
                  className="h-14 w-14 overflow-hidden rounded-full border shadow-[0_10px_24px_rgba(0,0,0,0.25)] sm:h-16 sm:w-16"
                  style={{ backgroundColor: cardBg, borderColor }}
                >
                  {logoSrc && !logoFailed ? (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="h-full w-full object-cover"
                      onError={() => setLogoFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-xs text-muted-foreground">
                      Logo
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showLogo ? (
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-6">
          <div className="h-12 w-12 overflow-hidden rounded-full border" style={{ borderColor }}>
            {logoSrc && !logoFailed ? (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-full w-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-foreground/10 text-[10px] text-muted-foreground">
                Logo
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <p className={`text-sm ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>Checkout</p>
            <p className={`text-lg font-semibold ${textPrimary}`}>{checkout?.name || "Checkout"}</p>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-[1180px] px-4 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-5 lg:col-start-1">
              <div className="rounded-[10px] border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className={`flex items-center gap-3 px-5 pt-5 text-lg font-semibold ${textPrimary}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/20 text-sm">
                    1
                  </span>
                  <p>Identificação</p>
                </div>
                <div className="p-5 pt-3 space-y-6">
                  <label className="flex flex-col gap-2 text-xs text-neutral-400">
                    <span>Nome e sobrenome</span>
                    <input
                      className={inputClass}
                      placeholder="Digite seu nome completo"
                      value={formState.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {showDocument && (
                      <label className="flex flex-col gap-2 text-xs text-neutral-400">
                        <span>CPF/CNPJ</span>
                        <input
                          className={inputClass}
                          placeholder="000.000.000-00"
                          value={formState.document}
                          onChange={(e) => handleInputChange('document', e.target.value)}
                          maxLength={18}
                        />
                      </label>
                    )}
                    {showPhone && (
                      <label className="flex flex-col gap-2 text-xs text-neutral-400">
                        <span>Celular</span>
                        <input
                          className={inputClass}
                          placeholder="(00) 00000-0000"
                          value={formState.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          maxLength={15}
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={`flex flex-col gap-2 text-xs text-neutral-400 ${showEmailConfirmation ? '' : 'col-span-2'}`}>
                      <span>E-mail</span>
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="seu@email.com"
                        value={formState.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </label>
                    {showEmailConfirmation && (
                      <label className="flex flex-col gap-2 text-xs text-neutral-400">
                        <span>Confirmar e-mail</span>
                        <input
                          className={`${inputClass} ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                          type="email"
                          placeholder="Confirme seu e-mail"
                          value={formState.emailConfirm}
                          onChange={(e) => handleInputChange('emailConfirm', e.target.value)}
                        />
                        {emailError && <span className="text-red-500 text-[10px]">Os e-mails não conferem</span>}
                      </label>
                    )}
                  </div>

                </div>
              </div>

              <div className="rounded-[10px] border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className={`flex items-center gap-3 px-5 pt-5 text-lg font-semibold ${textPrimary}`}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-white/20 text-sm">
                    2
                  </span>
                  <p>Pagamento</p>
                </div>
                <div className="p-5 pt-3 space-y-6">
                  <div className="space-y-4">
                    <p className={`text-sm font-semibold ${textPrimary}`}>Forma de pagamento</p>
                    <div className="flex items-center gap-3">
                      {visiblePaymentButtons.map(button => {
                        const isSelected = paymentMethod === button.id;
                        return (
                          <button
                            key={button.id}
                            type="button"
                            className={`flex h-10 w-10 items-center justify-center rounded-[6px] border transition ${
                              isDark ? "border-white/20 bg-[#111] text-white" : "border-black/10 bg-white text-[#0a0a0a]"
                            } hover:border-emerald-500 ${isSelected ? "border-emerald-500 ring-2 ring-emerald-500/30" : ""}`}
                            aria-label={button.label}
                            onClick={() => setPaymentMethod(button.id)}
                          >
                            <img
                              src={button.iconSrc}
                              alt={button.label}
                              className="h-7 w-7 object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {paymentMethod === "card" && (
                      <>
                        <label className="flex flex-col gap-2 text-xs text-neutral-400">
                          <span>Nome do titular</span>
                          <input
                            className={inputClass}
                            placeholder="Como está no cartão"
                            value={formState.cardName}
                            onChange={(e) => handleInputChange('cardName', e.target.value)}
                          />
                        </label>

                        <label className="flex flex-col gap-2 text-xs text-neutral-400">
                          <span>Número do cartão</span>
                          <div className="relative">
                            <input
                              className={`${inputClass} pr-10`}
                              placeholder="0000 0000 0000 0000"
                              value={formState.cardNumber}
                              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                              maxLength={19}
                            />
                            <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                          </div>
                        </label>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="flex flex-col gap-2 text-xs text-neutral-400">
                            <span>Vencimento</span>
                            <input
                              className={inputClass}
                              placeholder="MM/AA"
                              value={formState.cardExpiry}
                              onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                              maxLength={5}
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-xs text-neutral-400">
                            <span>CVV</span>
                            <input
                              className={inputClass}
                              placeholder="123"
                              value={formState.cardCvv}
                              onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                              maxLength={4}
                            />
                          </label>
                          <label className="flex flex-col gap-2 text-xs text-neutral-400">
                            <span>Parcelamento</span>
                            <select
                              className={inputClass}
                              value={formState.cardInstallments}
                              onChange={(e) => handleInputChange('cardInstallments', e.target.value)}
                            >
                              <option value="1">1x R$ {productPriceValue.toFixed(2)}</option>
                              {/* Future: Generate installments dynamically based on config */}
                            </select>
                          </label>
                        </div>
                      </>
                    )}
                    {paymentMethod === "pix" && (
                      <div
                        className="flex flex-col items-center gap-3 rounded-[10px] border px-4 py-5"
                        style={{ backgroundColor: subCardBg, borderColor }}
                      >
                        <div className="text-center text-sm text-muted-foreground p-4">
                          QR Code será gerado após confirmar.
                        </div>
                      </div>
                    )}
                    {paymentMethod === "boleto" && (
                      <div
                        className="rounded-[10px] border px-4 py-4 text-xs"
                        style={{ backgroundColor: subCardBg, borderColor, color: isDark ? "#a1a1aa" : "#4b5563" }}
                      >
                        Boleto será gerado após confirmar.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="space-y-4 lg:col-start-2">
              <div className="rounded-[10px] border p-4" style={{ backgroundColor: cardBg, borderColor }}>
                <div className="flex items-center gap-3">
                  <img
                    src={product?.image_url || "/images/produto.png"}
                    alt={title}
                    className="h-16 w-16 rounded-[10px] object-cover"
                  />
                  <div className="flex flex-col">
                    <span className={`text-xs uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Produto
                    </span>
                    <p className={`text-base font-semibold ${textPrimary}`}>{title}</p>
                    <span className={`text-sm ${textPrimary}`}>{productPriceLabel}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[10px] border p-4 space-y-4" style={{ backgroundColor: cardBg, borderColor }}>
                {[
                  { icon: ShieldCheck, title: "Dados protegidos", desc: "Suas informações são confidenciais e seguras" },
                  { icon: Lock, title: "Pagamento 100% Seguro", desc: "Todas as transações são criptografadas" },
                  { icon: Check, title: "Conteúdo Aprovado", desc: "Revisado e validado por especialistas" },
                  { icon: CheckCircle2, title: "Garantia de 7 dias", desc: "Você tem 7 dias para testar o produto" },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-0.5 text-emerald-400">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                      <p className={`text-sm font-semibold ${textPrimary}`}>{item.title}</p>
                      <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {showTestimonials ? (
                <div className="rounded-[10px] border p-4 space-y-6" style={{ backgroundColor: cardBg, borderColor }}>
                  <div className="space-y-3">
                    <p className={`text-lg font-semibold ${textPrimary}`}>Depoimentos</p>
                    <div className="flex flex-col gap-3">
                      {testimonials.map((item, idx) => (
                        <div
                          key={item.id ?? idx}
                          className="space-y-2 rounded-[10px] border border-white/10 p-3"
                          style={{ backgroundColor: subCardBg }}
                        >
                          <div className="flex items-center gap-3">
                            {resolveTestimonialImage(item) ? (
                              <img
                                src={resolveTestimonialImage(item) || "/images/produto.png"}
                                alt={item.name || "Depoimento"}
                                className="h-14 w-14 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/70" />
                            )}
                            <div className="flex flex-col gap-1">
                              <p className={`text-sm font-semibold ${textPrimary}`}>{item.name || "Nome e sobrenome"}</p>
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const ratingValue = Number(item.rating ?? 0);
                                  const isFilled = i < ratingValue;
                                  return (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        isFilled
                                          ? "text-[#f5c542] fill-[#f5c542]"
                                          : "text-muted-foreground/60 fill-transparent"
                                      }`}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <p className={`text-sm leading-relaxed ${isDark ? "text-neutral-300" : "text-neutral-700"}`}>
                            {item.text || checkout?.social_proofs_message || "Depoimento do cliente vai aqui."}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-5 lg:col-start-1">
              {hasOrderBumps && (
                <div className="rounded-[10px] border" style={{ backgroundColor: cardBg, borderColor }}>
                  <div className={`px-5 pt-5 text-lg font-semibold ${textPrimary}`}>Order Bumps</div>
                  <div className="p-5 pt-3 space-y-3">
                    {offer?.order_bumps?.map((bump, idx) => {
                      const bumpPromoValue =
                        bump.offer_price ?? bump.price ?? (offerType === "subscription" ? planPromo : undefined);
                      const bumpNormalValue =
                        bump.normal_price ??
                        bump.offer_price ??
                        bump.price ??
                        (offerType === "subscription" ? planNormal ?? planPromo : undefined);
                      const bumpHasDiscount =
                        bumpNormalValue != null &&
                        bumpPromoValue != null &&
                        Number(bumpNormalValue) !== Number(bumpPromoValue);
                      const formattedNormal =
                        bumpNormalValue != null ? formatBRL(Number(bumpNormalValue)) : null;
                      const formattedPromo =
                        bumpPromoValue != null ? formatBRL(Number(bumpPromoValue)) : null;
                      return (
                        <label
                          key={bump.id ?? `${idx}-${bump.title}`}
                          className={`flex flex-col gap-3 rounded-[10px] border px-4 py-3 ${
                            isDark ? "border-white/10 bg-[#0b0b0b]" : "border-black/10 bg-white"
                          }`}
                        >
                          {bump.description && (
                            <p className={`text-center text-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                              {bump.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            {(() => {
                              const isChecked = Boolean(bump.id && selectedBumps[bump.id]);
                              return (
                                <input
                                  type="checkbox"
                                  className="ui-checkbox h-5 w-5"
                                  checked={isChecked}
                                  disabled
                                />
                              );
                            })()}
                            <img
                              src="/images/produto.png"
                              alt={bump.title || "Order bump"}
                              className="h-[56px] w-[56px] rounded-[10px] object-cover"
                            />
                            <div className="flex flex-col gap-1">
                              <p className={`text-sm font-semibold ${textPrimary}`}>{bump.title || "Order Bump"}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {Number(bumpPromoValue ?? 0) === 0 ? (
                                  <span className="text-emerald-400">Gratuito</span>
                                ) : bumpHasDiscount ? (
                                  <>
                                    <span className="text-rose-500">{formattedNormal}</span>
                                    <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>por apenas</span>
                                    <span className="text-emerald-400">{formattedPromo}</span>
                                  </>
                                ) : formattedNormal ? (
                                  <span className="text-emerald-400">{formattedNormal}</span>
                                ) : (
                                  <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>-</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-[10px] border" style={{ backgroundColor: cardBg, borderColor }}>
                <div className={`px-5 pt-5 text-lg font-semibold ${textPrimary}`}>Resumo</div>
                <div className="p-5 pt-4 text-sm space-y-4">
                  {couponEnabled && (
                    <div className="flex items-center gap-3">
                      <input
                        className={`${inputClass} h-11 flex-1`}
                        placeholder="Digite seu cupom"
                        value={couponCode}
                        onChange={event => {
                          setCouponCode(event.target.value);
                          setCouponError(null);
                          setAppliedCoupon(null);
                        }}
                      />
                      <button
                        type="button"
                        className={`h-11 rounded-[6px] border px-5 text-sm font-semibold ${
                          isDark ? "border-white/20 bg-[#121212] text-white" : "border-black/20 bg-white text-[#0a0a0a]"
                        }`}
                        onClick={handleApplyCoupon}
                      >
                        Aplicar
                      </button>
                      {couponError && <span className="text-xs text-rose-400 whitespace-nowrap">{couponError}</span>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                    <span>Produto</span>
                    <span className={textPrimary}>{formatBRL(productPriceValue)}</span>
                  </div>

                  {selectedBumpLines.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs">
                      {selectedBumpLines.map(line => (
                        <div key={line.id} className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                            {line.label}
                          </span>
                          <span className={textPrimary}>{formatBRL(line.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {discountLines.length > 0 && (
                    <div className="mt-3 space-y-2 text-xs">
                      {discountLines.map(line => (
                        <div key={line.id || line.label} className="flex items-center justify-between">
                          <span className={isDark ? "text-neutral-400" : "text-neutral-600"}>
                            {line.label}
                            {line.code ? ` (${line.code})` : ""}
                          </span>
                          <span className="text-emerald-400">- {formatBRL(line.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="relative pt-4">
                    <div
                      className="absolute -left-5 -right-5 top-0 border-t border-dashed"
                      style={{ borderColor }}
                    />
                    <span
                      className="absolute -left-8 top-0 h-6 w-6 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: background }}
                    />
                    <span
                      className="absolute -right-8 top-0 h-6 w-6 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: background }}
                    />
                    <div className="flex items-center justify-between text-base font-semibold">
                      <span className={textPrimary}>Total</span>
                      <span className={textPrimary}>{formatBRL(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-[6px] px-4 py-2.5 text-sm font-semibold uppercase tracking-tight text-white transition hover:brightness-110"
                style={{ backgroundColor: accent }}
                onClick={handleConfirmPayment}
                disabled={submittingPayment || !offerId || !productId}
              >
                {submittingPayment ? "Confirmando..." : "Confirmar pagamento"}
              </button>
            </div>
            <div className="hidden lg:block" />
          </div>
        </div>
      </main>
    </div>
  );
}

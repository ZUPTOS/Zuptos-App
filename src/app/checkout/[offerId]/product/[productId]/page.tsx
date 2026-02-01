'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type {
  Checkout as CheckoutType,
  Product,
  ProductOffer,
  PublicCheckoutOfferResponse,
} from "@/lib/api";
import Checkout from "@/views/Checkout";

const pick = <T,>(...values: Array<T | null | undefined>) =>
  values.find(value => value !== undefined && value !== null);

const toString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const normalizePublicAssetPath = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
};

const normalizeProduct = (raw?: PublicCheckoutOfferResponse["product"] | null): Product | null => {
  if (!raw) return null;
  const data = raw as unknown as Record<string, unknown>;
  return {
    id: toString(data.id) ?? "",
    name: toString(data.name) ?? "Produto",
    type: toString(data.type) ?? "service",
    image_url: toString(pick(data.image_url, data.imageUrl)),
    total_invoiced: toNumber(pick(data.total_invoiced, data.totalInvoiced)),
    total_sold: toNumber(pick(data.total_sold, data.totalSold)),
    description: toString(data.description),
    status: toString(data.status),
    category: toString(data.category),
    internal_description: toString(pick(data.internal_description, data.internalDescription)),
    sale_url: toString(pick(data.sale_url, data.saleUrl)),
    login_username: toString(pick(data.login_username, data.loginUsername)),
    login_password: toString(pick(data.login_password, data.loginPassword)),
    coupons: Array.isArray(data.coupons) ? (data.coupons as Product["coupons"]) : undefined,
  };
};

const normalizeCheckout = (
  raw?: PublicCheckoutOfferResponse["checkout"] | null
): CheckoutType | null => {
  if (!raw) return null;
  const data = raw as unknown as Record<string, unknown>;
  const base = raw as CheckoutType;
  const paymentData = (data.productCheckoutPayment as Record<string, unknown> | undefined) ?? undefined;
  const detailDiscount = (paymentData?.detailDiscount as Record<string, unknown> | undefined) ?? undefined;
  const detailPaymentMethod = (paymentData?.detailPaymentMethod as Record<string, unknown> | undefined) ?? undefined;
  const acceptedDocs: Array<"cpf" | "cnpj"> = [];
  if (toBoolean(paymentData?.acceptDocumentIndividual)) acceptedDocs.push("cpf");
  if (toBoolean(paymentData?.acceptDocumentCompany)) acceptedDocs.push("cnpj");
  const paymentMethods: Array<"card" | "boleto" | "pix"> = [];
  if (toBoolean(paymentData?.acceptCreditCard)) paymentMethods.push("card");
  if (toBoolean(paymentData?.acceptTicket)) paymentMethods.push("boleto");
  if (toBoolean(paymentData?.acceptPix)) paymentMethods.push("pix");
  return {
    ...base,
    logo: normalizePublicAssetPath(toString(pick(base.logo, data.logo))),
    banner: normalizePublicAssetPath(toString(pick(base.banner, data.banner))),
    required_address: pick(base.required_address, toBoolean(data.requiredAddress)),
    required_phone: pick(base.required_phone, toBoolean(data.requiredPhone)),
    required_birthdate: pick(base.required_birthdate, toBoolean(data.requiredBirthdate)),
    required_document: pick(base.required_document, toBoolean(data.requiredDocument)),
    required_email_confirmation: pick(
      base.required_email_confirmation,
      toBoolean(data.requiredEmailConfirmation)
    ),
    position_logo: pick(base.position_logo, toString(data.positionLogo)),
    default_color: pick(base.default_color, toString(data.defaultColor), toString(data.default_color)),
    defaultColor: pick(base.defaultColor, toString(data.defaultColor), toString(data.default_color)),
    countdown_active: pick(
      base.countdown_active,
      toBoolean(data.countdownActive),
      toBoolean(data["countdown active"])
    ),
    countdown_expire: pick(base.countdown_expire, toString(data.countdownExpire)),
    countdown_background: pick(
      base.countdown_background,
      toString(data.countdownBackground),
      toString(data.countdown_background)
    ),
    countdown_text_color: pick(
      base.countdown_text_color,
      toString(data.countdownTextColor),
      toString(data.countdown_text_color)
    ),
    social_proofs_message: pick(base.social_proofs_message, toString(data.socialProofsMessage)),
    social_proofs_min_client: pick(
      base.social_proofs_min_client,
      toNumber(data.socialProofsMinClient)
    ),
    after_sale_title: pick(base.after_sale_title, toString(data.afterSaleTitle)),
    after_sale_message: pick(base.after_sale_message, toString(data.afterSaleMessage)),
    accepted_documents: pick(
      base.accepted_documents,
      data.acceptedDocuments as CheckoutType["accepted_documents"],
      acceptedDocs.length ? acceptedDocs : undefined
    ),
    payment_methods: pick(
      base.payment_methods,
      data.paymentMethods as CheckoutType["payment_methods"],
      paymentMethods.length ? paymentMethods : undefined
    ),
    coupon_enabled: pick(base.coupon_enabled, toBoolean(data.couponEnabled)),
    discount_card: pick(
      base.discount_card,
      toNumber(data.discountCard),
      toNumber(detailDiscount?.card)
    ),
    discount_pix: pick(
      base.discount_pix,
      toNumber(data.discountPix),
      toNumber(detailDiscount?.pix)
    ),
    discount_boleto: pick(
      base.discount_boleto,
      toNumber(data.discountBoleto),
      toNumber(detailDiscount?.boleto)
    ),
    installments_limit: pick(
      base.installments_limit,
      toNumber(data.installmentsLimit),
      toNumber(detailPaymentMethod?.installments_limit)
    ),
    installments_preselected: pick(
      base.installments_preselected,
      toNumber(data.installmentsPreselected),
      toNumber(detailPaymentMethod?.installments_preselected)
    ),
    boleto_due_days: pick(
      base.boleto_due_days,
      toNumber(data.boletoDueDays),
      toNumber(detailPaymentMethod?.boleto_due_days)
    ),
    pix_expire_minutes: pick(
      base.pix_expire_minutes,
      toNumber(data.pixExpireMinutes),
      toNumber(detailPaymentMethod?.pix_expire_minutes)
    ),
    testimonials_enabled: pick(base.testimonials_enabled, toBoolean(data.testimonialsEnabled)),
    testimonials: pick(base.testimonials, data.testimonials as CheckoutType["testimonials"]),
    sales_notifications_enabled: pick(
      base.sales_notifications_enabled,
      toBoolean(data.salesNotificationsEnabled),
      toBoolean(data.sellNotification),
      toBoolean(data.sell_notification)
    ),
    sell_notification: pick(
      base.sell_notification,
      toBoolean(data.sellNotification),
      toBoolean(data.sell_notification)
    ),
    sell_time: pick(base.sell_time, toNumber(data.sellTime), toNumber(data.sell_time)),
    people_buy: pick(base.people_buy, toNumber(data.peopleBuy), toNumber(data.people_buy)),
    buy_now: pick(base.buy_now, toNumber(data.buyNow), toNumber(data.buy_now)),
    buy_at_thirty: pick(base.buy_at_thirty, toNumber(data.buyAtThirty), toNumber(data.buy_at_thirty)),
    buy_at_hour: pick(base.buy_at_hour, toNumber(data.buyAtHour), toNumber(data.buy_at_hour)),
    social_proof_enabled: pick(base.social_proof_enabled, toBoolean(data.socialProofEnabled)),
  };
};

const normalizeDepoiments = (items: unknown): NonNullable<CheckoutType["testimonials"]> => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const data = item as Record<string, unknown>;
    const rawImage = toString(pick(data.image, data.image_url, data.imageUrl));
    return {
      id: toString(data.id),
      name: toString(data.name) ?? "Nome",
      text: toString(pick(data.depoiment, data.text)) ?? "",
      rating: toNumber(pick(data.rating, data.ratting)),
      image: rawImage,
      active: pick(toBoolean(data.active), true),
    };
  });
};

const normalizeOrderBumps = (items: unknown): NonNullable<ProductOffer["order_bumps"]> => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
    const data = item as Record<string, unknown>;
    const bumpOffer = (pick(data.bumpedOfferShow, data.bumped_offer_show) ?? null) as
      | Record<string, unknown>
      | null;
    const bumpOfferPrice = bumpOffer
      ? toNumber(pick(bumpOffer.offerPrice, bumpOffer.offer_price, bumpOffer.price))
      : undefined;
    const bumpOfferNormal = bumpOffer
      ? toNumber(
          pick(
            bumpOffer.normalPrice,
            bumpOffer.normal_price,
            bumpOffer.price_before,
            bumpOffer.priceBefore
          )
        )
      : undefined;
    const promoPrice = toNumber(
      pick(
        data.offer_price,
        data.offerPrice,
        data.discount_price,
        data.discountPrice,
        data.promotional_price,
        data.promotionalPrice,
        data.price,
        bumpOfferPrice
      )
    );
    const normalPrice = toNumber(
      pick(
        data.normal_price,
        data.normalPrice,
        data.original_price,
        data.originalPrice,
        data.price_before,
        data.priceBefore,
        bumpOfferNormal
      )
    );
    return {
      id: toString(data.id),
      title: toString(data.title) ?? "Order Bump",
      description: toString(data.description),
      tag: toString(pick(data.tagDisplay, data.tag_display)),
      price: promoPrice ?? undefined,
      offer_price: promoPrice ?? undefined,
      normal_price: normalPrice ?? undefined,
    };
  });
};

const normalizeOffer = (
  raw: PublicCheckoutOfferResponse,
  checkout?: CheckoutType | null
): ProductOffer => {
  const data = raw as unknown as Record<string, unknown>;
  const offerPrice = toNumber(pick(data.offer_price, data.offerPrice));
  const orderBumps = normalizeOrderBumps(pick(data.productOfferBumps, data.order_bumps));
  const checkoutId = pick(toString(data.checkout_id), toString(data.checkoutId), checkout?.id);
  return {
    id: toString(data.id),
    name: toString(data.name) ?? checkout?.name ?? "Oferta",
    type: (toString(data.type) ?? "single_purchase") as ProductOffer["type"],
    status: toString(data.status) ?? "active",
    offer_price: offerPrice,
    free: toBoolean(data.free),
    back_redirect_url: toString(pick(data.back_redirect_url, data.backRedirectUrl)),
    next_redirect_url: toString(pick(data.next_redirect_url, data.nextRedirectUrl)),
    checkout_id: checkoutId,
    checkout: checkout ?? undefined,
    order_bumps: orderBumps.length ? orderBumps : undefined,
    subscription_plan: raw.plan ?? undefined,
  };
};

const resolvePublicApiBase = () => {
  if (typeof window !== "undefined") {
    // Client-side: always use relative path so Next.js proxy handles it
    return "";
  }

  const raw = process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  // Remove /api prefix if present
  const cleaned = raw.replace(/\/api/g, "");
  return cleaned.replace(/\/$/, "");
};

export default function PublicCheckoutPage() {
  const routeParams = useParams<{ productId?: string; offerId?: string }>();
  const productId = routeParams?.productId;
  const offerId = routeParams?.offerId;
  const [checkout, setCheckout] = useState<CheckoutType | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<ProductOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPublicCheckout = async (base: string, oId: string, pId: string) => {
    const baseUrl = base.replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/public/checkout/${oId}/product/${pId}`);
    if (!response.ok) {
      const err = new Error(`Public checkout failed: ${response.status}`);
      (err as { status?: number }).status = response.status;
      throw err;
    }
    return (await response.json()) as PublicCheckoutOfferResponse;
  };

  useEffect(() => {
    const loadCheckout = async () => {
      if (!productId || !offerId) return;
      setLoading(true);
      try {
        const baseUrl = resolvePublicApiBase();
        const data = await fetchPublicCheckout(baseUrl, offerId, productId);
        console.log("[publicCheckout] Dados carregados:", { productId, offerId, data });
        const normalizedCheckout = normalizeCheckout(data.checkout);
        const checkoutRecord = data.checkout as Record<string, unknown> | undefined;
        const rawDepoiments =
          (data as Record<string, unknown>).depoiments ??
          checkoutRecord?.productCheckoutDepoiments;
        const depoiments = normalizeDepoiments(rawDepoiments);
        const normalizedProduct = normalizeProduct(data.product);
        if (!normalizedCheckout) {
          setError("Checkout não encontrado");
          return;
        }
        setCheckout({
          ...normalizedCheckout,
          testimonials: depoiments.length ? depoiments : normalizedCheckout.testimonials,
          testimonials_enabled: depoiments.length ? true : normalizedCheckout.testimonials_enabled,
        });
        setProduct(normalizedProduct);
        setOffer(normalizeOffer(data, normalizedCheckout));
      } catch (err) {
        console.error("Erro ao carregar checkout público", err);
        setError("Checkout não encontrado");
      } finally {
        setLoading(false);
      }
    };
    void loadCheckout();
  }, [productId, offerId]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-red-500">{error}</div>;
  }

  if (loading || !checkout) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Carregando checkout...</div>;
  }

  return (
    <Checkout
      checkout={checkout}
      product={product}
      offer={offer}
      offerId={offerId}
      productId={productId}
      publicApiBase={resolvePublicApiBase()}
    />
  );
}

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

const toBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
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
  };
};

const normalizeCheckout = (
  raw?: PublicCheckoutOfferResponse["checkout"] | null
): CheckoutType | null => {
  if (!raw) return null;
  const data = raw as unknown as Record<string, unknown>;
  const base = raw as CheckoutType;
  return {
    ...base,
    required_address: pick(base.required_address, toBoolean(data.requiredAddress)),
    required_phone: pick(base.required_phone, toBoolean(data.requiredPhone)),
    required_birthdate: pick(base.required_birthdate, toBoolean(data.requiredBirthdate)),
    required_document: pick(base.required_document, toBoolean(data.requiredDocument)),
    required_email_confirmation: pick(
      base.required_email_confirmation,
      toBoolean(data.requiredEmailConfirmation)
    ),
    position_logo: pick(base.position_logo, toString(data.positionLogo)),
    countdown_active: pick(
      base.countdown_active,
      toBoolean(data.countdownActive),
      toBoolean(data["countdown active"])
    ),
    countdown_expire: pick(base.countdown_expire, toString(data.countdownExpire)),
    countdown_background: pick(base.countdown_background, toString(data.countdownBackground)),
    countdown_text_color: pick(base.countdown_text_color, toString(data.countdownTextColor)),
    social_proofs_message: pick(base.social_proofs_message, toString(data.socialProofsMessage)),
    social_proofs_min_client: pick(
      base.social_proofs_min_client,
      toNumber(data.socialProofsMinClient)
    ),
    after_sale_title: pick(base.after_sale_title, toString(data.afterSaleTitle)),
    after_sale_message: pick(base.after_sale_message, toString(data.afterSaleMessage)),
    accepted_documents: pick(
      base.accepted_documents,
      data.acceptedDocuments as CheckoutType["accepted_documents"]
    ),
    payment_methods: pick(
      base.payment_methods,
      data.paymentMethods as CheckoutType["payment_methods"]
    ),
    coupon_enabled: pick(base.coupon_enabled, toBoolean(data.couponEnabled)),
    discount_card: pick(base.discount_card, toNumber(data.discountCard)),
    discount_pix: pick(base.discount_pix, toNumber(data.discountPix)),
    discount_boleto: pick(base.discount_boleto, toNumber(data.discountBoleto)),
    installments_limit: pick(base.installments_limit, toNumber(data.installmentsLimit)),
    installments_preselected: pick(
      base.installments_preselected,
      toNumber(data.installmentsPreselected)
    ),
    testimonials_enabled: pick(base.testimonials_enabled, toBoolean(data.testimonialsEnabled)),
    testimonials: pick(base.testimonials, data.testimonials as CheckoutType["testimonials"]),
    sales_notifications_enabled: pick(
      base.sales_notifications_enabled,
      toBoolean(data.salesNotificationsEnabled)
    ),
    social_proof_enabled: pick(base.social_proof_enabled, toBoolean(data.socialProofEnabled)),
  };
};

const normalizeOrderBumps = (items: unknown): NonNullable<ProductOffer["order_bumps"]> => {
  if (!Array.isArray(items)) return [];
  return items.map(item => {
  const data = item as Record<string, unknown>;
    return {
      id: toString(data.id),
      title: toString(data.title) ?? "Order Bump",
      description: toString(data.description),
      tag: toString(pick(data.tagDisplay, data.tag_display)),
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
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  if (typeof window !== "undefined" && raw.startsWith("/api")) {
    return `${window.location.origin}/api-public`;
  }
  const normalized = raw.replace(/\/v1\/?$/, "");
  if (typeof window !== "undefined" && normalized.startsWith("/")) {
    return `${window.location.origin}${normalized}`;
  }
  return normalized;
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

  useEffect(() => {
    const loadCheckout = async () => {
      if (!productId || !offerId) return;
      setLoading(true);
      try {
        const baseUrl = resolvePublicApiBase();
        const response = await fetch(`${baseUrl}/checkout/${offerId}/product/${productId}`);
        if (!response.ok) {
          throw new Error(`Public checkout failed: ${response.status}`);
        }
        const data = (await response.json()) as PublicCheckoutOfferResponse;
        console.log("[publicCheckout] Dados carregados:", { productId, offerId, data });
        const normalizedCheckout = normalizeCheckout(data.checkout);
        const normalizedProduct = normalizeProduct(data.product);
        if (!normalizedCheckout) {
          setError("Checkout não encontrado");
          return;
        }
        setCheckout(normalizedCheckout);
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

  return <Checkout checkout={checkout} product={product} offer={offer} />;
}

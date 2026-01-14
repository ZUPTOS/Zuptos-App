
'use client';

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, CreditCard, Lock, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Checkout, Product, ProductOffer } from "@/lib/api";

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
  const showEmailConfirmation = checkout?.required_email_confirmation ?? false;
  const showDocument = checkout?.required_document ?? false;
  const showBirthdate = checkout?.required_birthdate ?? false;
  const showPhone = checkout?.required_phone ?? false;
  const showAddress = checkout?.required_address ?? false;
  const showTestimonials = Boolean(
    checkout?.testimonials_enabled && Array.isArray(checkout?.testimonials) && checkout.testimonials.length > 0
  );
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
  const orderBumpNormal = offerType === "subscription" ? planNormal ?? planPromo ?? offerBasePrice : offerBasePrice;
  const orderBumpPromo = offerType === "subscription" ? planPromo : null;
  const orderBumpHasDiscount =
    orderBumpNormal != null && orderBumpPromo != null && Number(orderBumpNormal) !== Number(orderBumpPromo);
  const formatBRL = (value: number) =>
    Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const availablePaymentMethods = useMemo(() => {
    const methods = checkout?.payment_methods;
    return methods && methods.length > 0 ? methods : ["card", "pix", "boleto"];
  }, [checkout?.payment_methods]);
  const [paymentMethod, setPaymentMethod] = useState<string>(availablePaymentMethods[0] ?? "card");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [selectedBumps, setSelectedBumps] = useState<Record<string, boolean>>({});
  const visiblePaymentButtons = useMemo(
    () => paymentButtons.filter(button => availablePaymentMethods.includes(button.id)),
    [availablePaymentMethods]
  );
  const inputClass = `
    h-10 w-full rounded-[6px] px-3 text-sm focus:outline-none
    ${isDark ? "border border-white/10 bg-[#0b0b0b] text-white placeholder:text-neutral-500" : "border border-black/10 bg-white text-[#0a0a0a] placeholder:text-neutral-500"}
  `;

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
    setSelectedBumps(nextSelected);
  }, [offer?.order_bumps]);

  const handleConfirmPayment = async () => {
    if (!offerId || !productId) return;
    const baseUrl = publicApiBase ?? "";
    setSubmittingPayment(true);
    try {
      const bumpsPayload = offer?.order_bumps
        ? offer.order_bumps
            .map(bump => bump.id)
            .filter(id => id)
            .map(id => ({ id }))
        : [];
      const payload = {
        payment_method: paymentMethodMap[paymentMethod] ?? paymentMethodMap.card,
        offer_id: offerId,
        product_id: productId,
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
        const priceValue =
          offer?.free
            ? 0
            : offerType === "subscription"
              ? Number(planPromo ?? planNormal ?? offerBasePrice ?? 0)
              : Number(offerBasePrice ?? 0);
        const params = new URLSearchParams({
          product: title,
          price: Number.isFinite(priceValue) ? String(priceValue) : "0",
          method: paymentMethodMap[paymentMethod] ?? paymentMethodMap.card,
          image: product?.image_url || "/images/produto.png",
        });
        router.push(`/pagamento-confirmado?${params.toString()}`);
      }
    } catch (error) {
      console.error("[publicCheckout] Erro ao confirmar pagamento:", error);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: background }}>
      {showCountdown ? (
        <header
          className="flex items-center justify-between gap-4 px-4 py-4 text-xl font-semibold sm:px-8"
          style={{ backgroundColor: accent }}
        >
          <span className="tracking-tight">{checkout?.countdown_expire || "00:00:00"}</span>
          <CheckCircle2 className="h-10 w-10" />
          <span className="text-sm sm:text-base" style={{ color: checkout?.countdown_text_color || "#fff" }}>
            {checkout?.after_sale_title || "Tempo limitado"}
          </span>
        </header>
      ) : (
        <div className="h-4" />
      )}

      {checkout?.banner && (
        <div className="h-28 w-full">
          <Image src={checkout.banner} alt="Banner" width={1920} height={200} className="h-28 w-full object-cover" />
        </div>
      )}

      <main className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-4 py-8 lg:flex-row lg:items-start">
        <section className="flex-1 space-y-5">
          <div
            className="rounded-[10px] border"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
            <div className={`flex items-center gap-3 px-5 pt-5 text-lg font-semibold ${textPrimary}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/20 text-sm">1</span>
              <p>Identificação</p>
            </div>

            <div className="p-5 pt-3 space-y-5">
              <label className="space-y-5 text-xs text-neutral-400">
                <span>Nome e sobrenome</span>
                <input className={inputClass} placeholder="Digite um nome" />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {showDocument && (
                  <label className="space-y-4 text-xs text-neutral-400">
                    <span>CPF/CNPJ</span>
                    <input className={inputClass} placeholder="Digite um documento" />
                  </label>
                )}
                {showPhone && (
                  <label className="space-y-4 text-xs text-neutral-400">
                    <span>Celular</span>
                    <input className={inputClass} placeholder="Digite um celular" />
                  </label>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-5 text-xs text-neutral-400 col-span-2">
                  <span>E-mail</span>
                  <input className={inputClass} placeholder="Digite um e-mail" />
                </label>
                {showEmailConfirmation && (
                  <label className="space-y-5 text-xs text-neutral-400 col-span-2">
                    <span>Confirmar e-mail</span>
                    <input className={inputClass} placeholder="Confirme o e-mail" />
                  </label>
                )}
              </div>

              {showBirthdate && (
                <label className="space-y-5 text-xs text-neutral-400">
                  <span>Data de nascimento</span>
                  <input className={inputClass} placeholder="DD/MM/AAAA" />
                </label>
              )}

              {showAddress && (
                <div className="space-y-5">
                  <label className="space-y-2 text-xs text-neutral-400">
                    <span>Endereço</span>
                    <input className={inputClass} placeholder="Rua, número, complemento" />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input className={inputClass} placeholder="Cidade" />
                    <input className={inputClass} placeholder="Estado" />
                    <input className={inputClass} placeholder="CEP" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-[10px] border"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
            <div className={`flex items-center gap-3 px-5 pt-5 text-lg font-semibold ${textPrimary}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-white/20 text-sm">2</span>
              <p>Pagamento</p>
            </div>

            <div className="px-5 pt-3 flex items-center gap-3">
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
                  <Image src={button.iconSrc} alt={button.label} width={28} height={28} className="h-7 w-7 object-contain" />
                </button>
              )})}
            </div>

            <div className="px-5 pb-5 pt-3 space-y-5">
              {paymentMethod === "card" && (
                <>
                  <label className="space-y-5 text-xs text-neutral-400">
                    <span>Nome do titular</span>
                    <input className={inputClass} placeholder="Digite um nome" />
                  </label>

                  <label className="space-y-5 text-xs text-neutral-400">
                    <span>Número do cartão</span>
                    <div className="relative">
                      <input className={`${inputClass} pr-10`} placeholder="Digite um nome" />
                      <CreditCard className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    </div>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="space-y-5 text-xs text-neutral-400">
                      <span>Vencimento</span>
                      <input className={inputClass} placeholder="Digite um nome" />
                    </label>
                    <label className="space-y-5 text-xs text-neutral-400">
                      <span>CVV</span>
                      <input className={inputClass} placeholder="Digite um nome" />
                    </label>
                    <label className="space-y-5 text-xs text-neutral-400">
                      <span>Parcelamento</span>
                      <input className={inputClass} placeholder="Digite um nome" />
                    </label>
                  </div>
                </>
              )}

              {paymentMethod === "pix" && (
                <div
                  className="flex flex-col items-center gap-3 rounded-[10px] border px-4 py-5"
                  style={{ backgroundColor: subCardBg, borderColor }}
                >
                  <div className="grid grid-cols-7 gap-1 rounded-[8px] bg-white p-2">
                    {Array.from({ length: 49 }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-3 w-3 ${[1, 2, 5, 6, 9, 11, 13, 17, 18, 20, 24, 25, 28, 30, 33, 34, 36, 40, 41, 45, 47].includes(idx) ? "bg-black" : "bg-white"}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                    Escaneie o QR Code para pagar com Pix
                  </p>
                </div>
              )}

              {paymentMethod === "boleto" && (
                <div
                  className="rounded-[10px] border px-4 py-4 text-xs"
                  style={{ backgroundColor: subCardBg, borderColor, color: isDark ? "#a1a1aa" : "#4b5563" }}
                >
                  Boleto disponível em breve.
                </div>
              )}
            </div>

          </div>

          {offer?.order_bumps && offer.order_bumps.length > 0 && (
            <div className="space-y-3">
              {offer.order_bumps.map((bump, idx) => {
                const formattedNormal =
                  orderBumpNormal != null ? formatBRL(Number(orderBumpNormal)) : null;
                const formattedPromo =
                  orderBumpPromo != null ? formatBRL(Number(orderBumpPromo)) : null;
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
                        className={`h-5 w-5 rounded border transition ${
                          isChecked
                            ? "border-[#6C27D7] bg-[#6C27D7]"
                            : "border-foreground/30 bg-transparent"
                        }`}
                        checked={isChecked}
                        disabled
                      />
                        );
                      })()}
                      <Image
                        src="/images/produto.png"
                        alt={bump.title || "Order bump"}
                        width={56}
                        height={56}
                        className="h-[56px] w-[56px] rounded-[10px] object-cover"
                      />
                      <div className="flex flex-col gap-1">
                        <p className={`text-sm font-semibold ${textPrimary}`}>{bump.title || "Order Bump"}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {offer?.free ? (
                            <span className="text-emerald-400">Gratuito</span>
                          ) : orderBumpHasDiscount ? (
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
          )}

          <button
            type="button"
            className="mt-1 w-full rounded-[6px] px-4 py-2.5 text-sm font-semibold uppercase tracking-tight text-white transition hover:brightness-110"
            style={{ backgroundColor: accent }}
            onClick={handleConfirmPayment}
            disabled={submittingPayment || !offerId || !productId}
          >
            {submittingPayment ? "Confirmando..." : "Confirmar pagamento"}
          </button>
        </section>

        <aside className="w-full max-w-[320px] space-y-4">
          <div
            className="rounded-[10px] border p-4"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
            <div className="flex items-center gap-3">
              <Image
                src={product?.image_url || "/images/produto.png"}
                alt={title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-[10px] object-cover"
              />
              <div className="flex flex-col">
                <p className={`text-base font-semibold ${textPrimary}`}>{title}</p>
                <span className={`text-sm ${textPrimary}`}>
                  {offer?.free
                    ? "Gratuito"
                    : offer?.offer_price !== undefined
                    ? Number(offer.offer_price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "R$ 0,00"}
                </span>
              </div>
            </div>
          </div>

          <div
            className="rounded-[10px] border p-4 space-y-4"
            style={{ backgroundColor: cardBg, borderColor: borderColor }}
          >
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

          {showTestimonials && (
            <div
              className="rounded-[10px] border p-4 space-y-6"
              style={{ backgroundColor: cardBg, borderColor: borderColor }}
            >
              <div className="space-y-3">
                <p className={`text-lg font-semibold ${textPrimary}`}>Depoimentos</p>
                <div className="flex flex-col gap-3">
                  {checkout?.testimonials?.map((item, idx) => (
                    <div
                      key={item.id ?? idx}
                      className="space-y-2 rounded-[10px] border border-white/10 p-3"
                      style={{ backgroundColor: subCardBg }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/70" />
                        <div className="flex flex-col gap-1">
                          <p className={`text-sm font-semibold ${textPrimary}`}>{item.name || "Nome e sobrenome"}</p>
                          <div className="flex gap-1 text-[#8ea000]">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < (item.rating ?? 0) ? "fill-[#8ea000]" : "text-neutral-600"}`} />
                            ))}
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
          )}
        </aside>
      </main>
    </div>
  );
}

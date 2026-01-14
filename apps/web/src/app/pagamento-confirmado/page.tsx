'use client';

import Image from "next/image";
import { useMemo } from "react";
import { Check, ShieldCheck, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";

const paymentLabels: Record<string, string> = {
  credit_card: "Pagamento feito via Cartão",
  pix: "Pagamento feito via Pix",
  ticket: "Pagamento feito via Boleto",
};

const paymentIcons: Record<string, string> = {
  credit_card: "/images/card.svg",
  pix: "/images/pix.svg",
  ticket: "/images/boleto.svg",
};

export default function PagamentoConfirmadoPage() {
  const params = useSearchParams();
  const productName = params.get("product") || "Produto";
  const price = Number(params.get("price") ?? 0);
  const image = params.get("image") || "/images/produto.png";
  const method = params.get("method") || "pix";

  const priceLabel = useMemo(
    () =>
      Number.isFinite(price)
        ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 0,00",
    [price]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-emerald-500/80">
          <Check className="h-7 w-7 text-black" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Agradecemos pela sua compra</h1>
          <p className="text-sm text-white/70">
            Você receberá um e-mail confirmando sua compra.
          </p>
        </div>

        <div className="relative w-full max-w-[520px] overflow-hidden rounded-[16px] bg-[#141414]">
          <div className="space-y-4 px-5 py-5 text-left">
            <div className="flex items-center gap-3 text-white/80">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/10 bg-[#1b1b1b]">
                <Ticket className="h-5 w-5 text-white/80" />
              </div>
              <span className="text-base font-semibold">Sua compra</span>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src={image}
                alt={productName}
                width={56}
                height={56}
                className="h-14 w-14 rounded-[10px] object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-white">{productName}</p>
                <p className="text-xs text-white/70">{priceLabel}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="mx-5 border-t border-dashed border-white/15" />
            <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#0b0b0b]" />
            <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[#0b0b0b]" />
          </div>
          <div className="px-5 py-4 text-left text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Image
                src={paymentIcons[method] ?? paymentIcons.pix}
                alt={paymentLabels[method] ?? "Pagamento"}
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span>{paymentLabels[method] ?? "Pagamento efetuado"}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 flex w-full 2xl:w-[520px] xl:w-[500px] items-center justify-between text-xs text-white/40 sm:mt-20">
          <span className="text-start w-50">Tecnologia Zuptos © 2025 Todos os direitos reservados</span>
          <span className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Compra 100% segura
          </span>
        </div>
      </div>
    </div>
  );
}

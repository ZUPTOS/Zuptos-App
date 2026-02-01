
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
  const theme = params.get("theme") || "dark";
  const isDark = theme === "dark";

  const priceLabel = useMemo(
    () =>
      Number.isFinite(price)
        ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 0,00",
    [price]
  );

  // Dynamic colors based on checkout theme
  const bgColor = isDark ? "bg-[#0b0b0b]" : "bg-[#f6f6f6]";
  const textColor = isDark ? "text-white" : "text-[#0a0a0a]";
  const textMuted = isDark ? "text-white/70" : "text-[#0a0a0a]/70";
  const cardBg = isDark ? "bg-[#141414]" : "bg-white";
  const innerCardBg = isDark ? "bg-[#1b1b1b]" : "bg-[#f3f3f3]"; // Slightly darker white/gray for light mode contrast
  const iconBorder = isDark ? "border-white/10" : "border-black/10";
  const dividerColor = isDark ? "border-white/15" : "border-black/10";
  const circleBg = isDark ? "bg-[#0b0b0b]" : "bg-[#f6f6f6]"; // Matches main bg to create cutout effect

  return (
    <div className={`flex min-h-screen items-center justify-center ${bgColor} px-4 py-10 ${textColor}`}>
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-emerald-500/80">
          <Check className="h-7 w-7 text-black" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Agradecemos pela sua compra</h1>
          <p className={`text-sm ${textMuted}`}>
            Você receberá um e-mail confirmando sua compra.
          </p>
        </div>

        <div className={`relative w-full max-w-[520px] overflow-hidden rounded-[16px] ${cardBg} shadow-sm`}>
          <div className="space-y-4 px-5 py-5 text-left">
            <div className={`flex items-center gap-3 ${isDark ? 'text-white/80' : 'text-[#0a0a0a]/80'}`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] border ${innerCardBg} ${iconBorder}`}>
                <Ticket className={`h-5 w-5 ${isDark ? 'text-white/80' : 'text-[#0a0a0a]/80'}`} />
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
                <p className={`text-sm font-semibold ${textColor}`}>{productName}</p>
                <p className={`text-xs ${textMuted}`}>{priceLabel}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className={`mx-5 border-t border-dashed ${dividerColor}`} />
            <div className={`pointer-events-none absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border ${iconBorder} ${circleBg}`} />
            <div className={`pointer-events-none absolute right-0 top-0 h-8 w-8 translate-x-1/2 -translate-y-1/2 rounded-full border ${iconBorder} ${circleBg}`} />
          </div>
          <div className={`px-5 py-4 text-left text-xs ${textMuted}`}>
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

        <div className={`mt-16 flex w-full 2xl:w-[520px] xl:w-[500px] items-center justify-between text-xs sm:mt-20 ${isDark ? 'text-white/40' : 'text-[#0a0a0a]/40'}`}>
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

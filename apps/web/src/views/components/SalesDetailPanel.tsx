'use client';

import Image from "next/image";
import { Copy, Phone, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PaymentMethod, Sale, SaleStatus } from "@/views/Sales";

interface SalesDetailPanelProps {
  sale: Sale | null;
  onClose: () => void;
}

const statusColors: Record<SaleStatus, string> = {
  aprovada: "bg-emerald-500/10 text-emerald-300",
  recusada: "bg-red-500/10 text-red-300",
  expirada: "bg-zinc-600/20 text-zinc-300"
};

const statusLabels: Record<SaleStatus, string> = {
  aprovada: "Aprovada",
  recusada: "Recusada",
  expirada: "Expirada"
};

const paymentLabels: Record<PaymentMethod, string> = {
  credit_card: "Cartão de crédito",
  pix: "Pix",
  boleto: "Boleto"
};

const paymentIcons: Record<PaymentMethod, string> = {
  credit_card: "/images/card.svg",
  pix: "/images/pix.svg",
  boleto: "/images/boleto.svg"
};

export default function SalesDetailPanel({ sale, onClose }: SalesDetailPanelProps) {
  const [isRefundModalOpen, setRefundModalOpen] = useState(false);
  const detailData = useMemo(() => {
    if (!sale) return null;
    return {
      orderBumps: [
        {
          title: sale.productName,
          type: sale.productType,
          price: sale.total
        },
        {
          title: "Order Bump 01",
          type: "Curso",
          price: 97
        }
      ],
      buyer: {
        name: sale.buyerName,
        cpf: "999.999.999-99",
        email: sale.buyerEmail,
        phone: "+55 00 00000-0000",
        ip: "123.123.123-12"
      },
      transaction: {
        status: sale.status,
        method: paymentLabels[sale.paymentMethod],
        createdAt: new Date(sale.saleDate).toLocaleString("pt-BR"),
        saleDate: new Date(sale.saleDate).toLocaleString("pt-BR"),
        total: sale.total,
        fees: { percentage: 0, amount: 0 },
        coProducerCommission: 0,
        myCommission: 0,
        thankYouPage: "www.site.com"
      },
      marketing: {
        utmCampaign: sale.utm ?? "-",
        utmContent: "-",
        utmMedium: "-",
        utmSource: "-",
        utmTerm: "-"
      }
    };
  }, [sale]);

  if (!sale || !detailData) return null;

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <aside className="absolute inset-0 z-50 flex items-start justify-end bg-black/30" onClick={handleBackdropClick}>
      <div className="relative mr-2 w-[420px] h-full bg-card shadow-2xl custom-scrollbar overflow-y-auto" onClick={event => event.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-muted px-7 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <span>ID da transação: #{sale.id}</span>
            <button type="button" className="rounded p-1 text-muted-foreground hover:text-primary">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            aria-label="Fechar detalhes"
            className="rounded-full p-1 text-muted-foreground transition hover:text-primary"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <section className="px-7 py-4">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground">Produto</h2>
          <div className="mt-3 space-y-3">
            {detailData.orderBumps.map((item, index) => (
              <div key={`${item.title}-${index}`} className="space-y-3">
                <div className="flex items-center justify-between rounded-[12px] border border-muted bg-card/70 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/logoSide.svg"
                      alt={item.title}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-[10px] border border-muted bg-card object-cover"
                    />
                    <div>
                      <p className="font-semibold text-card-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">
                    {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
                {index === 0 && detailData.orderBumps.length > 1 ? (
                  <div className="flex items-center gap-2 px-1 text-base font-semibold text-foreground">
                    <Image src="/images/order-bump.svg" alt="Order bump" width={18} height={18} className="h-[18px] w-[18px]" />
                    <span>Order Bumps</span>
                    <span className="rounded-[6px] bg-foreground/20 px-2 py-[2px] text-xs font-semibold text-foreground">1</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="px-7 py-4">
          <h2 className="text-sm font-semibold text-card-foreground">Comprador</h2>
          <div className="mt-3 flex flex-col gap-2 rounded-[12px] border border-muted bg-card/60 px-4 py-3 text-xs">
            <div className="flex items-start gap-4">
              <span className="min-w-[150px] text-muted-foreground">Nome</span>
              <span className="text-foreground">{detailData.buyer.name}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[150px] text-muted-foreground">CPF</span>
              <span className="text-foreground">{detailData.buyer.cpf}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[150px] text-muted-foreground">E-mail</span>
              <span className="text-foreground">{detailData.buyer.email}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[150px] text-muted-foreground">Telefone</span>
              <span className="flex items-center gap-2 text-foreground">
                {detailData.buyer.phone} <Phone className="h-3 w-3 text-primary" />
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[150px] text-muted-foreground">IP</span>
              <span className="text-foreground">{detailData.buyer.ip}</span>
            </div>
          </div>
        </section>

        <section className="px-7 py-4">
          <h2 className="text-sm font-semibold text-card-foreground">Transação</h2>
          <div className="mt-3 flex flex-col gap-3 rounded-[12px] border border-muted bg-card/60 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="min-w-[160px] text-muted-foreground">Status</span>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                  statusColors[detailData.transaction.status]
                }`}
              >
                {statusLabels[detailData.transaction.status]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="min-w-[160px] text-muted-foreground">Método</span>
              <span className="flex items-center gap-2 text-[12px] text-foreground">
                <Image
                  src={paymentIcons[sale.paymentMethod]}
                  alt={detailData.transaction.method}
                  width={18}
                  height={18}
                  className="h-[28px] w-[28px]"
                />
                {detailData.transaction.method}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Data de criação</span>
              <span className="text-foreground">{detailData.transaction.createdAt}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Data da venda</span>
              <span className="text-foreground">{detailData.transaction.saleDate}</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Total</span>
              <span className="text-foreground">
                {detailData.transaction.total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Taxas (0,0% +R$00,00)</span>
              <span className="text-foreground">
                {`${detailData.transaction.fees.percentage}% + ${detailData.transaction.fees.amount.toLocaleString(
                  "pt-BR",
                  { style: "currency", currency: "BRL" }
                )}`}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Comissão do coprodutor</span>
              <span className="text-foreground">
                {detailData.transaction.coProducerCommission.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Minha comissão</span>
              <span className="text-foreground">
                {detailData.transaction.myCommission.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                })}
              </span>
            </div>
            <div className="flex items-start gap-4">
              <span className="min-w-[160px] text-muted-foreground">Página de obrigado</span>
              <span className="flex items-center gap-2 text-primary underline decoration-dashed">
                {detailData.transaction.thankYouPage}
                <Copy className="h-4 w-4" />
              </span>
            </div>
          </div>
        </section>

        <section className="px-7 py-4">
          <h2 className="text-sm font-semibold text-card-foreground">Marketing</h2>
          <div className="mt-3 rounded-[12px] border border-muted bg-card/60 px-4 py-3 text-xs text-muted-foreground">
            {Object.entries(detailData.marketing).map(([key, value]) => (
              <div key={key} className="flex items-start gap-4">
                <span className="min-w-[160px] capitalize">{key.replace("utm", "UTM ")}</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {sale.status === "aprovada" && (
          <div className="px-7 py-4">
            <div className="flex justify-end">
              <button
                type="button"
                className="flex w-1/2 items-center justify-center gap-2 rounded-[10px] border border-muted px-4 py-3 text-sm font-semibold text-card-foreground transition hover:bg-primary hover:text-foreground"
                onClick={() => setRefundModalOpen(true)}
              >
                Estornar venda
              </button>
            </div>
          </div>
        )}
      </div>

      {isRefundModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="w-[360px] rounded-[16px] border border-muted bg-background px-6 py-5 text-sm text-card-foreground">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Tem certeza que deseja estornar essa venda?</p>
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-[10px] border border-muted px-4 py-2 font-semibold text-card-foreground hover:border-primary/60 hover:text-primary"
                onClick={() => setRefundModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90"
                onClick={() => {
                  setRefundModalOpen(false);
                  onClose();
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

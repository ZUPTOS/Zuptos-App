'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Transaction } from "@/types/transaction";

type TransactionDetailPanelProps = {
  transaction: Transaction | null;
  statusVariants: Record<Transaction["status"], string>;
  cardSurfaceClassName: string;
};

const tabs = [
  { id: "financeiro", label: "Financeiro", iconSrc: "/images/transactionDetailPannel/bank.svg" },
  { id: "participantes", label: "Participantes", iconSrc: "/images/transactionDetailPannel/people.svg" },
  { id: "info", label: "Informações", iconSrc: "/images/transactionDetailPannel/info.svg" }
] as const;

// UI guideline: keep corner radius between 6px and 7px.

const parseCurrency = (value: string) => {
  const numeric = Number(value.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });

const buildPeopleInfo = (transaction: Transaction | null) => {
  if (!transaction) {
    return {
      buyer: { name: "—", document: "—", email: "—", phone: "—" },
      seller: { name: "—", document: "—", email: "—", phone: "—" }
    };
  }
  const suffix = transaction.id.replace("#", "");
  return {
    buyer: {
      name: `Cliente ${suffix}`,
      document: `***.${suffix.slice(-3)}.***-**`,
      email: `cliente${suffix}@email.com`,
      phone: "(21) 99999-9999"
    },
    seller: {
      name: `Produtor ${suffix}`,
      document: `***.${suffix.slice(-4)}.***-**`,
      email: `produtor${suffix}@email.com`,
      phone: "(11) 98888-8888"
    }
  };
};

export default function TransactionDetailPanel({ transaction, statusVariants, cardSurfaceClassName }: TransactionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("financeiro");
  const peopleInfo = useMemo(() => buildPeopleInfo(transaction), [transaction]);
  const numericValue = parseCurrency(transaction?.value ?? "0");
  const creationDate = transaction?.date ?? "--/--/----";
  const creationTime = transaction?.time ?? "";
  const approvalDate = transaction?.date ?? "--/--/----";
  const approvalTime = transaction?.time ?? "";
  const extraDateLabel = transaction?.status === "Chargeback" ? "Data de chargeback" : transaction?.status === "Reembolsado" ? "Data de reembolso" : null;
  const extraDateValue = extraDateLabel ? approvalDate : null;
  const extraDateTime = extraDateLabel ? approvalTime : "";

  const renderDateRow = (label: string, dateValue: string | null, timeValue?: string, stacked?: boolean) => {
    if (!dateValue) return null;
    return (
      <div className={`flex ${stacked ? "flex-col items-start" : "items-start justify-between"} gap-3`}>
        <p className="text-lg text-muted-foreground">{label}</p>
        <div className={`flex flex-col gap-1 ${stacked ? "flex flex-row items-end text-left" : "items-end text-right"}`}>
          <p className="text-md leading-tight text-foreground">{dateValue}</p>
          {timeValue ? <p className="text-xs text-muted-foreground">{timeValue}</p> : null}
        </div>
      </div>
    );
  };

  if (!transaction) {
    return (
    <section className={`${cardSurfaceClassName} rounded-[7px] p-6`}>
      <p className="text-lg font-semibold text-foreground">Selecione uma transação para visualizar os detalhes</p>
    </section>
  );
}

  const detailEntries = [
    { label: "Valor total", value: transaction.value },
    { label: "Taxa da plataforma", value: formatCurrency(numericValue * 0.1) },
    { label: "Comissão do vendedor", value: formatCurrency(numericValue * 0.7) },
    { label: "Comissão dos participantes", value: formatCurrency(numericValue * 0.2) },
    { label: "Método de pagamento", value: transaction.type === "Venda" ? "Cartão de crédito" : "Pix" },
    { label: "Adquirente", value: "Banco XPTO" }
  ];

  const utmInfo = [
    { label: "UTM SOURCE", value: "XXXXXXXXXX" },
    { label: "UTM MEDIUM", value: "XXXXXXXXXX" },
    { label: "UTM CAMPAIGN", value: "XXXXXXXXXX" },
    { label: "UTM TERM", value: "XXXXXXXXXX" }
  ];

  const technicalInfo = [{ label: "Id externo", value: "XXXXXXXXXX" }];

  return (
    <section className={`${cardSurfaceClassName} rounded-[7px] p-6`}>
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-5">
          <p className="text-lg font-semibold text-foreground">Dados da transação</p>
          <span className="text-sm text-muted-foreground">ID: {transaction.id}</span>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusVariants[transaction.status]}`}>
          {transaction.status}
        </span>
      </div>

      <div className="grid gap-6 pt-4 lg:grid-cols-3">
        <div>
          <p className="text-sm text-muted-foreground">Valor</p>
          <p className="text-2xl font-semibold text-foreground">{transaction.value}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Nome do produto</p>
          <p className="text-lg font-semibold text-foreground">{`${transaction.type} Premium`}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-semibold text-foreground">{transaction.status}</p>
        </div>
      </div>

      {(() => {
        const stackDates = !extraDateLabel;
        return (
          <div className="mt-10 grid gap-10 rounded-[7px] lg:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <p className="text-xl font-semibold text-foreground">Comprador</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">Nome:</span>
                  <span className="text-foreground">{peopleInfo.buyer.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">CPF/CNPJ:</span>
                  <span className="text-foreground">{peopleInfo.buyer.document}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">E-mail:</span>
                  <span className="text-foreground">{peopleInfo.buyer.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">Telefone:</span>
                  <span className="text-foreground">{peopleInfo.buyer.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-xl font-semibold text-foreground">Vendedor</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">Nome:</span>
                  <span className="text-foreground">{peopleInfo.seller.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">CPF/CNPJ:</span>
                  <span className="text-foreground">{peopleInfo.seller.document}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">E-mail:</span>
                  <span className="text-foreground">{peopleInfo.seller.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-foreground">Telefone:</span>
                  <span className="text-foreground">{peopleInfo.seller.phone}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {renderDateRow("Data de criação", creationDate, creationTime, stackDates)}
              {renderDateRow("Data de aprovação", approvalDate, approvalTime, stackDates)}
              {extraDateLabel ? renderDateRow(extraDateLabel, extraDateValue, extraDateTime, false) : null}
            </div>
          </div>
        );
      })()}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center rounded-[7px] border px-4 py-4 text-sm font-semibold transition ${
                isActive
                  ? "border-primary text-primary"
                  : "border-foreground/15 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              }`}
            >
              <span
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[7px] border ${
                  isActive ? "border-primary text-primary" : "border-foreground/20 text-muted-foreground"
                }`}
              >
                <Image
                  src={tab.iconSrc}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                  style={
                    isActive
                      ? {
                          filter:
                            "brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(2474%) hue-rotate(263deg) brightness(94%) contrast(94%)"
                        }
                      : undefined
                  }
                />
              </span>
              <span className="text-base font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "financeiro" && (
          <div className="space-y-4">
            <div className="rounded-[7px] border border-foreground/10 bg-card/60 p-10">
              <div className="grid gap-x-6 gap-y-5 md:grid-cols-3">
                {detailEntries.map(entry => (
                  <div key={entry.label} className="space-y-2">
                    <p className="text-xs tracking-wide text-muted-foreground">{entry.label}</p>
                    <p className="text-lg font-semibold text-foreground">{entry.value}</p>
                    {entry.label === "Taxa da plataforma" && (
                      <p className="text-fs-meta text-muted-foreground">x% do valor total</p>
                    )}
                    {entry.label === "Comissão dos participantes" && (
                      <p className="text-fs-meta text-muted-foreground">Total pago aos participantes</p>
                    )}
                    {entry.label === "Comissão do vendedor" && (
                      <p className="text-fs-meta text-muted-foreground">Valor bruto do vendedor</p>
                    )}
                    {entry.label === "Valor total" && (
                      <p className="text-fs-meta text-muted-foreground">Valor bruto da transação</p>
                    )}
                    {entry.label === "Método de pagamento" && (
                      <p className="text-fs-meta text-muted-foreground">36x</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-[7px] border border-foreground/10 bg-card/80 p-10">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">Lucro da transação</p>
                <p className="text-fs-meta text-muted-foreground">Lucro líquido da plataforma após taxas</p>
              </div>
              <span className="text-xl font-semibold text-foreground">{formatCurrency(numericValue * 0.2)}</span>
            </div>
          </div>
        )}

        {activeTab === "participantes" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">Participantes</p>
                <span className="rounded-full bg-muted/40 px-2 py-[2px] text-xs text-muted-foreground">2</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vendedor principal e todos participantes que recebem comissão dessa venda
              </p>
            </div>

            <div>
              <div className="rounded-[7px] p-5">
                <p className="text-xl font-semibold text-foreground mb-4">Vendedor principal</p>
                <div className="flex flex-col gap-4 rounded-[7px] border border-foreground/10 bg-card/80 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex p-5 items-center gap-5">
                    <div className="h-[70px] w-[70px] rounded-[7px] bg-foreground/40" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">Nome</p>
                        <span className="rounded-full bg-purple-900/30 px-3 py-[4px] text-xs font-semibold text-purple-200">
                          Produtor
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor líquido</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(numericValue * 0.6)}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[7px] bg-card/70 p-5">
                <p className="text-xl font-semibold text-foreground mb-4">Outros participantes</p>
                <div className="flex flex-col gap-4 rounded-[7px] border border-foreground/10 bg-card/80 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex p-5 items-center gap-5">
                    <div className="h-[70px] w-[70px] rounded-[7px] bg-foreground/40" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-foreground">Nome</p>
                        <span className="rounded-full bg-purple-900/30 px-3 py-[4px] text-xs font-semibold text-purple-200">
                          Coprodutor
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor líquido</p>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(numericValue * 0.1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="mt-10 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[7px] border border-foreground/10 bg-card/70 p-5">
                <p className="text-lg font-semibold text-foreground mb-4">Informações de UTM</p>
                <div className="space-y-3">
                  {utmInfo.map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[7px] border border-foreground/10 bg-card/70 p-5">
                <p className="text-lg font-semibold text-foreground mb-4">Informações técnicas</p>
                <div className="space-y-3">
                  {technicalInfo.map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeTab === "financeiro" && transaction.status === "Aprovado" && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Estornar
          </button>
        </div>
      )}
    </section>
  );
}

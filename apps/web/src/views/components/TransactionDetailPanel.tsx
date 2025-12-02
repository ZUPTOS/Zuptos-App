'use client';

import { Info, Landmark, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Transaction } from "@/types/transaction";

type TransactionDetailPanelProps = {
  transaction: Transaction | null;
  statusVariants: Record<Transaction["status"], string>;
  cardSurfaceClassName: string;
};

const tabs = [
  { id: "financeiro", label: "Financeiro", Icon: Landmark },
  { id: "participantes", label: "Participantes", Icon: Users },
  { id: "info", label: "Informações", Icon: Info }
] as const;

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

  if (!transaction) {
    return (
      <section className={`${cardSurfaceClassName} rounded-[12px] p-6`}>
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

  return (
    <section className={`${cardSurfaceClassName} rounded-[12px] p-6`}>
      <div className="flex flex-col gap-1 border-b border-foreground/10 pb-4">
        <p className="text-lg font-semibold text-foreground">Dados da transação</p>
        <span className="text-sm text-muted-foreground">ID: {transaction.id}</span>
      </div>

      <div className="grid gap-6 pt-4 lg:grid-cols-4">
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
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusVariants[transaction.status]}`}>
            {transaction.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data da criação</p>
          <p className="text-lg font-semibold text-foreground">{transaction.date}</p>
          <p className="text-xs text-muted-foreground">{transaction.time}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[12px] border border-foreground/10 p-4 lg:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Comprador</p>
          <p className="text-sm text-muted-foreground">Nome: {peopleInfo.buyer.name}</p>
          <p className="text-sm text-muted-foreground">CPF/CNPJ: {peopleInfo.buyer.document}</p>
          <p className="text-sm text-muted-foreground">E-mail: {peopleInfo.buyer.email}</p>
          <p className="text-sm text-muted-foreground">Telefone: {peopleInfo.buyer.phone}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Vendedor</p>
          <p className="text-sm text-muted-foreground">Nome: {peopleInfo.seller.name}</p>
          <p className="text-sm text-muted-foreground">CPF/CNPJ: {peopleInfo.seller.document}</p>
          <p className="text-sm text-muted-foreground">E-mail: {peopleInfo.seller.email}</p>
          <p className="text-sm text-muted-foreground">Telefone: {peopleInfo.seller.phone}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center rounded-[12px] border px-4 py-4 text-sm font-semibold transition ${
                isActive
                  ? "border-primary text-primary"
                  : "border-foreground/15 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              }`}
            >
              <span
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[12px] border ${
                  isActive ? "border-primary text-primary" : "border-foreground/20 text-muted-foreground"
                }`}
              >
                <tab.Icon className="h-6 w-6" />
              </span>
              <span className="text-base font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "financeiro" && (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-foreground/10 bg-card/60 p-10">
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
            <div className="flex items-center justify-between rounded-[12px] border border-foreground/10 bg-card/80 p-10">
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
              <div className="rounded-[12px] p-5">
                <p className="text-xl font-semibold text-foreground mb-4">Vendedor principal</p>
                <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex p-5 items-center gap-5">
                    <div className="h-[70px] w-[70px] rounded-[12px] bg-foreground/40" />
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

              <div className="rounded-[12px] bg-card/70 p-5">
                <p className="text-xl font-semibold text-foreground mb-4">Outros participantes</p>
                <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex p-5 items-center gap-5">
                    <div className="h-[70px] w-[70px] rounded-[12px] bg-foreground/40" />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[12px] border border-foreground/10 bg-card/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Tipo de transação</p>
              <p className="text-base font-semibold text-foreground">{transaction.type}</p>
            </div>
            <div className="rounded-[12px] border border-foreground/10 bg-card/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Status</p>
              <p className="text-base font-semibold text-foreground">{transaction.status}</p>
            </div>
            <div className="rounded-[12px] border border-foreground/10 bg-card/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Criada em</p>
              <p className="text-base font-semibold text-foreground">
                {transaction.date} <span className="text-xs text-muted-foreground">{transaction.time}</span>
              </p>
            </div>
            <div className="rounded-[12px] border border-foreground/10 bg-card/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Última atualização</p>
              <p className="text-base font-semibold text-foreground">{transaction.date}</p>
            </div>
          </div>
        )}
      </div>

      {activeTab === "financeiro" && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-[10px] border border-primary/20 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Estornar
          </button>
        </div>
      )}
    </section>
  );
}

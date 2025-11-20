'use client';

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Landmark, KeyRound, Banknote } from "lucide-react";

const tabs = [
  { id: "saldos", label: "Saldos" },
  { id: "transacoes", label: "Transações" },
  { id: "saques", label: "Histórico de saques" },
  { id: "taxas", label: "Taxas" }
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const balanceCards = [
  {
    id: "disponivel",
    title: "Saldo Disponível",
    description: "Este é o valor do seu saldo disponível mais o saldo pendente da reserva financeira.",
    value: 8759.98
  },
  {
    id: "pendente",
    title: "Saldo pendente",
    value: 8759.98
  },
  {
    id: "conta",
    title: "Conta Bancária Principal",
    bank: "077 - Banco Inter S.A.",
    accountType: "Conta PJ",
    pixKey: "xxxxxxxxxxxxxxx"
  },
  {
    id: "comissoes",
    title: "Comissões a receber",
    value: 8759.98
  }
];

export default function Finances() {
  const [activeTab, setActiveTab] = useState<string>("saldos");

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Finanças">
      <div className="min-h-full py-6">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 md:px-6">

          <div className="flex flex-wrap items-center gap-6 border-b border-muted/30 pb-1 text-base font-semibold">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-2 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-card-foreground"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 h-[3px] w-full rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === "saldos" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[708px_721px] lg:justify-between">
              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[245px]">
                <p className="text-[24px] font-semibold text-primary">Saldo Disponível</p>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[0].value)}
                </p>
                <p className="mt-3 text-[19px] text-muted-foreground">
                  {balanceCards[0].description}
                </p>
              </div>

              <div className="flex w-full flex-col justify-center gap-4 rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[245px]">
                <p className="text-[24px] font-semibold text-primary">Conta Bancária Principal</p>
                <div className="space-y-2 text-[19px] text-foreground">
                  <div className="flex items-center gap-2 font-semibold">
                    <Landmark className="h-5 w-5 text-muted-foreground" aria-hidden />
                    {balanceCards[2].bank} <span className="text-muted-foreground"> {balanceCards[2].accountType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <KeyRound className="h-5 w-5" aria-hidden />
                    Chave PIX: {balanceCards[2].pixKey}
                  </div>
                </div>
                <div className="flex">
                  <button
                    type="button"
                    className="inline-flex h-[49px] w-[231px] items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    Solicitar saque
                  </button>
                </div>
              </div>

              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
                <p className="text-[24px] font-semibold text-foreground">Saldo pendente</p>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[1].value)}
                </p>
              </div>

              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
                <div className="flex items-center justify-between">
                  <p className="text-[24px] font-semibold text-foreground">Comissões a receber</p>
                  <Banknote className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[3].value)}
                </p>
              </div>
            </div>
          )}

          {activeTab !== "saldos" && (
            <div className="rounded-[16px] border border-dashed border-muted/60 bg-card/40 p-6 text-center text-muted-foreground">
              <p className="text-base font-semibold text-card-foreground">Em breve</p>
              <p className="text-sm">Conteúdo da aba {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

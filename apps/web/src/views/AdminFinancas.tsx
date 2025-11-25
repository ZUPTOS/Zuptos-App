'use client';

import Image from "next/image";
import { Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";

const summaryMetrics = [
  { id: "totalTransacionado", label: "Total transacionado", value: "00" },
  { id: "receitaBruta", label: "Receita bruta total", value: "00" },
  { id: "receitaLiquida", label: "Receita líquida total", value: "00" }
] as const;

const revenueCards = [
  {
    id: "transacao",
    title: "Receita de Taxas de Transação",
    description: "Receitas geradas a partir de taxas cobradas em cada transação",
    metrics: [
      { label: "Receita bruta", value: "00" },
      { label: "Receita líquida", value: "00" }
    ]
  },
  {
    id: "saque",
    title: "Receita de Taxas de Saque",
    description: "Receitas geradas a partir de taxas cobradas em saques",
    metrics: [
      { label: "Receita bruta", value: "00" },
      { label: "Receita líquida", value: "00" }
    ]
  }
] as const;

export default function AdminFinancas() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Finanças (Admin)">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1241px] flex-col gap-4 px-4 lg:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <DateFilter />
            <button
              type="button"
              className="flex h-[50px] w-[50px] items-center justify-center rounded-[8px] border border-muted bg-card text-muted-foreground"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          <div className={`${cardSurface} w-[1241px] h-[287px] px-10 py-6`}>
            <div className="flex h-full flex-col items-start justify-center gap-5 text-left">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] border border-muted/60 bg-muted/10">
                  <Image src="/images/moeda.svg" alt="Resumo financeiro" width={64} height={64} className="h-[64px] w-[64px]" />
                </span>
                <div className="flex flex-col items-start">
                  <p className="text-[32px] font-bold text-foreground">Resumo Financeiro</p>
                  <p className="text-[19px] text-muted-foreground">
                    Visão geral dos principais indicadores financeiros no período selecionado
                  </p>
                </div>
              </div>

              <div className="flex w-full max-w-[1100px] flex-wrap justify-between gap-6">
                {summaryMetrics.map(metric => (
                  <div key={metric.id} className="flex flex-col items-start gap-2 min-w-[220px]">
                    <span className="text-[19px] text-muted-foreground">{metric.label}</span>
                    <span className="text-[19px] font-semibold text-foreground">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="my-2 px-2">
            <p className="text-[24px] font-sora text-foreground/70">Detalhamento da receita</p>
          </div>

          <div className="flex gap-3 md:flex-row w-[1241px]">
            {revenueCards.map(card => (
              <div key={card.id} className={`${cardSurface} h-[303px] w-[614px] flex flex-col items-start gap-10 px-10 justify-center`}>
                <div className="space-y-2">
                  <p className="text-[24px] font-semibold text-foreground">{card.title}</p>
                  <p className="text-[19px] w-[510px] text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex w-[510px] justify-between">
                  {card.metrics.map(metric => (
                    <div key={metric.label} className="flex flex-col items-start gap-2">
                      <span className="text-[19px] text-muted-foreground">{metric.label}</span>
                      <span className="text-[19px] font-semibold text-foreground">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`${cardSurface} flex items-center justify-between w-[1241px] h-[185px] px-10 py-6`}>
            <div className="flex h-full flex-col items-start justify-center gap-3">
              <p className="text-[32px] font-semibold text-foreground">Saldo disponível</p>
              <p className="text-[24px] text-muted-foreground">Quanto há disponível de saldo</p>
            </div>
            <div className="flex h-full items-center justify-center">
              <span className="text-[24px] font-semibold text-foreground">R$00</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

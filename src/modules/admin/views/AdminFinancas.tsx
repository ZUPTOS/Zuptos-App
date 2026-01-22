'use client';

import Image from "next/image";
import { useState } from "react";
import { Filter } from "lucide-react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import DateFilter from "@/shared/components/DateFilter";
import { FilterDrawer } from "@/shared/components/FilterDrawer";
import { useAdminFinanceSummary } from "@/modules/admin/hooks/useAdminFinanceSummary";
import { formatCurrency } from "@/lib/utils/currency";

export default function AdminFinancas() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [selectedSearchTypes, setSelectedSearchTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const toggleSearchType = (value: string) => {
    setSelectedSearchTypes(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
  };

  // Fetch summary with date range
  const { summary, isLoading } = useAdminFinanceSummary({
    startDate: dateRange.start?.toISOString(),
    endDate: dateRange.end?.toISOString(),
  });

  const summaryMetrics = [
    { id: "totalTransacionado", label: "Total transacionado", value: formatCurrency(summary?.totalTransacted || 0) },
    { id: "receitaBruta", label: "Receita bruta total", value: formatCurrency(summary?.grossRevenue || 0) },
    { id: "receitaLiquida", label: "Receita líquida total", value: formatCurrency(summary?.netRevenue || 0) }
  ];

  const revenueCards = [
    {
      id: "transacao",
      title: "Receita de Taxas de Transação",
      description: "Receitas geradas a partir de taxas cobradas em cada transação",
      metrics: [
        { label: "Receita bruta", value: formatCurrency(summary?.transactionFeeRevenue.gross || 0) },
        { label: "Receita líquida", value: formatCurrency(summary?.transactionFeeRevenue.net || 0) }
      ]
    },
    {
      id: "saque",
      title: "Receita de Taxas de Saque",
      description: "Receitas geradas a partir de taxas cobradas em saques",
      metrics: [
        { label: "Receita bruta", value: formatCurrency(summary?.withdrawalFeeRevenue.gross || 0) },
        { label: "Receita líquida", value: formatCurrency(summary?.withdrawalFeeRevenue.net || 0) }
      ]
    }
  ];

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className=" mx-auto w-full 2xl:max-w-[1100px] xl:max-w-[1100px]">
        <div className="mx-auto flex xl:max-w-[1100px] 2xl:max-w-[1100px]  flex-col gap-3 py-3 px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 sm:justify-between">
            <div className="space-y-1">
              <p className="text-[26px] font-semibold text-foreground">Financeiro</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-[50px] w-[50px] items-center justify-center rounded-[8px] border border-muted bg-card text-muted-foreground"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={`${cardSurface} w-full h-[260px] px-10`}>
            <div className="flex h-full flex-col items-start justify-center gap-10 text-left">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
                <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[12px] border border-muted/60 bg-muted/10">
                  <Image src="/images/moeda.svg" alt="Resumo financeiro" width={64} height={64} className="h-[64px] w-[64px]" />
                </span>
                <div className="flex flex-col items-start">
                  <p className="2xl:text-2xl xl:text-xl font-bold text-foreground">Resumo Financeiro</p>
                  <p className="2xl:text-xl xl:text-lg text-muted-foreground">
                    Visão geral dos principais indicadores financeiros no período selecionado
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex w-full items-center justify-center">
                  <p className="text-muted-foreground">Carregando...</p>
                </div>
              ) : (
                  <div className="flex w-full max-w-full flex-wrap justify-between gap-6">
                    {summaryMetrics.map(metric => (
                      <div key={metric.id} className="flex flex-col items-start gap-2 min-w-[220px]">
                        <span className="text-fs-stat text-muted-foreground">{metric.label}</span>
                        <span className="text-fs-stat font-semibold text-foreground">{metric.value}</span>
                      </div>
                    ))}
                  </div>
              )}
            </div>
          </div>

          <div className="my-2 px-2">
            <p className="text-fs-title font-sora text-foreground/70">Detalhamento da receita</p>
          </div>

          <div className="flex gap-3 md:flex-row h-full">
            {revenueCards.map(card => (
              <div key={card.id} className={`${cardSurface} h-[250px] w-full flex flex-col items-start gap-10 px-10 justify-center`}>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">{card.title}</p>
                  <p className="text-md text-muted-foreground">{card.description}</p>
                </div>
                <div className="flex w-full justify-between">
                  {card.metrics.map(metric => (
                    <div key={metric.label} className="flex flex-col items-start gap-2">
                      <span className="text-md text-muted-foreground">{metric.label}</span>
                      <span className="text-md font-semibold text-foreground">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`${cardSurface} flex items-center justify-between w-full h-[150px] px-10 py-6`}>
            <div className="flex h-full flex-col items-start justify-center gap-3">
              <p className="text-2xl xl:text-xl font-semibold text-foreground">Saldo disponível</p>
              <p className="text-xl xl:text-xl text-muted-foreground">Quanto há disponível de saldo</p>
            </div>
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl xl:text-xl font-semibold text-foreground">
                {formatCurrency(summary?.availableBalance || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtrar">
        <div className="space-y-6 text-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Data</p>
            <DateFilter onDateChange={handleDateChange} />
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-4">
            <p className="text-sm font-semibold text-foreground">Pesquisar por</p>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {["Usuário", "Adquirente"].map(option => (
                <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedSearchTypes.includes(option)}
                    onChange={() => toggleSearchType(option)}
                    className="ui-checkbox h-[22px] w-[22px]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              placeholder="Nome"
              className="mt-2 w-full rounded-[7px] border border-foreground/20 bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex h-[46px] w-full items-center justify-center rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] text-sm font-semibold text-white transition hover:brightness-110"
              onClick={() => setIsFilterOpen(false)}
            >
              Adicionar filtro
            </button>
          </div>
        </div>
      </FilterDrawer>
    </DashboardLayout>
  );
}

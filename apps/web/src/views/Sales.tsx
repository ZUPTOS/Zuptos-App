'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Search,
  Upload
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import salesData from "@/data/salesData.json";
import SalesFilterPanel from "@/views/components/SalesFilterPanel";

type PaymentMethod = "credit_card" | "pix" | "boleto";
type SaleStatus = "aprovada" | "recusada" | "expirada";

interface Sale {
  id: string;
  productName: string;
  productType: string;
  buyerName: string;
  buyerEmail: string;
  saleType: string;
  saleDate: string;
  paymentMethod: PaymentMethod;
  plan: string;
  total: number;
  status: SaleStatus;
}

interface MetricCard {
  id: string;
  title: string;
  value: number;
  change: number;
  data: { label: string; value: number }[];
}

const { metricCards, salesHistory } = salesData as {
  metricCards: MetricCard[];
  salesHistory: Sale[];
};

const ROWS_PER_PAGE = 6;

const paymentMethods: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  credit_card: { label: "Cartão de crédito", icon: "/images/card.svg" },
  pix: { label: "Pix", icon: "/images/pix.svg" },
  boleto: { label: "Boleto", icon: "/images/boleto.svg" }
};

const statusConfig: Record<
  SaleStatus,
  { label: string; textClass: string; badgeClass: string }
> = {
  aprovada: {
    label: "Aprovada",
    textClass: "text-emerald-400",
    badgeClass:
      "bg-emerald-500/10 text-[#0a9814]"
  },
  recusada: {
    label: "Recusada",
    textClass: "text-red-400",
    badgeClass: "bg-red-500/10 text-[#6b1513]"
  },
  expirada: {
    label: "Expirada",
    textClass: "text-zinc-400",
    badgeClass: "bg-zinc-600/20 text-foreground/20"
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });

const buildPaginationItems = (totalPages: number): (number | string)[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | string)[] = [];

  for (let page = 1; page <= 3; page += 1) {
    pages.push(page);
  }

  pages.push("...");

  for (let page = totalPages - 2; page <= totalPages; page += 1) {
    pages.push(page);
  }

  return pages;
};

const ActionButton = ({
  icon: Icon,
  label
}: {
  icon: LucideIcon;
  label: string;
}) => (
  <button
    type="button"
    className="flex h-12 w-12 items-center justify-center rounded-xl border border-muted bg-background/40 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    aria-label={label}
  >
    <Icon className="h-5 w-5" aria-hidden />
  </button>
);

const MetricCardChart = ({
  data,
  gradientId
}: {
  data: MetricCard["data"];
  gradientId: string;
}) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#9f5cff" stopOpacity={0.6} />
          <stop offset="95%" stopColor="#9f5cff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <Tooltip
        cursor={{ stroke: "var(--primary)", strokeWidth: 1 }}
        contentStyle={{
          backgroundColor: "var(--card)",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          fontSize: "12px"
        }}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="#a855f7"
        strokeWidth={2}
        fillOpacity={1}
        fill={`url(#${gradientId})`}
        isAnimationActive={false}
      />
    </AreaChart>
  </ResponsiveContainer>
);

const SalesTableRow = ({ sale }: { sale: Sale }) => {
  const payment = paymentMethods[sale.paymentMethod];
  const status = statusConfig[sale.status];
  const saleDate = new Date(sale.saleDate);
  const dateLabel = saleDate.toLocaleDateString("pt-BR");
  const timeLabel = saleDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <tr className="border-t text-center border-muted/20 transition-colors hover:bg-card/20">
      <td className="px-6 py-4 text-sm font-semibold text-foreground/90">
        {sale.id}
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-card-foreground">{sale.productName}</p>
        <p className="text-xs text-muted-foreground">{sale.productType}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-card-foreground">{sale.buyerName}</p>
        <p className="text-xs text-muted-foreground">{sale.buyerEmail}</p>
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-card-foreground">
        {sale.saleType}
      </td>
      <td className="px-6 py-4 text-sm">
        <p className="font-semibold text-card-foreground">{dateLabel}</p>
        <p className="text-xs text-muted-foreground">às {timeLabel}</p>
      </td>
      <td className="px-6 py-4">
          <span className="flex items-center justify-center">
            <Image
              src={payment.icon}
              alt={payment.label}
              width={60}
              height={60}
              className="h-12 w-12"
            />
          </span>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-card-foreground">
          {formatCurrency(sale.total)}
        </p>
        <p className="text-xs text-muted-foreground">{sale.plan}</p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-[8px] px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
};

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setFilterOpen] = useState(false);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredSales = useMemo(() => {
    if (!normalizedSearch) return salesHistory;
    return salesHistory.filter(sale => {
      const payment = paymentMethods[sale.paymentMethod].label.toLowerCase();
      const status = statusConfig[sale.status].label.toLowerCase();
      return [
        sale.id,
        sale.productName,
        sale.productType,
        sale.buyerName,
        sale.buyerEmail,
        sale.saleType,
        payment,
        status
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSales.length / ROWS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredSales.slice(start, start + ROWS_PER_PAGE);
  }, [filteredSales, currentPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages),
    [totalPages]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filterAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (filterAreaRef.current && !filterAreaRef.current.contains(target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DashboardLayout
      userName="Zuptos"
      userLocation="RJ"
      pageTitle="Vendas"
    >
      <div className="min-h-full py-4">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3">
          <section className="grid md:grid-cols-3 md:gap-[30px]">
            {metricCards.map(card => {
              const gradientId = `metric-chart-${card.id}`;
              const isPositive = card.change >= 0;
              const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
              return (
                <article
                  key={card.id}
                  className="rounded-[8px] border border-muted bg-card/40 px-6 py-5"
                >
                  <h1 className="text-[19px] font-semibold text-muted-foreground">
                    {card.title}
                  </h1>
                  <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <p className="text-[25px] font-semibold text-foreground/90">
                      {card.id === "total-vendas"
                        ? card.value.toString().padStart(2, "0")
                        : formatCurrency(card.value)}
                    </p>
                  
                  <div
                    className={`flex items-center gap-2 text-[13px] font-medium ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    <ChangeIcon className="h-4 w-4" aria-hidden />
                    <span>
                      {`${isPositive ? "+" : ""}${card.change
                        .toFixed(1)
                        .replace(".", ",")}%`}
                      <span className="ml-1 text-muted-foreground">
                        vs o período anterior
                      </span>
                    </span>
                  </div>
                  </div>
                    <div className="h-20 w-28">
                      <MetricCardChart data={card.data} gradientId={gradientId} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="space-y-3">
            <div className="flex justify-end gap-3">
              <label className="flex w-[454px] h-[49px] items-center gap-3 rounded-[8px] border border-muted bg-background px-4 py-3 text-xs text-muted-foreground focus-within:border-primary/60 focus-within:text-primary">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Buscar por CPF, ID da transação, e-mail ou nome"
                  className="w-full bg-transparent text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <div className="relative flex items-center gap-2" ref={filterAreaRef}>
                <button
                  type="button"
                  onClick={() => setFilterOpen(prev => !prev)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-muted bg-background/40 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Filtrar vendas"
                >
                  <Filter className="h-5 w-5" aria-hidden />
                </button>
                <ActionButton icon={Eye} label="Visualizar configurações" />
                <ActionButton icon={Upload} label="Exportar vendas" />
                <SalesFilterPanel
                  isOpen={isFilterOpen}
                  onClose={() => setFilterOpen(false)}
                  onApply={() => setFilterOpen(false)}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-muted bg-card">
              <table className="min-w-full">
                <thead className="bg-card/30 text-sora text-muted-foreground">
                  <tr className="h-[52px]">
                    {[
                      "ID",
                      "Produto",
                      "Comprador",
                      "Tipo de venda",
                      "Data de venda",
                      "Método",
                      "Valor",
                      "Status"
                    ].map(column => (
                      <th key={column} className="px-2 py-2 font-semibold text-center">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-10 align-middle text-center text-sm text-muted-foreground"
                      >
                        Nenhuma venda encontrada para o filtro aplicado.
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map(sale => (
                      <SalesTableRow key={sale.id} sale={sale} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mx-auto h-[50px] flex w-full max-w-[1279px] items-center justify-between rounded-[8px] py-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 rounded-[8px] border border-muted px-4 py-2 font-medium text-card-foreground transition-colors bg-foreground/10 disabled:opacity-40 ${
                  currentPage === 1 ? "" : "hover:border-primary/60 hover:text-primary"
                }`}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Anterior
              </button>

              <div className="flex flex-wrap items-center justify-center gap-1">
                {paginationItems.map((item, index) => {
                  if (typeof item === "string") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground/70"
                      >
                        {item}
                      </span>
                    );
                  }
                  const isActive = item === currentPage;
                  return (
                    <button
                      key={`page-${item}`}
                      type="button"
                      onClick={() => handlePageChange(item)}
                      className={`h-9 w-9 rounded-[8px] px-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent text-card-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 rounded-[8px] border border-muted px-4 py-2 font-medium bg-foreground/10 text-card-foreground transition-colors disabled:opacity-40 ${
                  currentPage === totalPages
                    ? ""
                    : "hover:border-primary/60 hover:text-primary"
                }`}
              >
                Próximo
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
        </section>
      </div>
    </div>
  </DashboardLayout>
);
}

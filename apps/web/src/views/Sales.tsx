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
  Eye,
  Filter,
  Search,
  Upload,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import salesData from "@/data/salesData.json";
import SalesFilterPanel, { SalesFilters, OfferFilter } from "@/views/components/SalesFilterPanel";
import SalesDetailPanel from "@/views/components/SalesDetailPanel";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";

export type PaymentMethod = "credit_card" | "pix" | "boleto";
export type SaleStatus = "aprovada" | "recusada" | "expirada";

export interface Sale {
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
  coupon?: string;
  utm?: string;
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

const offerSubscriptionKeywords = ["mensal", "trimestral", "assinatura", "anual"];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });

const getOfferType = (sale: Sale): OfferFilter => {
  const normalizedPlan = sale.plan.toLowerCase();
  const isSubscription = offerSubscriptionKeywords.some(keyword =>
    normalizedPlan.includes(keyword)
  );
  return isSubscription ? "assinatura" : "preco_unico";
};

const matchesSearchTerm = (sale: Sale, search: string) => {
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
    .includes(search);
};

const ActionButton = ({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex h-12 w-12 items-center justify-center rounded-xl border px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
      active
        ? "border-primary bg-primary/10 text-primary"
        : "border-muted bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-primary"
    }`}
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

const initialFilters: SalesFilters = {
  dateFrom: "",
  dateTo: "",
  product: "",
  paymentMethod: "",
  offers: [],
  statuses: [],
  buyerEmail: "",
  coupon: "",
  tipos: [],
  vendedor: [],
  utm: ""
};

export default function Sales() {
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [hideSensitive, setHideSensitive] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>(initialFilters);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const handleFiltersChange = (patch: Partial<SalesFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  };
  const handleApplyFilters = () => {
    setFilterOpen(false);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredSales = useMemo(() => {
    const lowerIncludes = (value: string | undefined, search: string) =>
      !search || (value ?? "").toLowerCase().includes(search);
    const matchesArrayFilter = <T extends string>(value: T, selected: T[]) =>
      selected.length === 0 || selected.includes(value);
    const isWithinDateRange = (date: Date) => {
      if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && date > new Date(filters.dateTo)) return false;
      return true;
    };

    const productSearch = filters.product.trim().toLowerCase();
    const paymentSearch = filters.paymentMethod.trim().toLowerCase();
    const buyerEmailSearch = filters.buyerEmail.trim().toLowerCase();
    const couponSearch = filters.coupon.trim().toLowerCase();
    const utmSearch = filters.utm.trim().toLowerCase();

    return salesHistory.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const paymentLabel = paymentMethods[sale.paymentMethod].label.toLowerCase();
      const couponValue = sale.coupon?.toLowerCase();
      const utmValue = sale.utm?.toLowerCase();
      const offerType = getOfferType(sale);

      return (
        (!normalizedSearch || matchesSearchTerm(sale, normalizedSearch)) &&
        isWithinDateRange(saleDate) &&
        lowerIncludes(sale.productName, productSearch) &&
        lowerIncludes(paymentLabel, paymentSearch) &&
        matchesArrayFilter(sale.status, filters.statuses) &&
        matchesArrayFilter(offerType, filters.offers) &&
        lowerIncludes(sale.buyerEmail, buyerEmailSearch) &&
        lowerIncludes(couponValue, couponSearch) &&
        matchesArrayFilter(sale.productType, filters.tipos) &&
        matchesArrayFilter(sale.saleType, filters.vendedor) &&
        lowerIncludes(utmValue, utmSearch)
      );
    });
  }, [normalizedSearch, filters]);

  useEffect(() => {
    const updateRows = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width >= 1900) setRowsPerPage(7);
      else if (width >= 1600) setRowsPerPage(6);
      else setRowsPerPage(5);
    };
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  const filterAreaRef = useRef<HTMLDivElement>(null);

  const salesColumns: Column<Sale>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        width: "10%",
        cellClassName: "whitespace-nowrap font-semibold text-foreground/90 text-fs-body px-3 py-3",
        render: sale => sale.id
      },
      {
        id: "product",
        header: "Produto",
        width: "17%",
        cellClassName: "px-3 py-3",
        render: sale => (
          <div className="flex flex-col">
            <p className="font-semibold text-card-foreground truncate">{sale.productName}</p>
            <p className="text-fs-meta text-muted-foreground truncate">{sale.productType}</p>
          </div>
        )
      },
      {
        id: "buyer",
        header: "Comprador",
        width: "17%",
        cellClassName: "px-3 py-3",
        render: sale => {
          const buyerLabel = hideSensitive ? "..." : sale.buyerName;
          const emailLabel = hideSensitive ? "..." : sale.buyerEmail;
          return (
            <div className="flex flex-col">
              <p className="font-semibold text-card-foreground truncate">{buyerLabel}</p>
              <p className="text-fs-meta text-muted-foreground truncate">{emailLabel}</p>
            </div>
          );
        }
      },
      {
        id: "saleType",
        header: "Tipo de venda",
        width: "11%",
        cellClassName: "px-3 py-3 whitespace-nowrap text-fs-body font-semibold text-card-foreground",
        render: sale => sale.saleType
      },
      {
        id: "saleDate",
        header: "Data de venda",
        width: "13%",
        cellClassName: "px-3 py-3 text-fs-body",
        render: sale => {
          const saleDate = new Date(sale.saleDate);
          const dateLabel = saleDate.toLocaleDateString("pt-BR");
          const timeLabel = saleDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          return (
            <div className="flex flex-col">
              <p className="font-semibold text-card-foreground">{dateLabel}</p>
              <p className="text-fs-meta text-muted-foreground">às {timeLabel}</p>
            </div>
          );
        }
      },
      {
        id: "payment",
        header: "Método",
        width: "10%",
        cellClassName: "px-3 py-3",
        render: sale => {
          const payment = paymentMethods[sale.paymentMethod];
          return (
            <span className="flex items-center justify-center">
              <Image
                src={payment.icon}
                alt={payment.label}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </span>
          );
        }
      },
      {
        id: "total",
        header: "Valor",
        width: "12%",
        cellClassName: "px-3 py-3",
        render: sale => (
          <div className="flex flex-col">
            <p className="font-semibold text-card-foreground whitespace-nowrap">{hideSensitive ? "..." : formatCurrency(sale.total)}</p>
            <p className="text-fs-meta text-muted-foreground truncate">{hideSensitive ? "..." : sale.plan}</p>
          </div>
        )
      },
      {
        id: "status",
        header: "Status",
        width: "10%",
        cellClassName: "px-3 py-3",
        render: sale => {
          const status = statusConfig[sale.status];
          return (
            <span
              className={`inline-flex min-w-[70px] items-center justify-center rounded-[8px] px-2 py-[6px] text-[11px] font-semibold leading-tight ${status.badgeClass}`}
            >
              {status.label}
            </span>
          );
        }
      }
    ],
    [hideSensitive]
  );

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
        <div
          className="mx-auto flex 2xl:w-[1500px] xl:w-[1100px] flex-col gap-2 2xl:px-4 xl:px-6"
          style={{ maxWidth: "var(--dash-layout-width)" }}
        >
          <section className="grid gap-2 md:grid-cols-3">
            {metricCards.map(card => {
              const gradientId = `metric-chart-${card.id}`;
              const isPositive = card.change >= 0;
              const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
              const chartData = hideSensitive
                ? card.data.map(entry => ({ ...entry, value: 0 }))
                : card.data;
              const displayValue = hideSensitive
                ? "..."
                : card.id === "total-vendas"
                  ? card.value.toString().padStart(2, "0")
                  : formatCurrency(card.value);
              return (
                <article
                  key={card.id}
                  className="rounded-[8px] xl:h-[120px] 2xl:h-[140px] border border-muted bg-card/60 2xl:px-6 2xl:py-5 xl:px-4 xl:py-4"
                >
                  <h1
                    className="xl:text-md 2xl:text-lg font-semibold text-muted-foreground"
                  >
                    {card.title}
                  </h1>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-start gap-2">
                      <p className="xl:text-md 2xl:text-lg">
                        {displayValue}
                      </p>

                        <div
                          className={`flex items-center gap-2 xl:text-xs 2xl:text-xs ${
                            isPositive ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          <ChangeIcon className="h-4 w-4" aria-hidden />
                          <span>
                            {hideSensitive ? "--" : `${isPositive ? "+" : ""}${card.change
                              .toFixed(1)
                              .replace(".", ",")}%`}
                            {!hideSensitive && (
                              <span className="ml-1 text-muted-foreground">
                                vs o período anterior
                              </span>
                            )}
                          </span>
                        </div>
                    </div>
                    <div
                      className="flex-shrink-0 xl:w-[78px] xl:h-[54px] 2xl:w-[104px] 2xl:h-[66px]"
                    >
                      <MetricCardChart data={chartData} gradientId={gradientId} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <label
                className="flex h-[46px] items-center gap-3 rounded-[8px] border border-muted bg-background px-3 text-fs-body text-muted-foreground focus-within:border-primary/60 focus-within:text-primary"
              >
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Buscar por CPF, ID da transação, e-mail ou nome"
                  className="2xl:w-[300px] xl:w-[200px] w-full bg-transparent text-fs-body text-card-foreground placeholder:text-muted-foreground focus:outline-none"
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
                <ActionButton
                  icon={Eye}
                  label={hideSensitive ? "Mostrar valores" : "Ocultar valores"}
                  active={hideSensitive}
                  onClick={() => setHideSensitive(prev => !prev)}
                />
                <button
                  type="button"
                  onClick={() => setExportModalOpen(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-muted bg-background/50 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Exportar vendas"
                >
                  <Upload className="h-5 w-5" aria-hidden />
                </button>
                <SalesFilterPanel
                  isOpen={isFilterOpen}
                  onClose={() => setFilterOpen(false)}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onApply={handleApplyFilters}
                />
              </div>
            </div>

            <PaginatedTable<Sale>
              data={filteredSales}
              columns={salesColumns}
              rowKey={sale => sale.id}
              rowsPerPage={rowsPerPage}
              emptyMessage="Nenhuma venda encontrada para o filtro aplicado."
              tableContainerClassName="overflow-hidden xl:max-w-[1200px] rounded-[8px] border border-muted bg-card"
              tableClassName="xl:max-w-[1200px] 2xl:text-fs-body"
              headerRowClassName="bg-card/30 text-fs-body h-[44px]"
              paginationContainerClassName="mx-auto w-full max-w-[1200px]"
              wrapperClassName="w-full xl:max-w-[1200px]"
              onRowClick={setSelectedSale}
              minWidth="xl:1000px 2xl:1300px"
            />
        </section>
      </div>
    </div>
    {selectedSale && (
      <SalesDetailPanel sale={selectedSale} onClose={() => setSelectedSale(null)} />
    )}
    {isExportModalOpen && (
      <aside className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="w-[320px] rounded-[16px] bg-card px-6 py-6 text-card-foreground shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold">Exportar relatório</p>
            <button
              type="button"
              className="rounded-full p-1 text-muted-foreground hover:text-primary"
              onClick={() => setExportModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ao clicar em Confirmar, enviaremos o relatório para o e-mail associado à conta. Esse processo pode levar alguns minutos.
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-[10px] bg-gradient-to-r from-[#9f5cff] to-[#c14eff] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90"
            onClick={() => setExportModalOpen(false)}
          >
            Confirmar
          </button>
        </div>
      </aside>
    )}
  </DashboardLayout>
);
}

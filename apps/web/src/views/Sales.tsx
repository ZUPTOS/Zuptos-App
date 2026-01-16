'use client';

import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Eye, Filter, Search, Upload, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { salesApi } from "@/lib/api";
import SalesFilterPanel, { SalesFilters, OfferFilter } from "@/views/components/SalesFilterPanel";
import SalesDetailPanel from "@/views/components/SalesDetailPanel";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { useAuth } from "@/contexts/AuthContext";
import type { MetricCard, PaymentMethod, Sale, SaleStatus } from "@/views/sales/types";

const emptyMetrics: MetricCard[] = [
  { id: "faturamento", title: "Faturamento", value: 0, change: 0, data: [] },
  { id: "receita", title: "Receita líquida", value: 0, change: 0, data: [] },
  { id: "total-vendas", title: "Total de vendas", value: 0, change: 0, data: [] }
];

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
  const { token } = useAuth();
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [hideSensitive, setHideSensitive] = useState(false);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>(initialFilters);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [metricCards, setMetricCards] = useState<MetricCard[]>(emptyMetrics);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
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

    return sales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const paymentLabel = (paymentMethods[sale.paymentMethod] ?? paymentMethods.credit_card).label.toLowerCase();
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
  }, [normalizedSearch, filters, sales]);

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
        width: "12%",
        cellClassName: "px-3 py-3",
        render: sale => {
          const fullId = sale.id ?? "-";
          const shortId = fullId.length > 8 ? `${fullId.slice(0, 8)}...` : fullId;
          return (
            <span className="truncate text-sm font-semibold text-card-foreground" title={fullId}>
              {shortId}
            </span>
          );
        }
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
          const payment = paymentMethods[sale.paymentMethod] ?? paymentMethods.credit_card;
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

  const normalizeStatus = useCallback((status?: string): SaleStatus => {
    const value = (status ?? "").toLowerCase();
    if (["completed", "success", "approved"].includes(value)) return "aprovada";
    if (["failed", "refused", "canceled", "cancelled", "denied", "rejected"].includes(value)) return "recusada";
    return "expirada";
  }, []);

  const normalizePayment = useCallback((method?: string): PaymentMethod => {
    const value = (method ?? "").toLowerCase();
    if (value.includes("pix")) return "pix";
    if (value.includes("boleto")) return "boleto";
    return "credit_card";
  }, []);

  const mapSaleItem = useCallback(
    (item: Record<string, unknown>): Sale => {
      const amount = item.amount as unknown;
      const amountValue =
        typeof amount === "number"
          ? amount
          : typeof amount === "string"
            ? Number(amount)
            : 0;
      const saleId =
        (item.sale_id as string | undefined) ??
        (item.id as string | undefined) ??
        (item.product_id as string | undefined) ??
        "sem-id";
      const productName =
        (typeof (item as { product?: { name?: string } }).product?.name === "string" &&
          (item as { product?: { name?: string } }).product?.name) ||
        (item.product_name as string | undefined) ||
        (item.productName as string | undefined) ||
        "Produto";
      return {
        id: saleId,
        productName,
        productType: (item.sale_type as string | undefined) ?? "Produto",
        buyerName: (item.buyer_name as string | undefined) ?? "-",
        buyerEmail: (item.buyer_email as string | undefined) ?? "-",
        saleType: (item.sale_type as string | undefined) ?? "Produtor",
        saleDate: (item.sale_date as string | undefined) ?? new Date().toISOString(),
        paymentMethod: normalizePayment(item.payment_method as string | undefined),
        plan: (item.sale_type as string | undefined) ?? "Plano",
        total: Number.isFinite(amountValue) ? amountValue : 0,
        status: normalizeStatus(item.status as string | undefined),
        coupon: item.coupon as string | undefined,
        utm: item.utm as string | undefined,
        orderBumps: Array.isArray((item as { productOfferBumps?: unknown }).productOfferBumps)
          ? ((item as { productOfferBumps?: unknown[] }).productOfferBumps as Sale["orderBumps"])
          : undefined
      };
    },
    [normalizePayment, normalizeStatus]
  );

  const buildMetrics = useCallback((list: Sale[]): MetricCard[] => {
    const total = list.reduce((acc, item) => acc + (item.total ?? 0), 0);
    const approvedTotal = list
      .filter(item => item.status === "aprovada")
      .reduce((acc, item) => acc + (item.total ?? 0), 0);
    return [
      { id: "faturamento", title: "Faturamento", value: total, change: 0, data: [] },
      { id: "receita", title: "Receita líquida", value: approvedTotal, change: 0, data: [] },
      { id: "total-vendas", title: "Total de vendas", value: list.length, change: 0, data: [] }
    ];
  }, []);

  useEffect(() => {
    let active = true;

    const loadSales = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await salesApi.listSales(token ?? undefined);
        console.log("[sales] Resposta do servidor:", response);

        // O backend pode retornar { sales: [...] } ou um array direto
        const rawList = Array.isArray(response) ? response : response.sales ?? [];
        const normalizedSales: Sale[] = (rawList as Record<string, unknown>[]).map(mapSaleItem);

        if (!active) return;
        setSales(normalizedSales);
        setMetricCards(buildMetrics(normalizedSales));
      } catch (error) {
        console.error("Erro ao carregar vendas:", error);
        if (!active) return;
        setFetchError("Não foi possível carregar as vendas");
        setSales([]);
        setMetricCards(emptyMetrics);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadSales();
    return () => {
      active = false;
    };
  }, [token, mapSaleItem, buildMetrics]);

  const handleRowClick = useCallback(
    async (sale: Sale) => {
      if (!sale?.id) return;
      setIsLoading(true);
      try {
        const detail = await salesApi.getSaleById(sale.id, token ?? undefined);
        const payload = ((detail as { sale?: unknown }).sale ?? detail) as Record<string, unknown>;
        const mapped = mapSaleItem(payload);
        setSelectedSale(mapped);
      } catch (err) {
        console.error("Erro ao carregar detalhes da venda:", err);
        setSelectedSale(sale);
      } finally {
        setIsLoading(false);
      }
    },
    [mapSaleItem, token]
  );

  return (
    <DashboardLayout
      userName="Zuptos"
      userLocation="RJ"
      pageTitle="Vendas"
    >
      <div className="min-h-full py-4">
        <div
          className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 sm:px-4 lg:px-6"
          style={{ maxWidth: "var(--dash-layout-width, 1200px)" }}
        >
          <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {metricCards.map(card => {
              const displayValue = hideSensitive
                ? "..."
                : card.id === "total-vendas"
                  ? card.value.toString().padStart(2, "0")
                  : formatCurrency(card.value);
              return (
                <article
                  key={card.id}
                  className="rounded-[8px] xl:h-[90px] 2xl:h-[110px] border border-muted bg-card/60 2xl:px-6 2xl:py-5 xl:px-4 xl:py-4"
                >
                  <h1
                    className="xl:text-[16px] 2xl:text-[18px] font-semibold text-muted-foreground"
                  >
                    {card.title}
                  </h1>
                  <p className="mt-2 xl:text-[18px] 2xl:text-[22px] font-semibold text-foreground">
                    {displayValue}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
              <label
                className="flex h-[46px] items-center gap-3 rounded-[8px] border border-muted bg-background px-3 text-fs-body text-muted-foreground focus-within:border-primary/60 focus-within:text-primary md:min-w-[260px] lg:min-w-[320px]"
              >
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Buscar por CPF, ID da transação, e-mail ou nome"
                  className="w-full bg-transparent text-fs-body text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <div className="relative flex flex-wrap items-center gap-2" ref={filterAreaRef}>
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
              isLoading={isLoading}
              loadingRows={rowsPerPage}
              emptyMessage="Nenhuma venda encontrada para o filtro aplicado."
              tableContainerClassName="overflow-x-auto rounded-[8px] border border-muted bg-card"
              tableClassName="min-w-[960px] 2xl:text-fs-body"
              headerRowClassName="bg-card/30 text-fs-body h-[44px]"
              paginationContainerClassName="mx-auto w-full max-w-[1200px]"
              wrapperClassName="w-full"
              onRowClick={handleRowClick}
              minWidth="xl:1000px 2xl:1300px"
            />
        </section>
      </div>
    </div>
    {selectedSale && (
      <SalesDetailPanel sale={selectedSale} onClose={() => setSelectedSale(null)} />
    )}
    {isLoading && (
                    <div className="p-4 text-sm text-muted-foreground" aria-live="polite" />
    )}
    {fetchError && !isLoading && (
      <div className="p-4 text-sm text-red-400">{fetchError}</div>
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
            className="mt-6 w-full rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110"
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

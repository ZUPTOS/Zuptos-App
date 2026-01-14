'use client';

import { useAuth } from "@/contexts/AuthContext";
import { salesApi } from "@/lib/api";
import type { Column } from "@/components/PaginatedTable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaymentMethod, Sale, SaleStatus, MetricCard } from "./types";
import type { SalesFilters, OfferFilter } from "@/views/components/SalesFilterPanel";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";

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

const initialFilters: SalesFilters = {
  product: "",
  paymentMethod: "",
  dateFrom: "",
  dateTo: "",
  offers: [],
  statuses: [],
  buyerEmail: "",
  coupon: "",
  tipos: [],
  vendedor: [],
  utm: ""
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
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-12 items-center gap-2 rounded-xl border px-3 text-fs-body font-semibold transition-colors ${
      active
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-muted bg-background/40 text-muted-foreground hover:border-primary/60 hover:text-primary"
    }`}
    aria-label={label}
  >
    <Icon className="h-5 w-5" aria-hidden />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export function useSales() {
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
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const filterAreaRef = useRef<HTMLDivElement>(null);

  const handleFiltersChange = (patch: Partial<SalesFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  };
  const handleApplyFilters = () => {
    setFilterOpen(false);
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const getOfferType = (sale: Sale): OfferFilter => {
    const normalizedPlan = sale.plan.toLowerCase();
    const isSubscription = offerSubscriptionKeywords.some(keyword =>
      normalizedPlan.includes(keyword)
    );
    return isSubscription ? "assinatura" : "preco_unico";
  };

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
      const amountValue =
        typeof item.amount === "number"
          ? item.amount
          : typeof item.amount === "string"
            ? Number(item.amount)
            : 0;
      const saleId =
        (item.sale_id as string | undefined) ??
        (item.id as string | undefined) ??
        (item.product_id as string | undefined) ??
        "sem-id";
      const productName =
        (item.product && typeof (item.product as { name?: string }).name === "string"
          ? (item.product as { name?: string }).name
          : undefined) ||
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
      setIsDetailLoading(true);
      try {
        const detail = await salesApi.getSaleById(sale.id, token ?? undefined);
        const payload = ((detail as { sale?: unknown }).sale ?? detail) as Record<string, unknown>;
        const mapped = mapSaleItem(payload);
        setSelectedSale(mapped);
      } catch (err) {
        console.error("Erro ao carregar detalhes da venda:", err);
        setSelectedSale(sale);
      } finally {
        setIsDetailLoading(false);
      }
    },
    [mapSaleItem, token]
  );

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

  const metricsCardsFormatted = useMemo(
    () =>
      metricCards.map(card => ({
        ...card,
        displayValue: hideSensitive
          ? "..."
          : card.id === "total-vendas"
            ? card.value.toString().padStart(2, "0")
            : formatCurrency(card.value)
      })),
    [metricCards, hideSensitive]
  );

  return {
    token,
    rowsPerPage,
    setRowsPerPage,
    searchTerm,
    setSearchTerm,
    isFilterOpen,
    setFilterOpen,
    hideSensitive,
    setHideSensitive,
    isExportModalOpen,
    setExportModalOpen,
    filters,
    setFilters,
    handleFiltersChange,
    handleApplyFilters,
    filteredSales,
    salesColumns,
    selectedSale,
    setSelectedSale,
    metricCards,
    metricsCardsFormatted,
    isLoading,
    fetchError,
    handleRowClick,
    filterAreaRef,
    paymentMethods,
    statusConfig,
    ActionButton,
    isDetailLoading
  };
}

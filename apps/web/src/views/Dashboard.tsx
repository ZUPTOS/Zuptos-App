'use client';

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { Search, ChevronDown, ArrowUpRight, X, Eye } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";
import mockData from "@/data/mockData.json";
import DetalhamentoIcon from "@/components/icons/DetalhamentoIcon";
import { useTheme } from "@/contexts/ThemeContext";

type ChartType = "daily" | "monthly" | "yearly";
type VisualizationOption = (typeof fallbackVisualizationOptions)[number];

const HEALTH_COLORS = ["var(--health-1)", "var(--health-2)", "var(--health-3)", "var(--health-4)"];
const HEALTH_FOCUS_COLOR = "var(--health-3)";
const cardSurface = "rounded-[8px] border border-muted bg-card";

const REVENUE_LINE_COLORS = [
  "#5b03c0",
  "#b204b5",
  "#4a8430",
  "#0da0a8",
  "#ad2d37",
  "#ffb800"
];

const fallbackVisualizationOptions = [
  { id: "faturamento", label: "Faturamento", key: "faturamento", color: REVENUE_LINE_COLORS[0] },
  { id: "receita_liquida", label: "Receita líquida", key: "receitaLiquida", color: REVENUE_LINE_COLORS[1] },
  { id: "vendas", label: "Vendas", key: "vendas", color: REVENUE_LINE_COLORS[2] },
  { id: "ticket_medio", label: "Ticket médio", key: "ticketMedio", color: REVENUE_LINE_COLORS[3] },
  { id: "chargeback", label: "Chargeback", key: "chargeback", color: REVENUE_LINE_COLORS[4] },
  { id: "reembolso", label: "Reembolso", key: "reembolso", color: REVENUE_LINE_COLORS[5] }
];

const visualizationOptionsConfig =
  (mockData.revenue as { lines?: typeof fallbackVisualizationOptions }).lines?.length
    ? ((mockData.revenue as { lines: typeof fallbackVisualizationOptions }).lines).map(
        (line, idx) => ({
          ...line,
          color: REVENUE_LINE_COLORS[idx % REVENUE_LINE_COLORS.length]
        })
      )
    : fallbackVisualizationOptions;

const filterModalGroups = [
  {
    id: "produtor",
    label: "Produtor",
    children: [
      { id: "produto_01", label: "Produto 01" },
      { id: "produto_02", label: "Produto 02" },
      { id: "produto_03", label: "Produto 03" }
    ]
  },
  {
    id: "co_produtor",
    label: "Co-Produtor",
    children: [
      { id: "co_produtor_01", label: "Produto 01" },
      { id: "co_produtor_02", label: "Produto 02" },
      { id: "co_produtor_03", label: "Produto 03" }
    ]
  }
] as const;

const paymentIconMap: Record<string, string> = {
  credit_card: "/images/card.svg",
  pix: "/images/pix.svg",
  boleto: "/images/boleto.svg"
};

const PAYMENT_LINE_COLOR = "#6c27d7";

const JOURNEY_HIGHLIGHT_COLOR = "#5823b2";
const JOURNEY_INACTIVE_COLOR = "#9D9FA3";
const REVENUE_TOOLTIP_DATE = "01/NOV/2025";

const currencyMetricKeys = new Set(["faturamento", "receitaLiquida", "ticketMedio"]);

const formatTooltipValue = (value: number, metricKey?: string) => {
  if (Number.isNaN(value)) return "--";
  if (metricKey && currencyMetricKeys.has(metricKey)) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });
  }
  return value.toLocaleString("pt-BR");
};

type ChartTooltipProps = TooltipProps<ValueType, NameType> & {
  chartType: ChartType;
  options: VisualizationOption[];
};

const ChartTooltip = ({ active, payload, options }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const header = REVENUE_TOOLTIP_DATE;

  return (
    <div className="min-w-[210px] rounded-[16px] border border-card bg-card px-4 py-3 text-xs text-card-foreground shadow-xl">
      <p className="mb-3 font-sora text-fs-mini text-card-foreground/85">
        {header}
      </p>
      <div className="flex flex-col gap-2">
        {payload.map((item, index) => {
          if (!item) return null;
          const option = options.find(opt => opt.key === item.dataKey);
          const labelText = option?.label ?? (item.name ? String(item.name) : "");
          const metricKey = option?.key ?? (typeof item.dataKey === "string" ? item.dataKey : undefined);
          const numericValue =
            typeof item.value === "number" ? item.value : Number(item.value ?? Number.NaN);
          const formattedValue = formatTooltipValue(numericValue, metricKey);
          const color = option?.color ?? item.color ?? "#ffffff";
          return (
            <div key={`${labelText}-${index}`} className="flex items-center gap-2 leading-tight">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-fs-caption font-sora">
                {labelText}: <span className="text-card-foreground/90">{formattedValue}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const visualizationOptions = visualizationOptionsConfig;
  const [chartType] = useState<ChartType>("daily");
  const [isVisualizationOpen, setVisualizationOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    visualizationOptions.forEach(option => {
      initial[option.id] = true;
    });
    return initial;
  });
  const [isFilterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({});

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  const toggleParentFilter = (groupId: string) => {
    const group = filterModalGroups.find(item => item.id === groupId);
    if (!group) return;
    setSelectedFilters(prev => {
      const childrenIds = group.children.map(child => child.id);
      const allChildrenSelected = childrenIds.every(id => prev[id]);
      const shouldSelect = !allChildrenSelected;
      const next = { ...prev, [groupId]: shouldSelect };
      childrenIds.forEach(id => {
        next[id] = shouldSelect;
      });
      return next;
    });
  };

  const toggleChildFilter = (groupId: string, childId: string) => {
    const group = filterModalGroups.find(item => item.id === groupId);
    if (!group) return;
    setSelectedFilters(prev => {
      const next = { ...prev, [childId]: !prev[childId] };
      const childrenIds = group.children.map(child => child.id);
      const allSelected = childrenIds.every(id => next[id]);
      next[groupId] = allSelected;
      return next;
    });
  };

  const grossRevenueLabel = `R$ ${mockData.revenue.grossRevenue
    .toFixed(2)
    .replace(".", ",")}`;
  const growthPercentageLabel = `${mockData.revenue.growthPercentage
    .toFixed(1)
    .replace(".", ",")}%`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(target)
      ) {
        setFilterDropdownOpen(false);
      }
      if (
        visualizationRef.current &&
        !visualizationRef.current.contains(target)
      ) {
        setVisualizationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setVisibleLines(prev => {
      const next = { ...prev };
      visualizationOptions.forEach(option => {
        if (typeof next[option.id] === "undefined") {
          next[option.id] = true;
        }
      });
      return next;
    });
  }, [visualizationOptions]);

  const chartData = useMemo(() => {
    switch (chartType) {
      case "daily":
        return mockData.revenue.daily;
      case "monthly":
        return mockData.revenue.monthly;
      case "yearly":
        return mockData.revenue.yearly;
    }
  }, [chartType]);

  const axisColor = "var(--muted-foreground)";
  const gridColor = "var(--border)";
  const tooltipStyles = {
    backgroundColor: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "10px",
    fontSize: "8px",
    color: "var(--color-card-foreground)"
  };

  const balanceCards = [
    {
      label: "Saldo disponível",
      value: mockData.account.availableBalance,
      iconSrc: "/images/moeda.svg"
    },
    {
      label: "Saldo pendente",
      value: mockData.account.pendingBalance,
      iconSrc: "/images/saldo.svg"
    }
  ];

  const healthSegments = useMemo(
    () =>
      mockData.account.healthDetails
        .slice(0, 3)
        .map((detail, idx) => ({
          ...detail,
          color: HEALTH_COLORS[idx % HEALTH_COLORS.length]
        })),
    []
  );

  const selectedFiltersCount = useMemo(
    () => Object.values(selectedFilters).filter(Boolean).length,
    [selectedFilters]
  );

  const getPaymentIcon = (id: string) => {
    const iconSrc = paymentIconMap[id];
    if (!iconSrc) return null;
    return (
      <Image
        src={iconSrc}
        alt={`${id} icon`}
        width={48}
        height={48}
        className="h-12 w-12 object-contain"
        style={isLightMode ? { filter: "brightness(0)" } : undefined}
      />
    );
  };

  const handleToggleLine = (id: string) => {
    setVisibleLines(prev => {
      const enabledCount = visualizationOptions.reduce(
        (count, option) => (prev[option.id] !== false ? count + 1 : count),
        0
      );
      const isEnabled = prev[id] !== false;
      if (isEnabled && enabledCount <= 1) {
        return prev;
      }
      return {
        ...prev,
        [id]: !isEnabled
      };
    });
  };

  const linesToRender = useMemo(() => {
    const active = visualizationOptions.filter(option => visibleLines[option.id] !== false);
    return active.length ? active : visualizationOptions;
  }, [visibleLines, visualizationOptions]);

  return (
    <DashboardLayout
      userName={mockData.user.name}
      userLocation={mockData.user.location}
      pageTitle="Dashboard"
    >
      <div
        className="py-5 space-y-3 w-full mx-auto"
        style={{ maxWidth: "var(--dash-layout-width)" }}
      >
        {/* Linha 1 - Data + filtro */}
        <section className="grid grid-cols-[minmax(0,clamp(240px,22vw,320px))_1fr] items-start gap-2">
          <div className="w-full">
            <DateFilter />
          </div>

          <div className="flex justify-end gap-3">
            <div className="relative flex w-full max-w-[451px] items-center gap-3" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setFilterDropdownOpen(prev => !prev)}
                className="flex w-full items-center gap-3 px-5 py-3 rounded-[10px] border border-muted bg-card text-left text-sm text-muted-foreground shadow-none"
              >
                <Search className="w-[16px] h-[16px] text-sora color-muted-foreground" />
                <span className="flex-1 text-sora text-muted-foreground">
                  {selectedFiltersCount > 0
                    ? `${selectedFiltersCount} filtro${selectedFiltersCount > 1 ? "s" : ""} aplicado${selectedFiltersCount > 1 ? "s" : ""}`
                    : "Filtrar por..."}
                </span>
                <ChevronDown className="w-[16px] h-[16px] text-muted-foreground" />
              </button>

              {isFilterDropdownOpen && (
                <div
                  className="absolute left-0 top-[calc(100%+10px)] z-40 rounded-[16px] border border-muted/70 bg-card shadow-none dark:shadow-none dark:shadow-[0_24px_55px_rgba(0,0,0,0.55)]"
                  style={{ width: "clamp(340px, 28vw, 460px)", maxHeight: "420px" }}
                >
                  <div className="flex items-center justify-between border-b border-muted/60 px-5 py-4">
                    <p className="text-fs-body font-semibold text-foreground">Filtrar por...</p>
                    <button
                      type="button"
                      onClick={() => setFilterDropdownOpen(false)}
                      className="text-muted-foreground transition hover:text-foreground"
                      aria-label="Fechar filtros"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-[340px] overflow-y-auto px-4 py-4 pr-2 space-y-4 scrollbar-invisible">
                    {filterModalGroups.map(group => (
                      <div key={group.id} className="space-y-3 rounded-[12px] px-1">
                      <label className="flex items-center gap-[14px] text-fs-body font-semibold text-foreground">
                          <input
                            type="checkbox"
                            className="relative h-[26px] w-[26px] appearance-none rounded border border-border/70 bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:bg-primary checked:border-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                            checked={!!selectedFilters[group.id] || group.children.every(child => selectedFilters[child.id])}
                            onChange={() => toggleParentFilter(group.id)}
                          />
                          <span>{group.label}</span>
                        </label>
                        <div className="space-y-3 pl-10">
                          {group.children.map(child => (
                            <label
                              key={child.id}
                            className="flex items-center gap-[14px] text-fs-small text-muted-foreground"
                            >
                              <input
                                type="checkbox"
                                className="relative h-[26px] w-[26px] appearance-none rounded border border-border/70 bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:bg-primary checked:border-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                                checked={!!selectedFilters[child.id]}
                                onChange={() => toggleChildFilter(group.id, child.id)}
                              />
                              <span>{child.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[10px] border border-border/70 bg-card text-muted-foreground transition hover:text-foreground dark:bg-card/90">
              <Eye className="w-6 h-6" />
            </button>
          </div>
        </section>
        {/* Linha 2 - título, saldos e saúde */}
        <section
          className="grid gap-3"
          style={{
            gridTemplateColumns: `minmax(0, var(--dash-col-main)) minmax(0, var(--dash-col-mid)) minmax(0, var(--dash-col-mid)) minmax(0, var(--dash-col-side))`
          }}
        >
          <div className={`${cardSurface} p-6 flex flex-col justify-between`}>
            <p className="text-fs-small text-muted-foreground">
              Hoje é 8 de setembro, 2025
            </p>
            <h1 className="text-fs-hero text-foreground mb-1">
              Olá, {mockData.user.name}
            </h1>
            <p className="text-fs-small text-muted-foreground">
              Lorem Ipsum is simply dummy text of the printing
            </p>
          </div>

          {balanceCards.map(card => (
            <div
              key={card.label}
              className={`${cardSurface} px-6 justify-center flex flex-col gap-4`}
            >
              <div className="flex w-[118.2px] h-[105.84px] flex-col gap-[12px_17px]">
              <div className="flex items-center gap-2">
                <Image
                  src={card.iconSrc}
                  alt={card.label}
                  width={43.34}
                  height={43.34}
                  style={isLightMode ? { filter: "brightness(0)" } : undefined}
                />
              </div>
                <span className="text-fs-micro text-muted-foreground mb-1">{card.label}</span>
                <span className="text-fs-lead font-semibold leading-none text-muted-foreground">
                  R$ 0{card.value.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          ))}

          {/* Linha 3 - saúde */}
          <div className={`${cardSurface} px-5 py-5 flex flex-col gap-4`}>
            <div className="flex items-center gap-1 rounded-[7px] bg-card">
              {HEALTH_COLORS.map(color => (
                <span
                  key={color}
                  className="rounded-[2px] flex-1 h-[10px] w-[111px]"
                  style={{
                    backgroundColor: color,
                    height: color === HEALTH_FOCUS_COLOR ? "14px" : "10px"
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-[25px] mt-4 flex-col sm:flex-row sm:items-center sm:gap-[12px]">
              <p className="text-fs-display font-semibold text-foreground leading-none">
                {mockData.account.healthScore}
              </p>
              <span className="text-fs-stat text-muted-foreground leading-tight">
                A saúde da conta está{" "}
                <span className="text-foreground font-semibold">boa</span>
              </span>
            </div>

            <div className="flex gap-2 text-fs-mini mt-[13px] text-muted-foreground flex-nowrap">
              {healthSegments.map(detail => (
                <span
                  key={detail.label}
                  className="inline-flex justify-center items-center gap-2 rounded-[8px] px-[6px] py-[6px] whitespace-nowrap bg-foreground/10 text-muted-foreground"
                >
                  {detail.label} {detail.percentage}%
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Linha 3 - gráfico + jornada */}
        <section
          className="grid gap-3"
          style={{
            gridTemplateColumns: `minmax(0, var(--dash-chart-left)) minmax(0, var(--dash-chart-right))`,
            height: "var(--dash-card-height)"
          }}
        >
          <div
            className={`${cardSurface} px-5 py-6 flex flex-col gap-6`}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-fs-title font-sora font-bold text-foreground leading-none">
                    {grossRevenueLabel}
                  </p>
                  <span className="inline-flex items-center justify-between gap-1 rounded-[7px] bg-muted px-2 py-1 border w-[102px] h-[36px] ">
                    <ArrowUpRight className="w-5 h-5 text-lime-400" />
                    <span className="text-fs-meta font-sora font-bold text-foreground">
                      {growthPercentageLabel}
                    </span>
                  </span>
                </div>
                <p className="text-fs-small font-sora text-muted-foreground">Receita Bruta</p>
              </div>
              <div className="relative flex items-center" ref={visualizationRef}>
                <button
                  onClick={() => setVisualizationOpen(prev => !prev)}
                  className="flex items-center justify-center rounded-[16px] text-muted-foreground"
                  aria-label="Abrir opções de visualização"
                  type="button"
                >
                  <DetalhamentoIcon className="h-10 w-10" />
                </button>
                {isVisualizationOpen && (
                  <div
                    className={`${cardSurface} absolute right-0 z-50 mt-3 w-[clamp(260px,22vw,340px)] max-h-[420px] overflow-y-auto p-5 space-y-4`}
                    style={{ top: "calc(100% + 8px)" }}
                  >
                    <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
                      <p className="text-fs-section font-semibold text-foreground">Visualização</p>
                      <button
                        onClick={() => setVisualizationOpen(false)}
                        className="text-muted-foreground transition hover:text-foreground"
                        aria-label="Fechar visualização"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {visualizationOptions.map(option => {
                        const enabled = visibleLines[option.id] !== false;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleToggleLine(option.id)}
                            type="button"
                            aria-pressed={enabled}
                            className={`w-full flex items-center h-[36px] gap-4 rounded-[8px] px-2 py-2 transition duration-200 ${
                              enabled
                                ? "text-foreground"
                                : "text-muted-foreground hover:bg-muted/10"
                            }`}
                          >
                            <span className="flex items-center">
                              <span
                                className={`relative inline-flex h-6 w-12 items-center rounded-full border transition-colors duration-300 ${
                                  enabled ? "border-transparent" : "border-border/60 bg-muted/60"
                                }`}
                                style={
                                  enabled
                                    ? { backgroundColor: option.color }
                                    : { backgroundColor: "var(--muted)" }
                                }
                              >
                                <span
                                  className={`inline-flex h-5 w-5 transform rounded-full transition-all duration-300 ease-out ${
                                    enabled ? "translate-x-6" : "translate-x-1"
                                  }`}
                                  style={{
                                    backgroundColor: enabled ? "#ffffff" : "var(--card)"
                                  }}
                                />
                              </span>
                            </span>
                            <span className="text-fs-lead font-semibold flex-1 text-left">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="1 1" stroke={gridColor} />
                  <XAxis
                    dataKey={
                      chartType === "daily"
                        ? "time"
                        : chartType === "monthly"
                          ? "month"
                          : "year"
                    }
                    stroke={gridColor}
                    style={{ fontSize: "10px" }}
                    tick={{ fill: axisColor, fontSize: 10 }}
                  />
                  <YAxis
                    stroke={gridColor}
                    style={{ fontSize: "10px" }}
                    tick={{ fill: axisColor, fontSize: 10 }}
                  />
                  <Tooltip
                    cursor={{ stroke: gridColor, strokeDasharray: "3 3" }}
                    content={props => (
                      <ChartTooltip
                        {...props}
                        chartType={chartType}
                        options={visualizationOptions}
                      />
                    )}
                  />
                  {linesToRender.map(option => (
                    <Line
                      key={option.id}
                      type="linear"
                      dataKey={option.key}
                      stroke={option.color}
                      strokeWidth={2}
                      dot={false}
                      opacity={1}
                      isAnimationActive
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${cardSurface} w-full py-6 px-5 flex flex-col gap-5`}>
            <div>
              <p className="text-fs-lead font-sora font-bold text-foreground tracking-wide">
                Sua jornada ZUPTOS
              </p>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>
                  Você é <span className="text-fs-meta font-bold" style={{ color: JOURNEY_INACTIVE_COLOR }}>expert</span>
                </span>
                <span>
                  Próximo nível é{" "}
                  <span className="text-fs-meta font-semibold text-foreground/80">
                    {mockData.user.nextLevel}
                  </span>
                </span>
              </div>
            </div>
            <div
              className="w-full h-3 rounded-full overflow-hidden border"
              style={{
                borderColor: JOURNEY_HIGHLIGHT_COLOR,
                backgroundColor: "rgba(88, 35, 178, 0.15)"
              }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${mockData.user.progress}%`,
                  background: `linear-gradient(90deg, ${JOURNEY_HIGHLIGHT_COLOR} 20%, #a768ff 70%, #dbc4ff 100%)`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {mockData.levels.map((level, index) => {
                const isCurrentLevel = level.id === mockData.user.level;
                const isActiveTier = index < 2;
                return (
                  <div
                    key={level.id}
                    className={`${cardSurface} px-3 py-4 text-center transition`}
                    style={{
                      borderColor: isActiveTier ? JOURNEY_HIGHLIGHT_COLOR : "var(--border)",
                      boxShadow: isCurrentLevel ? `0 15px 40px rgba(0,0,0,0.15)` : undefined,
                      backgroundColor: isActiveTier ? "var(--muted)" : "var(--card)"
                    }}
                  >
                    <div
                      className={"mx-auto my-4 h-[106px] w-[72px] rounded-[12px] border " + (isActiveTier ? "border-primary" : "border-")}
                      style={{
                        backgroundColor: "var(--border)",
                        opacity: isActiveTier ? 1 : 0.35,
                        borderColor: "var(--border)"
                      }}
                    />
                    <p className="text-fs-section font-semibold text-foreground">
                      {level.threshold >= 1000 ? `${level.threshold / 1000}k` : level.threshold}
                    </p>
                    <p
                      className="text-fs-section font-medium"
                      style={{
                        color: isActiveTier ? JOURNEY_HIGHLIGHT_COLOR : JOURNEY_INACTIVE_COLOR
                      }}
                    >
                      {level.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Linha 4 - métodos de pagamento */}
        <section
          className="grid gap-3 w-full"
          style={{
            gridTemplateColumns: `repeat(3, minmax(0, var(--dash-pay-col)))`,
            maxWidth: "var(--dash-layout-width)"
          }}
        >
          {mockData.paymentMethods.map(method => (
            <div
              key={method.id}
              className={`${cardSurface} px-4 py-4 w-full`}
            >
              <div className="mb-2 flex flex-col gap-2">
                <div className="h-15 w-15">
                  {getPaymentIcon(method.id)}
                </div>
                <p className="text-fs-stat font-sora text-foreground">
                  {method.name}
                </p>
                <p className="text-fs-stat font-sora text-muted-foreground">{method.percentage}%</p>
              </div>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%">
                  <AreaChart data={method.data}>
                    <CartesianGrid strokeDasharray="1 1" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={tooltipStyles}
                      formatter={(value) => [`R$ ${value}`, "Valor"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={PAYMENT_LINE_COLOR}
                      fill="none"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: PAYMENT_LINE_COLOR }}
                      isAnimationActive
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}

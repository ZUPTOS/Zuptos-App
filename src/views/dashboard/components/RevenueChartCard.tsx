import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { ArrowUpRight, X } from "lucide-react";
import DetalhamentoIcon from "@/shared/components/icons/DetalhamentoIcon";
import { cardSurface, fallbackVisualizationOptions, LINE_RENDER_ORDER, REVENUE_TOOLTIP_DATE } from "../constants";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { DashboardSalesResponse } from "@/lib/services/dashboard";

type ChartType = "daily" | "monthly" | "yearly";
type VisualizationOption = (typeof fallbackVisualizationOptions)[number];

interface RevenueChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  salesData: DashboardSalesResponse | null | undefined;
  hideValues: boolean;
  chartType?: ChartType;
}

type ChartTooltipProps = TooltipProps<ValueType, NameType> & {
  chartType: ChartType;
  options: VisualizationOption[];
  hideValues: boolean;
};

const formatTooltipValue = (value: number, metricKey?: string) => {
    if (Number.isNaN(value)) return "--";
    const currencyMetricKeys = new Set(["faturamento", "receitaLiquida", "ticketMedio"]);
    if (metricKey && currencyMetricKeys.has(metricKey)) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
      });
    }
    return value.toLocaleString("pt-BR");
  };

const formatTooltipHeader = (label: unknown, chartType: ChartType) => {
  if (label === null || label === undefined || label === "") return REVENUE_TOOLTIP_DATE;
  const labelText = typeof label === "string" || typeof label === "number" ? String(label) : REVENUE_TOOLTIP_DATE;
  if (chartType === "yearly") return `Ano ${labelText}`;
  return labelText;
};

const ChartTooltip = ({ active, payload, options, hideValues, label, chartType }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  const header = formatTooltipHeader(label, chartType);

  return (
    <div className="min-w-[180px] rounded-[12px] border border-card bg-card px-3 py-2.5 text-card-foreground shadow-xl xl:text-[11px] 2xl:text-[13px]">
      <p className="mb-2.5 font-sora text-card-foreground/85 xl:text-[11px] 2xl:text-[13px]">
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
          const formattedValue = hideValues ? "•••" : formatTooltipValue(numericValue, metricKey);
          const color = option?.color ?? item.color ?? "#ffffff";
          return (
            <div key={`${labelText}-${index}`} className="flex items-center gap-2 leading-tight xl:text-[11px] 2xl:text-[13px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-sora">
                {labelText}: <span className="text-card-foreground/90 xl:text-[11px] 2xl:text-[13px]">{formattedValue}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const RevenueChartCard: React.FC<RevenueChartCardProps> = ({ 
    salesData, 
    hideValues, 
    chartType = "daily",
    className, 
    style, 
    ...props 
}) => {
    const defaultStyle = { gridArea: "faturamento", ...style };
    
    // State for local chart options
    const [isVisualizationOpen, setVisualizationOpen] = useState(false);
    const visualizationRef = useRef<HTMLDivElement>(null);
    const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        fallbackVisualizationOptions.forEach(option => {
            // Only enable "faturamento" by default
            initial[option.id] = option.id === "faturamento";
        });
        return initial;
    });

    const visualizationOptions = useMemo(() => {
        // Here we could update colors dynamically from salesData if needed, 
        // matching the logic in Dashboard.tsx
        return fallbackVisualizationOptions; 
        // Note: In Dashboard.tsx there was logic to map colors from REVENUE_LINE_COLORS if salesData.lines existed.
        // For simplicity and stability, using fallbackOptions unless dynamic is strictly required. 
        // If data changes, Recharts handles it via dataKey.
    }, []);

    // Effect to close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (visualizationRef.current && !visualizationRef.current.contains(event.target as Node)) {
                setVisualizationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleLine = (id: string) => {
        setVisibleLines(prev => {
          const visibleCount = Object.values(prev).filter(v => v).length;
          const isCurrentlyVisible = prev[id];
    
          if (isCurrentlyVisible && visibleCount <= 1) {
            return prev;
          }
    
          return { ...prev, [id]: !isCurrentlyVisible };
        });
      };
    
    const linesToRender = useMemo(() => {
        return visualizationOptions
            .map(option => ({
            ...option,
            hidden: visibleLines[option.id] === false
            }))
            .sort((a, b) => (LINE_RENDER_ORDER[a.id] ?? 0) - (LINE_RENDER_ORDER[b.id] ?? 0));
    }, [visibleLines, visualizationOptions]);

    type ChartPoint = Record<string, number | string>;

    // Data preparation
    const chartData = useMemo<ChartPoint[]>(() => {
        const baseData: ChartPoint[] =
          chartType === "daily"
            ? (salesData?.daily ?? [])
            : chartType === "monthly"
              ? (salesData?.monthly ?? [])
              : (salesData?.yearly ?? []);
    
        if (hideValues) {
          return baseData.map(point => ({
            ...point,
            faturamento: 0,
            receitaLiquida: 0,
            vendas: 0,
            ticketMedio: 0,
            chargeback: 0,
            reembolso: 0
          }));
        }
        return baseData;
      }, [chartType, hideValues, salesData]);

    const maskValue = (value: string) => (hideValues ? "•••" : value);
    const grossRevenueLabel = (salesData?.grossRevenue ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const growthPercentageLabel = `${(salesData?.growthPercentage ?? 0).toFixed(1).replace(".", ",")}%`;
    const axisColor = "var(--muted-foreground)";
    const gridColor = "var(--border)";


    return (
        <div style={defaultStyle} className={`${cardSurface} relative p-3 sm:p-4 md:p-5 lg:p-6 xl:p-6 flex flex-col h-full overflow-visible ${className || ""}`} {...props}>
             <div className="flex justify-between items-start mb-1 sm:mb-1.5 md:mb-2 shrink-0">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[clamp(18px,2.2vw,24px)] font-bold text-foreground">{maskValue(grossRevenueLabel)}</span>
                            {!hideValues && (
                                <span className="text-foreground text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[12px] font-bold bg-muted px-2 py-1 rounded flex items-center gap-1">
                                    <ArrowUpRight size={14} className="text-lime-500" /> 
                                    {maskValue(growthPercentageLabel)}
                                </span>
                            )}
                        </div>
                        <p className="text-[clamp(10px,1.1vw,13px)] text-muted-foreground font-medium">Receita Bruta</p>
                    </div>

                     {/* Floating Menu */}
                     <div className="relative flex items-center" ref={visualizationRef}>
                        <button
                            onClick={() => setVisualizationOpen(prev => !prev)}
                            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[10px] text-muted-foreground transition hover:text-foreground hover:bg-muted/20"
                            aria-label="Abrir opções de visualização"
                            type="button"
                        >
                            <DetalhamentoIcon className="h-7 w-7" />
                        </button>
                        {isVisualizationOpen && (
                            <div
                            className={`${cardSurface} absolute z-50 w-[180px] sm:w-[200px] md:w-[220px] max-h-[300px] space-y-2 overflow-y-auto rounded-[12px] p-3 shadow-xl`}
                            style={{ top: "0px", right: "0px" }}
                            >
                            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
                                <p className="text-[12px] font-semibold text-foreground">Visualização</p>
                                <button
                                type="button"
                                onClick={() => setVisualizationOpen(false)}
                                className="rounded p-1 text-muted-foreground transition hover:text-foreground"
                                >
                                <X className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {visualizationOptions.map(option => {
                                const enabled = visibleLines[option.id] !== false;
                                return (
                                    <button
                                    key={option.id}
                                    onClick={() => toggleLine(option.id)}
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-[6px] py-1 transition group"
                                    >
                                    <div
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                                        style={{ backgroundColor: enabled ? option.color : "var(--muted)" }}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`${enabled ? 'translate-x-4' : 'translate-x-0'}
                                                pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </div>
                                    <span className={`text-[13px] font-bold transition-colors ${enabled ? "text-foreground" : "text-muted-foreground"}`}>
                                        {option.label}
                                    </span>
                                    </button>
                                );
                                })}
                            </div>
                            </div>
                        )}
                    </div>
             </div>

             <div className="flex-1 w-full min-h-[220px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="1 1" stroke={gridColor} vertical={false} />
                           <XAxis dataKey={chartType === "daily" ? "time" : chartType === "monthly" ? "month" : "year"} stroke={gridColor} style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: axisColor }} tickLine={false} axisLine={false} dy={10} />
                           <YAxis stroke={gridColor} style={{ fontSize: "11px", fontWeight: 500 }} tick={{ fill: axisColor }} tickLine={false} axisLine={false} dx={-10} />
                           <Tooltip content={props => <ChartTooltip {...props} chartType={chartType} options={visualizationOptions} hideValues={hideValues} />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
                           {linesToRender.map(o => (
                             <Line
                               key={o.id}
                               type="linear"
                               dataKey={o.key}
                               stroke={o.color}
                               strokeWidth={2.5}
                               dot={false}
                               hide={o.hidden}
                             />
                           ))}
                        </LineChart>
                    </ResponsiveContainer>
             </div>
        </div>
    );
};

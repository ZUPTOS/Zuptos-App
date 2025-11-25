'use client';

import { useState } from "react";
import Image from "next/image";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ArrowDownRight, ArrowUpRight, Menu, Receipt, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";

type ChartPoint = {
  time: string;
  faturamento: number;
  vendas: number;
  ticketMedio: number;
  lucroBruto: number;
  lucroLiquido: number;
};

const lineConfig = [
  { key: "faturamento", label: "Faturamento", color: "#7900bd", isCurrency: true },
  { key: "vendas", label: "Vendas", color: "#c100c5" },
  { key: "ticketMedio", label: "Ticket médio", color: "#00b7d9", isCurrency: true },
  { key: "lucroBruto", label: "Lucro Bruto", color: "#00e687", isCurrency: true },
  { key: "lucroLiquido", label: "Lucro Líquido", color: "#d6e600", isCurrency: true }
] as const;

const adminChartData: ChartPoint[] = [
  { time: "00:00", faturamento: 38, vendas: 25, ticketMedio: 8, lucroBruto: 30, lucroLiquido: 22 },
  { time: "02:00", faturamento: 20, vendas: 12, ticketMedio: 22, lucroBruto: 18, lucroLiquido: 15 },
  { time: "04:00", faturamento: 28, vendas: 18, ticketMedio: 23, lucroBruto: 24, lucroLiquido: 21 },
  { time: "06:00", faturamento: 35, vendas: 28, ticketMedio: 16, lucroBruto: 30, lucroLiquido: 26 },
  { time: "08:00", faturamento: 29, vendas: 32, ticketMedio: 9, lucroBruto: 26, lucroLiquido: 20 },
  { time: "10:00", faturamento: 22, vendas: 27, ticketMedio: 15, lucroBruto: 20, lucroLiquido: 18 },
  { time: "12:00", faturamento: 17, vendas: 40, ticketMedio: 28, lucroBruto: 24, lucroLiquido: 19 },
  { time: "14:00", faturamento: 14, vendas: 21, ticketMedio: 34, lucroBruto: 16, lucroLiquido: 12 },
  { time: "16:00", faturamento: 9, vendas: 32, ticketMedio: 38, lucroBruto: 22, lucroLiquido: 14 },
  { time: "18:00", faturamento: 20, vendas: 26, ticketMedio: 30, lucroBruto: 32, lucroLiquido: 24 }
];

const summaryMetrics = [
  { id: "total", label: "Total em vendas", value: "R$ 00,00" },
  { id: "pedidos", label: "Pedidos pagos", value: "0" },
  { id: "ticket", label: "Ticket médio", value: "R$00,00" }
];

const financialBreakdown = [
  { label: "Receita bruta total", value: "R$00,00" },
  { label: "Receita Líquida", value: "R$00,00" }
];

const transactionalBreakdown = [
  { label: "Taxa de aprovação", value: "00,00%" },
  { label: "Taxa de chargeback", value: "00,00%" }
];

const paymentMethods = [
  { id: "boleto", label: "Boleto", icon: "/images/boleto.svg", progress: 60, trend: -10, trendLabel: "90%" },
  { id: "pix", label: "Pix", icon: "/images/pix.svg", progress: 60, trend: 12, trendLabel: "100%" },
  { id: "cartao", label: "Cartão de crédito", icon: "/images/card.svg", progress: 60, trend: 8, trendLabel: "100%" }
];

type ChartTooltipProps = TooltipProps<ValueType, NameType>;

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  });

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-[220px] rounded-[8px] border border-border bg-card px-4 py-3 text-xs shadow-xl">
      <p className="mb-2 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-2">
        {payload.map(item => {
          const dataKey = item?.dataKey;
          if (!dataKey) return null;
          const line = lineConfig.find(l => l.key === dataKey);
          const color = line?.color ?? item.color ?? "#ffffff";
          const numericValue =
            typeof item.value === "number" ? item.value : Number(item.value ?? 0);
          const formatted = line?.isCurrency
            ? formatCurrency(numericValue)
            : numericValue.toLocaleString("pt-BR");

          return (
            <div key={String(dataKey)} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[12px] text-card-foreground/90">
                {line?.label ?? dataKey}:{" "}
                <span className="font-semibold text-foreground">{formatted}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function CircularProgress({
  value,
  color = "#7c3aed"
}: {
  value: number;
  color?: string;
}) {
  const size = 50;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-[12px] text-center font-semibold text-foreground"
        fill="currentColor"
      >
        {`${progress}%`}
      </text>
    </svg>
  );
}

function PaymentMethodCard({
  label,
  icon,
  progress,
  trend,
  trendLabel
}: {
  label: string;
  icon: string;
  progress: number;
  trend: number;
  trendLabel: string;
}) {
  const isPositive = trend >= 0;
  const trendColor = isPositive ? "text-emerald-400" : "text-rose-400";
  const trendIcon = isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;

  return (
    <div className="flex items-center justify-between rounded-[8px] border border-foreground/10 bg-card px-5 py-4">
      <div className="flex items-center gap-4">
        <span className="flex h-[56px] w-[56px] items-center justify-center rounded-[8px] border border-muted/60 bg-muted/30">
          <Image src={icon} alt={label} width={44} height={44} className="h-11 w-11 object-contain" />
        </span>
        <p className="text-[22px] font-semibold text-muted-foreground">{label}</p>
      </div>

      <div className="flex h-[88px] items-center gap-4">
        <CircularProgress value={progress} />
        <div className="flex flex-col items-start leading-tight">
          <span className={`inline-flex items-center gap-1 rounded-[8px] border border-muted/70 bg-card px-2 py-1 text-[12px] font-semibold ${trendColor}`}>
            {trendIcon}
            {trendLabel}
          </span>
          <span className="text-[12px] text-muted-foreground">00/00</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const gridStroke = "rgba(255, 255, 255, 0.15)";
  const axisColor = "rgba(255, 255, 255, 0.65)";
  const [isVisualizationOpen, setVisualizationOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(() =>
    lineConfig.reduce((acc, line) => {
      acc[line.key] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );
  const linesToRender = lineConfig.filter(line => visibleLines[line.key]);

  const toggleLine = (key: string) => {
    setVisibleLines(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Dashboard Admin">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <DateFilter />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-3">
              <div className={`${cardSurface} min-h-[180px] w-full px-4 py-4`}>
                <div className="flex h-full gap-3 justify-between">
                  {summaryMetrics.map(metric => (
                    <div
                      key={metric.id}
                      className="flex h-full flex-col items-start justify-between gap-3 rounded-[8px] px-5 py-3"
                    >
                      <span className="flex h-[56px] w-[56px] items-center justify-center rounded-[8px] border border-muted bg-muted/30">
                        <Receipt className="h-10 w-10 text-muted-foreground" />
                      </span>
                      <span className="text-[18px] text-muted-foreground">{metric.label}</span>
                      <span className="text-[33px] font-semibold leading-none text-foreground">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${cardSurface} min-h-[585px] px-4 py-5 lg:px-6`}>
                <div className="mb-4 flex items-center justify-end">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setVisualizationOpen(open => !open)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-muted bg-muted/30 text-muted-foreground"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    {isVisualizationOpen && (
                      <div className="absolute right-0 top-12 z-30 w-[260px] rounded-[12px] border border-muted/70 bg-card p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-[18px] font-semibold text-foreground">Visualização</p>
                          <button
                            type="button"
                            onClick={() => setVisualizationOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {lineConfig.map(line => {
                            const enabled = visibleLines[line.key];
                            return (
                              <button
                                key={line.key}
                                type="button"
                                onClick={() => toggleLine(line.key)}
                                className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left text-[16px] font-semibold text-muted-foreground hover:bg-muted/20"
                              >
                                <span
                                  className="flex h-5 w-9 items-center rounded-full px-[3px]"
                                  style={{ backgroundColor: enabled ? line.color : "rgba(255,255,255,0.08)" }}
                                >
                                  <span
                                    className={`h-4 w-4 rounded-full border border-white/80 bg-white transition ${enabled ? "translate-x-3" : "translate-x-0"}`}
                                  />
                                </span>
                                <span className="text-[16px] font-semibold text-muted-foreground">{line.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-[500px] w-full">
                  <ResponsiveContainer>
                    <LineChart data={adminChartData} margin={{ top: 10, right: 20, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis
                        dataKey="time"
                        stroke={gridStroke}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: axisColor, fontSize: 11 }}
                      />
                      <YAxis
                        stroke={gridStroke}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: axisColor, fontSize: 11 }}
                      />
                      <Tooltip
                        cursor={{ stroke: gridStroke, strokeDasharray: "4 2" }}
                        content={props => <ChartTooltip {...props} />}
                      />
                      {linesToRender.map(line => (
                        <Line
                          key={line.key}
                          type="linear"
                          dataKey={line.key}
                          stroke={line.color}
                          strokeWidth={2.2}
                          dot={false}
                          activeDot={false}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div
                className={`${cardSurface} flex h-full min-h-[400px] flex-col justify-evenly gap-2 px-6 py-2 lg:px-6`}
              >
                <div className="space-y-6">
                  <h3 className="text-[25px] font-semibold text-foreground">Detalhamento financeiro</h3>
                  <div className="space-y-6 px-4 py-2">
                    {financialBreakdown.map(item => (
                      <div key={item.label} className="flex items-center justify-between text-[22px]">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[25px] font-semibold text-foreground">Detalhamento transacional</h3>
                  <div className="space-y-6 px-4 py-3">
                    {transactionalBreakdown.map(item => (
                      <div key={item.label} className="flex items-center justify-between text-[22px]">
                        <span className="text-muted-foreground">{item.label}:</span>
                        <span className="font-semibold text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {paymentMethods.map(method => (
                  <PaymentMethodCard
                    key={method.id}
                    label={method.label}
                    icon={method.icon}
                    progress={method.progress}
                    trend={method.trend}
                    trendLabel={method.trendLabel}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

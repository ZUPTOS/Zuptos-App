export const cardSurface = "rounded-[8px] border border-muted bg-card overflow-hidden";

export const HEALTH_COLORS = ["var(--health-1)", "var(--health-2)", "var(--health-3)", "var(--health-4)"];
export const HEALTH_FOCUS_COLOR = "var(--health-3)";

export const JOURNEY_HIGHLIGHT_COLOR = "#5823b2";
export const JOURNEY_INACTIVE_COLOR = "#9D9FA3";

export const REVENUE_LINE_COLORS = [
  "#5b03c0",
  "#b204b5",
  "#4a8430",
  "#0da0a8",
  "#ad2d37",
  "#ffb800"
];

export const PAYMENT_LINE_COLOR = "#6c27d7";

export const paymentIconMap: Record<string, string> = {
  credit_card: "/images/card.svg",
  pix: "/images/pix.svg",
  boleto: "/images/boleto.svg"
};

export const fallbackVisualizationOptions = [
  { id: "faturamento", label: "Faturamento", key: "faturamento", color: REVENUE_LINE_COLORS[0] },
  { id: "receita_liquida", label: "Receita líquida", key: "receitaLiquida", color: REVENUE_LINE_COLORS[1] },
  { id: "vendas", label: "Vendas", key: "vendas", color: REVENUE_LINE_COLORS[2] },
  { id: "ticket_medio", label: "Ticket médio", key: "ticketMedio", color: REVENUE_LINE_COLORS[3] },
  { id: "chargeback", label: "Chargeback", key: "chargeback", color: REVENUE_LINE_COLORS[4] },
  { id: "reembolso", label: "Reembolso", key: "reembolso", color: REVENUE_LINE_COLORS[5] }
];

export const REVENUE_TOOLTIP_DATE = "01/NOV/2025";
export const LINE_RENDER_ORDER: Record<string, number> = {
  reembolso: 0,
  chargeback: 1,
  ticket_medio: 2,
  vendas: 3,
  receita_liquida: 4,
  faturamento: 5
};

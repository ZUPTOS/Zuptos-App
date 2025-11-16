import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import DashboardView from "@/views/Dashboard";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("@/components/DateFilter", () => ({
  __esModule: true,
  default: () => <div data-testid="date-filter">Filtro</div>
}));

jest.mock("@/components/icons/DetalhamentoIcon", () => ({
  __esModule: true,
  default: () => <span data-testid="detalhamento" />
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" })
}));

jest.mock("recharts", () => {
  const Noop = () => null;
  const Container = () => <div data-testid="chart" />;
  return {
    ResponsiveContainer: Container,
    AreaChart: Noop,
    LineChart: Noop,
    Area: Noop,
    Line: Noop,
    CartesianGrid: Noop,
    Tooltip: Noop,
    XAxis: Noop,
    YAxis: Noop
  };
});

describe("DashboardView", () => {
  it("exibe os saldos e saudação ao usuário", () => {
    render(<DashboardView />);

    expect(screen.getByText(/olá, zuptos/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo disponível/i)).toBeInTheDocument();
    expect(screen.getByText(/saldo pendente/i)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import DashboardView from "@/views/dashboard/Dashboard";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("@/shared/components/DateFilter", () => ({
  __esModule: true,
  default: () => <div data-testid="date-filter">Filtro</div>
}));

jest.mock("@/shared/components/icons/DetalhamentoIcon", () => ({
  __esModule: true,
  default: () => <span data-testid="detalhamento" />
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" })
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { username: "testerlong", email: "tester@example.com", fullName: "Tester Long", accessType: "purchases" },
    token: "token",
    isAuthenticated: true,
  })
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

    expect(screen.getAllByText(/olá, tester/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/saldo disponível/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/saldo pendente/i).length).toBeGreaterThan(0);
  });
});

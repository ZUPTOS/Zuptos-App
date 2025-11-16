import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalesView from "@/views/Sales";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("@/views/components/SalesFilterPanel", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-panel">Filtros</div>
}));

jest.mock("@/views/components/SalesDetailPanel", () => ({
  __esModule: true,
  default: ({ sale }: { sale: { id: string } | null }) =>
    sale ? <div data-testid="detail-panel">{sale.id}</div> : null
}));

jest.mock("recharts", () => {
  const Noop = () => null;
  const Container = () => <div data-testid="chart" />;
  return {
    ResponsiveContainer: Container,
    AreaChart: Noop,
    Area: Noop,
    Tooltip: Noop
  };
});

describe("SalesView", () => {
  it("renderiza a tabela de vendas e permite abrir detalhes", async () => {
    const user = userEvent.setup();
    render(<SalesView />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por CPF/i)).toBeInTheDocument();

    await user.click(await screen.findByText("#5GVDSK558"));
    expect(screen.getByTestId("detail-panel")).toHaveTextContent("#5GVDSK558");
  });
});

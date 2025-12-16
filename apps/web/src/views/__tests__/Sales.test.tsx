import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalesView from "@/views/Sales";

jest.mock("@/lib/api", () => ({
  salesApi: {
    listSales: jest.fn().mockResolvedValue({
      user_id: "user-1",
      sales: [
        {
          sale_id: "sale-uuid-1234",
          product_id: "product-uuid-5678",
          sale_date: "2024-01-01T00:00:00Z",
          status: "COMPLETED",
          amount: 100,
          payment_method: "PIX",
          sale_type: "Produtor"
        }
      ]
    })
  }
}));

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

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "test-token" })
}));

describe("SalesView", () => {
  it("renderiza a tabela de vendas e permite abrir detalhes", async () => {
    const user = userEvent.setup();
    render(<SalesView />);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por CPF/i)).toBeInTheDocument();

    const saleRow = await screen.findByText("sale-uuid-1234");
    await user.click(saleRow);
    expect(screen.getByTestId("detail-panel")).toHaveTextContent("sale-uuid-1234");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminDashboard from "@/views/AdminDashboard";
import AdminFinancas from "@/views/AdminFinancas";
import AdminProdutos from "@/views/AdminProdutos";
import AdminPlaceholder from "@/views/AdminPlaceholder";

jest.mock("recharts", () => {
  const MockContainer = ({ children }: { children?: ReactNode }) => (
    <div data-testid="chart">{typeof children === "function" ? children({ width: 400, height: 200 }) : children}</div>
  );
  const samplePayload = [{ dataKey: "faturamento", value: 10, color: "#ff0" }];
  return {
    ResponsiveContainer: MockContainer,
    LineChart: MockContainer,
    Line: () => <div data-testid="line" />,
    CartesianGrid: () => <div data-testid="grid" />,
    Tooltip: ({ content }: { content?: (props: unknown) => ReactNode }) => (
      <div data-testid="tooltip">{content?.({ active: true, payload: samplePayload, label: "00:00" })}</div>
    ),
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
  };
});

jest.mock("@/components/DateFilter", () => ({
  __esModule: true,
  default: () => <div data-testid="date-filter">Filtro</div>,
}));

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

const setAuthUser = () => {
  localStorage.setItem("authToken", "token");
  localStorage.setItem(
    "authUser",
    JSON.stringify({ id: "1", email: "admin@example.com", fullName: "Admin User", accessType: "purchases" }),
  );
};

const renderWithAuth = (ui: ReactNode) => {
  setAuthUser();
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe("Admin views", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renderiza AdminDashboard com métricas de resumo", () => {
    renderWithAuth(<AdminDashboard />);
    expect(screen.getByText(/Total em vendas/i)).toBeInTheDocument();
    expect(screen.getByText(/Boleto/i)).toBeInTheDocument();
  });

  it("renderiza AdminFinancas com detalhamento", () => {
    renderWithAuth(<AdminFinancas />);
    expect(screen.getByText(/Resumo Financeiro/i)).toBeInTheDocument();
    expect(screen.getByText(/Detalhamento da receita/i)).toBeInTheDocument();
    expect(screen.getByText(/Saldo disponível/i)).toBeInTheDocument();
  });

  it("renderiza AdminProdutos mostrando cartões", () => {
    renderWithAuth(<AdminProdutos />);
    expect(screen.getByText(/Novo Produto/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar produto/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Produto 01/i)[0]).toBeInTheDocument();
  });

  it("filtra produtos e executa ações disponíveis", async () => {
    const user = userEvent.setup();
    renderWithAuth(<AdminProdutos />);

    const input = screen.getByPlaceholderText(/Buscar produto/i);
    await user.type(input, "E-book");
    expect(screen.getAllByText(/E-book/).length).toBeGreaterThan(0);

    await user.clear(input);
    await user.type(input, "inexistente");
    expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();

    await user.clear(input);
    const menuButton = screen.getAllByLabelText(/Abrir menu do produto/i)[0];
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await user.click(menuButton);
    await user.click(screen.getByRole("button", { name: /Visualizar/i }));
    await user.click(menuButton);
    await user.click(screen.getByRole("button", { name: /Editar/i }));
    await user.click(menuButton);
    await user.click(screen.getByRole("button", { name: /Deletar/i }));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Product ID"));
    logSpy.mockRestore();
  });

  it("renderiza AdminPlaceholder com mensagem padrão", () => {
    renderWithAuth(<AdminPlaceholder title="Em breve" description="Novo módulo" />);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
    expect(screen.getByText("Novo módulo")).toBeInTheDocument();
  });
});

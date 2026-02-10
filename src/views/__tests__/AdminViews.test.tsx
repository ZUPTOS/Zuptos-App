import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminDashboard from "@/modules/admin/views/AdminDashboard";
import AdminFinancas from "@/modules/admin/views/AdminFinancas";
import AdminProdutos from "@/modules/admin/views/AdminProdutos";
import AdminPlaceholder from "@/modules/admin/views/AdminPlaceholder";
import AdminTransacoes from "@/modules/admin/views/AdminTransacoes";
import AdminTransacoesDetalhes from "@/modules/admin/views/AdminTransacoesDetalhes";
import AdminSaques from "@/modules/admin/views/AdminSaques";
import AdminSaquesDetalhes from "@/modules/admin/views/AdminSaquesDetalhes";
import AdminUsuarios from "@/modules/admin/views/AdminUsuarios";

jest.mock("@/modules/admin/hooks", () => ({
  useAdminProducts: () => {
    const products = [
      {
        id: "1",
        name: "Produto 01",
        typeLabel: "Curso",
        produtor: "Produtor",
        email: "produtor@example.com",
        telefone: "(11) 99999-9999",
        suporte: "suporte@example.com",
        statusLabel: "Aprovado",
      },
      {
        id: "2",
        name: "Produto 02",
        typeLabel: "E-book",
        produtor: "Produtor",
        email: "ebook@example.com",
        telefone: "(11) 99999-9999",
        suporte: "suporte@example.com",
        statusLabel: "Aprovado",
      },
    ];

    return {
      products,
      summary: { total: products.length, totalRevenue: 1234.56 },
      isLoading: false,
    };
  },
  useAdminUsers: () => ({
    users: [
      {
        id: "user-1",
        name: "User 01",
        email: "user01@example.com",
        document: "00000000000",
        statusLabel: "Aprovado",
        totalLabel: "R$ 100,00",
        taxLabel: "0%",
      },
    ],
    summary: { total: 1, active: 1, pending: 0, suspended: 0 },
    isLoading: false,
  }),
  useAdminUserDetail: () => ({
    detail: null,
    rawUser: null,
    isLoading: false,
    reload: jest.fn(),
  }),
  useAdminProductDetail: () => ({
    detail: null,
    rawProduct: null,
    isLoading: false,
    reload: jest.fn(),
  }),
}));

jest.mock("@/modules/admin/hooks/useAdminFinanceList", () => ({
  useAdminFinanceList: () => ({
    finances: [
      {
        id: "finance-1",
        userId: "user-1",
        userName: "User 01",
        userEmail: "user01@example.com",
        type: "transaction",
        amount: 100,
        fee: 10,
        netAmount: 90,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
  }),
}));

jest.mock("recharts", () => {
  const MockContainer = ({ children }: { children?: ReactNode }) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div data-testid="chart">{typeof children === "function" ? (children as any)({ width: 400, height: 200 }) : children}</div>
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

jest.mock("@/shared/components/DateFilter", () => ({
  __esModule: true,
  default: () => <div data-testid="date-filter">Filtro</div>,
}));

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
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
    expect(screen.getAllByText(/Produtos/i).length).toBeGreaterThan(0);
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
    expect(screen.getAllByText(/Produto/i).length).toBeGreaterThan(0);
  });

  it("renderiza AdminPlaceholder com mensagem padrão", () => {
    renderWithAuth(<AdminPlaceholder title="Em breve" description="Novo módulo" />);
    expect(screen.getByText("Em breve")).toBeInTheDocument();
    expect(screen.getByText("Novo módulo")).toBeInTheDocument();
  });

  it("renderiza AdminTransacoes com métricas e tabela", () => {
    renderWithAuth(<AdminTransacoes />);
    expect(screen.getByText(/Transações totais/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar id/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$/i).length).toBeGreaterThan(0);
  });

  it("renderiza AdminTransacoesDetalhes com painel completo", () => {
    renderWithAuth(<AdminTransacoesDetalhes transactionId="#TX1002" />);
    expect(screen.getByText(/Detalhes da transação/i)).toBeInTheDocument();
    expect(screen.getByText(/Dados da transação/i)).toBeInTheDocument();
  });

  it("renderiza AdminSaques com cards e cabeçalhos da tabela", () => {
    renderWithAuth(<AdminSaques />);
    expect(screen.getByText(/Saques aprovados/i)).toBeInTheDocument();
    expect(screen.getByText(/^ID$/i)).toBeInTheDocument();
  });

  it("renderiza AdminSaquesDetalhes com painel de análise", () => {
    renderWithAuth(<AdminSaquesDetalhes withdrawalId="#SQ7002" />);
    expect(screen.getByText(/Detalhes do saque/i)).toBeInTheDocument();
    expect(screen.getByText(/Análise da solicitação/i)).toBeInTheDocument();
  });

  it("renderiza AdminUsuarios com indicador e tabela", () => {
    renderWithAuth(<AdminUsuarios />);
    expect(screen.getByText(/Número de usuários ativos/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar usuário/i)).toBeInTheDocument();
    expect(screen.getByText(/Status do documento/i)).toBeInTheDocument();
  });
});

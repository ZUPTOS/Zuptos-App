import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditarCheckoutView from "@/views/EditarCheckout";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "user@example.com", fullName: "User", accessType: "products" },
    token: "token",
    isLoading: false,
    error: null,
    isAuthenticated: true,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    clearError: jest.fn()
  })
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useParams: () => ({ id: "123" }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("EditarCheckoutView", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  const renderView = () => render(<EditarCheckoutView />);

  it("renderiza o layout básico com título", () => {
    renderView();
    expect(screen.getByText(/Editar Checkout/i)).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
  });

  it("exibe seções principais de configuração", () => {
    renderView();
    expect(screen.getByText(/Campos obrigatórios no Checkout/i)).toBeInTheDocument();
    expect(screen.getByText(/^Visual$/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Pagamentos/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Gatilhos e Depoimentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Pós-compra/i)).toBeInTheDocument();
  });

  it("mostra controles de cor do contador", () => {
    const user = userEvent.setup();
    renderView();

    // Os inputs de cor do contador só aparecem quando o contador regressivo está ativado.
    const toggleRow = screen.getByText(/Contador Regressivo/i).closest("div");
    const toggleButton = toggleRow?.querySelector("button");
    expect(toggleButton).toBeTruthy();

    return user.click(toggleButton as HTMLButtonElement).then(() => {
      expect(screen.getAllByPlaceholderText("#FFFFFF")).toHaveLength(2);
      expect(screen.getByLabelText(/Selecionar cor de fundo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Selecionar cor do texto/i)).toBeInTheDocument();
    });
  });
});

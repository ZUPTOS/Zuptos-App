import { render, screen } from "@testing-library/react";
import EditarCheckoutView from "@/views/EditarCheckout";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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
    expect(screen.getByText(/Pagamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Gatilhos e Depoimentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Pós-compra/i)).toBeInTheDocument();
  });

  it("mostra controles de cor do contador", () => {
    renderView();
    expect(screen.getAllByPlaceholderText("#FFFFFF")).toHaveLength(2);
  });
});

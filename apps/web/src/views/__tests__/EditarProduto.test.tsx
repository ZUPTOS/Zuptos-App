import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditarProdutoView from "@/views/EditarProduto";

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

describe("EditarProdutoView", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  const renderView = () => render(<EditarProdutoView />);

  it("renderiza layout e navegação de tabs", () => {
    renderView();
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getAllByText(/Entregável/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Ofertas/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Checkouts/i)[0]).toBeInTheDocument();
  });

  it("exibe conteúdo da aba Entregável por padrão", () => {
    renderView();
    expect(screen.getByText(/Entregável/i, { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByText(/Adicionar arquivo/i)).toBeInTheDocument();
    expect(screen.getByText(/Nome/i)).toBeInTheDocument();
  });

  it("navega para aba Ofertas e mostra ações de oferta", async () => {
    renderView();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Ofertas/i }));
    expect(screen.getByText(/Adicionar oferta/i)).toBeInTheDocument();
    expect(screen.getByText(/Valor/i)).toBeInTheDocument();
  });
});

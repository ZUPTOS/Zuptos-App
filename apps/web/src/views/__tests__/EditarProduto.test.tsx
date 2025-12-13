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

  it("abre modais das abas avançadas", async () => {
    renderView();
    const user = userEvent.setup();

    // Ofertas -> modal de criar oferta
    await user.click(screen.getByRole("button", { name: /Ofertas/i }));
    await user.click(screen.getByRole("button", { name: /Adicionar oferta/i }));
    expect(screen.getByText(/Criar oferta/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/^Fechar$/i));

    // Configurações -> recuperação ativa
    await user.click(screen.getByRole("button", { name: /Configurações/i }));
    await user.click(screen.getByRole("button", { name: /Configurar/i }));
    expect(screen.getByText(/Configurar Recuperação Ativa/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar modal de recuperação/i));

    // Pixels -> seleciona plataforma e abre formulário
    await user.click(screen.getByRole("button", { name: /Pixels de rastreamento/i }));
    await user.click(screen.getByRole("button", { name: /Adicionar Pixel/i }));
    await user.click(screen.getByRole("button", { name: /Prosseguir/i }));
    expect(screen.getByText(/Cadastrar Pixel/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Cancelar/i }));

    // Upsell / downsell
    await user.click(screen.getByRole("button", { name: /Upsell, downsell e mais/i }));
    await user.click(screen.getAllByRole("button", { name: /^Adicionar$/i })[0]);
    expect(screen.getByText(/Criar estratégia/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar modal estratégia/i));

    // Cupons
    await user.click(screen.getByRole("button", { name: /Cupons/i }));
    await user.click(screen.getByRole("button", { name: /^Adicionar$/i }));
    expect(screen.getByText(/Novo Desconto/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar modal cupom/i));

    // Coprodução
    await user.click(screen.getByRole("button", { name: /Coprodução/i }));
    await user.click(screen.getAllByRole("button", { name: /^Adicionar$/i })[0]);
    expect(screen.getByText(/Convite de coprodução/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar modal coprodução/i));
    await user.click(screen.getByText(/BÁSICO/i));
    expect(screen.getByText(/Coprodutor 1/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar detalhes coprodução/i));
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import Finances from "@/views/Finances";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("@/components/DateFilter", () => ({
  __esModule: true,
  default: ({ onDateChange }: { onDateChange?: (start: Date, end: Date) => void }) => (
    <button type="button" onClick={() => onDateChange?.(new Date(), new Date())}>
      Selecionar data
    </button>
  )
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (): ReactElement => <span data-testid="mocked-image" />
}));

describe("Finances view", () => {
  it("mostra aviso quando não há conta bancária", () => {
    render(<Finances />);

    expect(
      screen.getByText(/Nenhuma conta bancária cadastrada. Configure uma conta/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Solicitar saque/i })).not.toBeInTheDocument();
  });

  it("permite cadastrar conta e abrir modal de saque", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: /Adicionar conta bancária/i }));

    expect(screen.getByText(/Configurar conta bancária/i)).toBeInTheDocument();
    const firstOverlay = document.querySelector<HTMLElement>('[class*="bg-black/60"]');
    if (firstOverlay) {
      fireEvent.click(firstOverlay);
    }

    await user.click(screen.getByRole("button", { name: /Adicionar conta bancária/i }));
    await user.click(screen.getByRole("button", { name: /Adicionar conta$/i }));

    expect(
      screen.queryByText(/Nenhuma conta bancária cadastrada. Configure uma conta/i)
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));
    expect(screen.getByText(/Quanto você quer sacar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("R$ 0,00")).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Fechar modal de saque/i));
    expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));
    const withdrawOverlays = document.querySelectorAll<HTMLElement>('[class*="bg-black/60"]');
    const lastOverlay = withdrawOverlays[withdrawOverlays.length - 1];
    if (lastOverlay) {
      fireEvent.click(lastOverlay);
    }
    expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument();
  });

  it("exibe tabela de transações com filtros e ações", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));

    expect(screen.getByPlaceholderText("Buscar por código")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtrar transações" })).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getAllByText("#TX0001")[0]).toBeInTheDocument();
  });

  it("filtra saídas, busca por transação e pagina", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getByRole("button", { name: "Saídas" }));

    expect(screen.queryByText("#TX0001")).not.toBeInTheDocument();
    expect(screen.getByText("#TX0002")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Buscar por código");
    await user.clear(searchInput);
    await user.type(searchInput, "#TX0002");
    expect(await screen.findByText("#TX0002")).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, "NADA-AQUI");
    expect(await screen.findByText(/Nenhuma transação encontrada/i)).toBeInTheDocument();

    await user.clear(searchInput);
    expect(await screen.findByText("#TX0002")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /Próximo/i });
    await user.click(nextButton);
    expect(screen.getByRole("button", { name: /Anterior/i })).not.toBeDisabled();
  });

  it("abre e fecha o painel de filtros de transações", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getByRole("button", { name: "Filtrar transações" }));

    expect(screen.getByText("Filtrar")).toBeInTheDocument();
    const overlay = await screen.findByLabelText(/Fechar modal de filtro \(overlay\)/i);
    await user.click(overlay);
    expect(screen.queryByText("Filtrar")).not.toBeInTheDocument();
  });

  it("mostra placeholder nas abas futuras", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Histórico de saques" }));
    expect(screen.getByText(/Conteúdo da aba Histórico de saques/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Taxas" }));
    expect(screen.getByText(/Conteúdo da aba Taxas/i)).toBeInTheDocument();
  });

  it("filtra transações por intervalo de datas usando o DateFilter", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getByRole("button", { name: /Filtrar transações/i }));
    await user.click(screen.getByRole("button", { name: /Selecionar data/i }));

    expect(await screen.findByText(/Nenhuma transação encontrada/i)).toBeInTheDocument();
  });

  it("abre detalhes da transação e fecha com o teclado", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getAllByText("#TX0001")[0]);
    expect(screen.getByText(/Detalhes/i)).toBeInTheDocument();

    const detailOverlay = screen.getByLabelText(/Fechar modal de detalhes \(overlay\)/i);
    detailOverlay.focus();
    fireEvent.keyDown(detailOverlay, { key: "Enter", code: "Enter", charCode: 13 });
    await waitFor(() => expect(screen.queryByText(/Detalhes/i)).not.toBeInTheDocument());
  });

  it("fecha modal de saque usando o teclado", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: /Adicionar conta bancária/i }));
    await user.click(screen.getByRole("button", { name: /Adicionar conta$/i }));
    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));

    const overlay = screen.getByLabelText(/Fechar overlay do saque/i);
    overlay.focus();
    fireEvent.keyDown(overlay, { key: " ", code: "Space", charCode: 32 });
    await waitFor(() => expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument());
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import Finances from "@/views/Finances";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
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

  it("mostra placeholder nas abas futuras", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Histórico de saques" }));
    expect(screen.getByText(/Conteúdo da aba Histórico de saques/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Taxas" }));
    expect(screen.getByText(/Conteúdo da aba Taxas/i)).toBeInTheDocument();
  });
});

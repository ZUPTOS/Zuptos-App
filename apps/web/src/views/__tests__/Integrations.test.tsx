import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Integrations from "@/views/Integrations";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

describe("Integrations view", () => {
  it("renderiza filtros e campo de busca com estado vazio", () => {
    render(<Integrations />);

    const buttons = screen.getAllByRole("button");
    const todosButton = buttons.find(btn => btn.textContent === "Todos");
    const connectedButton = buttons.find(btn => btn.textContent === "Conectados");
    const disconnectedButton = buttons.find(btn => btn.textContent === "Desconectados");

    expect(todosButton).toBeInTheDocument();
    expect(connectedButton).toBeInTheDocument();
    expect(disconnectedButton).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar/i)).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma integração disponível/i)).toBeInTheDocument();
    expect(todosButton).toHaveClass("text-foreground");
  });

  it("altera o filtro ativo e atualiza o valor de busca", async () => {
    const user = userEvent.setup();
    render(<Integrations />);

    const connectedButton = screen.getByText(/^Conectados$/i);
    await user.click(connectedButton);
    expect(connectedButton).toHaveClass("text-foreground");

    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    await user.type(searchInput, "hubspot");
    expect(searchInput).toHaveValue("hubspot");
  });
});

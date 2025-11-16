import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import MyAccountView from "@/views/MyAccount";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img alt="mock" {...props} />
}));

describe("MyAccountView", () => {
  it("exibe as informações principais do usuário e o status da documentação", () => {
    render(<MyAccountView />);

    expect(screen.getByText("Meu perfil")).toBeInTheDocument();
    expect(screen.getByText("Zuptos")).toBeInTheDocument();
    expect(screen.getByText("contato@zuptos.com")).toBeInTheDocument();
    expect(screen.getByText(/status da documentação/i)).toBeInTheDocument();
    expect(screen.getByText(/^aprovado$/i)).toBeInTheDocument();
    expect(screen.getByText(/seus documentos foram aprovados/i)).toBeInTheDocument();
  });
});

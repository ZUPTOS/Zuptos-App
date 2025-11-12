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
  it("renderiza inputs de nome e email com valores padrão", () => {
    render(<MyAccountView />);

    expect(screen.getByDisplayValue("Zuptos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("contato@zuptos.com")).toBeInTheDocument();
    expect(screen.getByText(/quer redefinir sua senha/i)).toBeInTheDocument();
  });
});

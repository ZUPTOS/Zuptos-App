import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import LoginView from "@/views/Login";

jest.mock("@/components/ui/select", () => {
  const Select = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const SelectTrigger = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div role="button" {...props}>
      {children}
    </div>
  );
  const SelectContent = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const SelectItem = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  const SelectValue = ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  );
  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
});

describe("LoginView", () => {
  it("permite alternar entre tabs e visualizar os campos esperados", async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    expect(screen.getByRole("heading", { name: /acesse a sua conta/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    expect(screen.getByRole("heading", { name: /crie sua conta/i })).toBeInTheDocument();

    const toggleButtons = screen.getAllByRole("button", { name: /mostrar senha/i });
    await user.click(toggleButtons[0]);
    expect(screen.getAllByRole("button", { name: /ocultar senha/i })).toHaveLength(1);
  });

  it("mostra formulário de login padrão ao voltar para Entrar", async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(screen.getByPlaceholderText(/sua senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seu endereço de email/i)).toBeInTheDocument();
  });
});

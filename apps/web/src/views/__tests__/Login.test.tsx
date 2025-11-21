import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { HTMLAttributes, ReactNode } from "react";
import LoginView from "@/views/Login";

jest.mock("@/components/ui/select", () => {
  const SelectContext = React.createContext<{ value?: string; onValueChange?: (value: string) => void }>({});

  const Select = ({
    children,
    value,
    onValueChange
  }: { children: ReactNode; value: string; onValueChange: (next: string) => void }) => (
    <SelectContext.Provider value={{ value, onValueChange }}>
      <div data-testid="select" data-value={value}>
        {children}
      </div>
    </SelectContext.Provider>
  );

  const SelectTrigger = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button type="button" role="button" {...props}>
      {children}
    </button>
  );

  const SelectContent = ({ children }: { children: ReactNode }) => <div>{children}</div>;

  const SelectItem = ({ children, value }: { children: ReactNode; value: string }) => {
    const ctx = React.useContext(SelectContext);
    return (
      <div role="option" aria-selected={ctx.value === value} onClick={() => ctx.onValueChange?.(value)}>
        {children}
      </div>
    );
  };

  const SelectValue = ({ placeholder }: { placeholder: string }) => {
    const ctx = React.useContext(SelectContext);
    return <span>{ctx.value ?? placeholder}</span>;
  };

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

  it("altera tipo de acesso, aceita termos e retorna para a tela de login", async () => {
    const user = userEvent.setup();
    render(<LoginView />);

    await user.click(screen.getByRole("option", { name: /Gerenciar meus produtos/i }));
    expect(
      screen.getByText(/Para produtores e co-produtores/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cadastrar/i }));
    const termsCheckbox = screen.getByLabelText(/Li e aceito os/i);
    await user.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    const passwordToggles = screen.getAllByRole("button", { name: /mostrar senha/i });
    await user.click(passwordToggles[0]);
    await user.click(passwordToggles[1]);
    expect(screen.getAllByRole("button", { name: /ocultar senha/i })).toHaveLength(2);

    const formElement = document.querySelector("form");
    if (formElement) {
      fireEvent.submit(formElement);
    }

    await user.click(screen.getByText(/Já possui conta/i));
    expect(screen.getByRole("heading", { name: /Acesse a sua conta/i })).toBeInTheDocument();
  });
});

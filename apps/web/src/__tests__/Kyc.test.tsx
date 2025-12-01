import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import KycView from "@/views/Kyc";

// Simplified mocks to avoid layout noise and keep focus on conditional rendering.
jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("@/components/ui/select", () => {
  const SelectContext = React.createContext<{ onValueChange?: (v: string) => void; value?: string }>({});

  const Select: React.FC<{ children: React.ReactNode; value?: string; onValueChange?: (v: string) => void }> = ({
    children,
    value,
    onValueChange
  }) => (
    <SelectContext.Provider value={{ onValueChange, value }}>{children}</SelectContext.Provider>
  );
  const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div data-testid="select-trigger">{children}</div>
  );
  const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
    <span data-testid="select-value">{placeholder}</span>
  );
  const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ctx = React.useContext(SelectContext);
    return (
      <select data-testid="account-select" value={ctx.value} onChange={e => ctx.onValueChange?.(e.target.value)}>
        {children}
      </select>
    );
  };
  const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
    <option value={value}>{children}</option>
  );

  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
});

describe("KycView", () => {
  it("renderiza campos de PJ por padrão e 6 slots de documentos", () => {
    render(<KycView />);

    expect(screen.getByLabelText(/CNPJ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Razão social/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^CPF$/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Avançar/i));

    const docCards = screen.getAllByText(/Selecione do seu dispositivo/i);
    expect(docCards).toHaveLength(6);
  });

  it("ao selecionar Pessoa física, mostra CPF e reduz para 4 slots de documentos", () => {
    render(<KycView />);

    const select = screen.getByTestId("account-select");
    fireEvent.change(select, { target: { value: "pf" } });

    expect(screen.getByLabelText(/^CPF$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/CNPJ/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Razão social/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText(/Avançar/i));

    const docCards = screen.getAllByText(/Selecione do seu dispositivo/i);
    expect(docCards).toHaveLength(4);
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import KycView from "@/views/Kyc";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { username: "Tester" }, token: "token" })
}));

jest.mock("@/lib/api", () => ({
  kycApi: {
    create: jest.fn().mockResolvedValue({}),
    uploadDocument: jest.fn().mockResolvedValue({})
  }
}));

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

const preencherCamposObrigatoriosPJ = () => {
  fireEvent.change(screen.getByLabelText(/CNPJ/i), { target: { value: "12345678000123" } });
  fireEvent.change(screen.getByLabelText(/Razão social/i), { target: { value: "Empresa Teste" } });
  fireEvent.change(screen.getByLabelText(/Nome do representante legal/i), { target: { value: "Representante" } });
  fireEvent.change(screen.getByLabelText(/CPF do representante legal/i), { target: { value: "12345678901" } });
  fireEvent.change(screen.getByLabelText(/^Telefone/i), { target: { value: "62999999999" } });
  fireEvent.change(screen.getByLabelText(/^CEP/i), { target: { value: "74000000" } });
  fireEvent.change(screen.getByLabelText(/^Rua/i), { target: { value: "Rua 1" } });
  fireEvent.change(screen.getByLabelText(/^Número/i), { target: { value: "123" } });
  fireEvent.change(screen.getByLabelText(/^Estado/i), { target: { value: "GO" } });
  fireEvent.change(screen.getByLabelText(/^Cidade/i), { target: { value: "Goiania" } });
  fireEvent.change(screen.getByLabelText(/^Bairro/i), { target: { value: "Centro" } });
  fireEvent.change(screen.getByLabelText(/Faturamento médio/i), { target: { value: "1000" } });
  fireEvent.change(screen.getByLabelText(/Ticket médio/i), { target: { value: "500" } });
};

const preencherCamposObrigatoriosPF = () => {
  fireEvent.change(screen.getByLabelText(/Nome completo/i), { target: { value: "Pessoa Física" } });
  fireEvent.change(screen.getByLabelText(/^CPF$/i), { target: { value: "12345678901" } });
  fireEvent.change(screen.getByLabelText(/^Telefone/i), { target: { value: "62999999999" } });
  fireEvent.change(screen.getByLabelText(/^CEP/i), { target: { value: "74000000" } });
  fireEvent.change(screen.getByLabelText(/^Rua/i), { target: { value: "Rua 1" } });
  fireEvent.change(screen.getByLabelText(/^Número/i), { target: { value: "123" } });
  fireEvent.change(screen.getByLabelText(/^Estado/i), { target: { value: "GO" } });
  fireEvent.change(screen.getByLabelText(/^Cidade/i), { target: { value: "Goiania" } });
  fireEvent.change(screen.getByLabelText(/^Bairro/i), { target: { value: "Centro" } });
  fireEvent.change(screen.getByLabelText(/Faturamento médio/i), { target: { value: "1000" } });
  fireEvent.change(screen.getByLabelText(/Ticket médio/i), { target: { value: "500" } });
};

describe("KycView", () => {
  it("renderiza campos de PJ por padrão e 5 slots de documentos", () => {
    render(<KycView />);

    expect(screen.getByLabelText(/CNPJ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Razão social/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^CPF$/i)).not.toBeInTheDocument();

    preencherCamposObrigatoriosPJ();
    fireEvent.click(screen.getByText(/Avançar/i));

    const docCards = screen.getAllByText(/Selecione do seu dispositivo/i);
    expect(docCards).toHaveLength(5);
  });

  it("ao selecionar Pessoa física, mostra CPF e reduz para 4 slots de documentos", () => {
    render(<KycView />);

    const select = screen.getByTestId("account-select");
    fireEvent.change(select, { target: { value: "pf" } });

    expect(screen.getByLabelText(/^CPF$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/CNPJ/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Razão social/i)).not.toBeInTheDocument();

    preencherCamposObrigatoriosPF();
    fireEvent.click(screen.getByText(/Avançar/i));

    const docCards = screen.getAllByText(/Selecione do seu dispositivo/i);
    expect(docCards).toHaveLength(4);
  });
});

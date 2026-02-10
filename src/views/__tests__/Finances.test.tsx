import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import type { Transaction } from "@/lib/api-types";
import Finances from "@/views/Finances";
import { useFinanceData } from "../finances/hooks/useFinanceData";
import { useBankData } from "../finances/hooks/useBankData";
import { useTransactions } from "../finances/hooks/useTransactions";

jest.mock("../finances/hooks/useFinanceData", () => ({
  useFinanceData: jest.fn(),
}));

jest.mock("../finances/hooks/useBankData", () => ({
  useBankData: jest.fn(),
}));

jest.mock("../finances/hooks/useTransactions", () => ({
  useTransactions: jest.fn(),
}));

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("@/shared/components/DateFilter", () => ({
  __esModule: true,
  default: ({ onDateChange }: { onDateChange?: (start: Date, end: Date) => void }) => (
    <button type="button" onClick={() => onDateChange?.(new Date(), new Date())}>
      Selecionar data
    </button>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (): ReactElement => <span data-testid="mocked-image" />,
}));

const buildTransactions = (): Transaction[] => {
  const created_at = new Date("2020-01-01T12:00:00.000Z").toISOString();

  const outTransactions: Transaction[] = Array.from({ length: 12 }, (_, idx) => {
    const id = `TX${String(idx + 2).padStart(4, "0")}`; // TX0002..TX0013
    return {
      id,
      amount: 50 + idx,
      status: "completed",
      type: "withdraw",
      description: `Saida ${id}`,
      product_name: "Produto Saida",
      created_at,
    };
  });

  return [
    {
      id: "TX0001",
      amount: 100,
      status: "completed",
      type: "sale",
      description: "Entrada TX0001",
      product_name: "Produto Entrada",
      created_at,
    },
    ...outTransactions,
  ];
};

describe("Finances view", () => {
  const useFinanceDataMock = useFinanceData as jest.MockedFunction<typeof useFinanceData>;
  const useBankDataMock = useBankData as jest.MockedFunction<typeof useBankData>;
  const useTransactionsMock = useTransactions as jest.MockedFunction<typeof useTransactions>;

  let bankState: { hasBankAccount: boolean; bankInfo: Record<string, unknown> | null };
  let updateBankDataMock: jest.Mock;
  let bankRefetchMock: jest.Mock;

  beforeEach(() => {
    bankState = { hasBankAccount: false, bankInfo: null };
    updateBankDataMock = jest.fn(async () => {
      bankState.hasBankAccount = true;
      bankState.bankInfo = {
        bank: "077 - Banco Inter S.A.",
        accountType: "RANDOM_KEY",
        pixKey: "pix-key-123",
        account_key: "pix-key-123",
      };
    });
    bankRefetchMock = jest.fn(async () => {});

    useFinanceDataMock.mockReturnValue({
      availableBalance: 1000,
      pendingBalance: 200,
      commissionsBalance: 300,
      isLoading: false,
      error: null,
      refetch: jest.fn(async () => {}),
    });

    useBankDataMock.mockImplementation(() => ({
      bankInfo: bankState.bankInfo as never,
      hasBankAccount: bankState.hasBankAccount,
      isLoading: false,
      error: null,
      refetch: bankRefetchMock,
      updateBankData: updateBankDataMock,
    }));

    useTransactionsMock.mockReturnValue({
      transactions: buildTransactions(),
      isLoading: false,
      error: null,
      refetch: jest.fn(async () => {}),
      page: 1,
      setPage: jest.fn(),
      totalPages: 2,
    });
  });

  it("mostra aviso quando não há conta bancária", () => {
    render(<Finances />);

    expect(screen.getByText(/Nenhuma conta bancária cadastrada. Configure uma conta/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Solicitar saque/i })).not.toBeInTheDocument();
  });

  it("permite cadastrar conta e abrir modal de saque", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: /Adicionar conta bancária/i }));
    expect(screen.getByText(/Configurar conta bancária/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Fechar modal de conta bancária \(overlay\)/i));
    expect(screen.queryByText(/Configurar conta bancária/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Adicionar conta bancária/i }));

    await user.type(screen.getByPlaceholderText(/Selecione o banco/i), "Banco Teste");
    await user.selectOptions(screen.getByRole("combobox"), "RANDOM_KEY");
    await user.type(screen.getByPlaceholderText(/^Chave PIX$/i), "pix-key-123");

    await user.click(screen.getByRole("button", { name: /Adicionar conta$/i }));
    await waitFor(() => expect(updateBankDataMock).toHaveBeenCalled());

    expect(screen.queryByText(/Nenhuma conta bancária cadastrada. Configure uma conta/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));
    expect(screen.getByText(/Quanto você quer sacar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("R$ 0,00")).toBeInTheDocument();

    const closeButton = document.querySelector<HTMLElement>('[data-slot="dialog-close"]');
    expect(closeButton).toBeTruthy();
    fireEvent.click(closeButton as HTMLElement);
    await waitFor(() => expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));
    await user.click(screen.getByPlaceholderText("R$ 0,00"));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument());
  });

  it("exibe tabela de transações com filtros e ações", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));

    expect(screen.getByPlaceholderText("Buscar por código")).toBeInTheDocument();
    expect(screen.getByTitle("Filtrar")).toBeInTheDocument();
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
    await user.click(screen.getByTitle("Filtrar"));

    expect(screen.getByRole("dialog", { name: /Filtrar/i })).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar filtros/i));
    expect(screen.queryByRole("dialog", { name: /Filtrar/i })).not.toBeInTheDocument();
  });

  it("mostra placeholder nas abas futuras", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Histórico de saques" }));
    expect(screen.getByRole("button", { name: "Histórico de saques" })).toHaveClass("text-primary");

    await user.click(screen.getByRole("button", { name: "Taxas" }));
    expect(screen.getByRole("button", { name: "Taxas" })).toHaveClass("text-primary");
  });

  it("filtra transações por intervalo de datas usando o DateFilter", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getByTitle("Filtrar"));
    await user.click(screen.getByRole("button", { name: /Selecionar data/i }));

    expect(await screen.findByText(/Nenhuma transação encontrada/i)).toBeInTheDocument();
  });

  it("abre detalhes da transação e fecha com o teclado", async () => {
    const user = userEvent.setup();
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: "Transações" }));
    await user.click(screen.getAllByText("#TX0001")[0]);
    expect(screen.getByRole("heading", { name: /Detalhes/i })).toBeInTheDocument();

    const detailOverlay = screen.getByLabelText(/Fechar modal de detalhes \(overlay\)/i);
    detailOverlay.focus();
    fireEvent.keyDown(detailOverlay, { key: "Enter", code: "Enter", charCode: 13 });

    await waitFor(() => expect(screen.queryByRole("heading", { name: /Detalhes/i })).not.toBeInTheDocument());
  });

  it("fecha modal de saque usando o teclado", async () => {
    const user = userEvent.setup();
    bankState.hasBankAccount = true;
    bankState.bankInfo = { account_key: "pix-key-123" };
    render(<Finances />);

    await user.click(screen.getByRole("button", { name: /Solicitar saque/i }));
    expect(screen.getByText(/Quanto você quer sacar/i)).toBeInTheDocument();

    await user.click(screen.getByPlaceholderText("R$ 0,00"));
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByText(/Quanto você quer sacar/i)).not.toBeInTheDocument());
  });
});

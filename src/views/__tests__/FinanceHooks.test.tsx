import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useBankData } from "@/views/finances/hooks/useBankData";
import { useFinanceData } from "@/views/finances/hooks/useFinanceData";
import { useTransactions } from "@/views/finances/hooks/useTransactions";

const getBankDataMock = jest.fn();
const updateBankDataMock = jest.fn();
const getFinanceDataMock = jest.fn();
const getTransactionsMock = jest.fn();

jest.mock("@/lib/api", () => ({
  financesApi: {
    getBankData: (...args: unknown[]) => getBankDataMock(...args),
    updateBankData: (...args: unknown[]) => updateBankDataMock(...args),
    getFinanceData: (...args: unknown[]) => getFinanceDataMock(...args),
  },
}));

jest.mock("@/lib/services/finances/transactions", () => ({
  transactionsFinanceApi: {
    getTransactions: (...args: unknown[]) => getTransactionsMock(...args),
  },
}));

describe("Finances hooks", () => {
  beforeEach(() => {
    getBankDataMock.mockReset();
    updateBankDataMock.mockReset();
    getFinanceDataMock.mockReset();
    getTransactionsMock.mockReset();
  });

  it("useFinanceData: carrega saldos", async () => {
    getFinanceDataMock.mockResolvedValue({
      total_available: 100,
      total_pending: 50,
      total_commission: 10,
    });

    const { result } = renderHook(() => useFinanceData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.availableBalance).toBe(100);
    expect(result.current.pendingBalance).toBe(50);
    expect(result.current.commissionsBalance).toBe(10);
  });

  it("useBankData: detecta conta cadastrada e permite atualizar", async () => {
    getBankDataMock.mockResolvedValue({
      bank_institution: "077 - Banco Inter",
      account_key: "pix-key",
      account_type: "CPF",
      bank_code: "077",
      bank_name: "Banco Inter",
    });
    updateBankDataMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useBankData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasBankAccount).toBe(true);
    expect(result.current.bankInfo?.pixKey).toBe("pix-key");

    await act(async () => {
      await result.current.updateBankData({ bank_name: "Banco Inter" } as any);
    });
    expect(updateBankDataMock).toHaveBeenCalled();
    expect(getBankDataMock).toHaveBeenCalled();
  });

  it("useTransactions: carrega lista e calcula totalPages", async () => {
    getTransactionsMock.mockResolvedValue([{ id: "tx-1" }]);

    const { result } = renderHook(() => useTransactions(10));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.totalPages).toBe(1);
  });
});


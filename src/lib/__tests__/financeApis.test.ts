import { bankFinanceApi } from "@/lib/services/finances/bank";
import { baseFinanceApi, financesApi } from "@/lib/services/finances";
import { withdrawFinanceApi } from "@/lib/services/finances/withdraw";

jest.mock("../request", () => ({
  API_BASE_URL: "http://api.example.test",
  readStoredToken: jest.fn(),
  request: jest.fn(),
}));

const requestMock = jest.requireMock("../request").request as jest.Mock;
const readStoredTokenMock = jest.requireMock("../request").readStoredToken as jest.Mock;

describe("finance services", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
  });

  it("baseFinanceApi: valida token e chama endpoint /finance", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(baseFinanceApi.getFinanceData()).rejects.toThrow(/Missing auth token for finances request/i);

    requestMock.mockResolvedValueOnce({ available: 1 } as any);
    await expect(baseFinanceApi.getFinanceData("t-1")).resolves.toEqual({ available: 1 });
    expect(requestMock).toHaveBeenCalledWith(
      "/finance",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer t-1" },
      })
    );

    // Index re-export/alias: financesApi delegates to baseFinanceApi
    requestMock.mockResolvedValueOnce({ available: 2 } as any);
    await expect(financesApi.getFinanceData("t-2")).resolves.toEqual({ available: 2 });
    expect(requestMock).toHaveBeenCalledWith(
      "/finance",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer t-2" },
      })
    );
  });

  it("withdrawFinanceApi: valida token e chama endpoints", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(withdrawFinanceApi.getWithdrawHistory()).rejects.toThrow(/Missing auth token/i);
    await expect(withdrawFinanceApi.createWithdraw({} as any)).rejects.toThrow(/Missing auth token/i);
    await expect(withdrawFinanceApi.cancelWithdraw("w-1")).rejects.toThrow(/Missing auth token/i);

    requestMock.mockResolvedValueOnce({ data: [] });
    await expect(withdrawFinanceApi.getWithdrawHistory("t-1")).resolves.toEqual({ data: [] });
    expect(requestMock).toHaveBeenCalledWith(
      "/finance/withdraw",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer t-1" },
      })
    );

    requestMock.mockResolvedValueOnce({ ok: true });
    await expect(withdrawFinanceApi.createWithdraw({ amount: 10 } as any, "t-2")).resolves.toEqual({ ok: true });
    expect(requestMock).toHaveBeenCalledWith(
      "/finance/withdraw",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer t-2" },
        body: JSON.stringify({ amount: 10 }),
      })
    );

    requestMock.mockResolvedValueOnce({ ok: true });
    await expect(withdrawFinanceApi.cancelWithdraw("w-9", "t-3")).resolves.toEqual({ ok: true });
    expect(requestMock).toHaveBeenCalledWith(
      "/finance/withdraw/w-9",
      expect.objectContaining({
        method: "DELETE",
        headers: { Authorization: "Bearer t-3" },
      })
    );
  });

  it("bankFinanceApi: valida token e mapeia payload de update", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(bankFinanceApi.getBankData()).rejects.toThrow(/Missing auth token/i);
    await expect(bankFinanceApi.updateBankData({} as any)).rejects.toThrow(/Missing auth token/i);

    requestMock.mockResolvedValueOnce({ bank_institution: "X" });
    await expect(bankFinanceApi.getBankData("t-1")).resolves.toEqual({ bank_institution: "X" });

    requestMock.mockResolvedValueOnce({ ok: true });
    await expect(
      bankFinanceApi.updateBankData({ bank_name: "Banco", account_key: "k-1", account_type: "RANDOM_KEY" } as any, "t-2")
    ).resolves.toEqual({ ok: true });

    const body = JSON.parse(requestMock.mock.calls[1][1].body);
    expect(body).toEqual({
      bank_institution: "Banco",
      account_key: "k-1",
      account_type: "RANDOM_KEY",
    });
  });
});

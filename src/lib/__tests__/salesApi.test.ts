import { salesApi } from "@/lib/services/sales";

jest.mock("../request", () => ({
  API_BASE_URL: "http://api.example.test",
  readStoredToken: jest.fn(),
  readStoredUserId: jest.fn(),
  request: jest.fn(),
}));

const requestMock = jest.requireMock("../request").request as jest.Mock;
const readStoredTokenMock = jest.requireMock("../request").readStoredToken as jest.Mock;
const readStoredUserIdMock = jest.requireMock("../request").readStoredUserId as jest.Mock;

describe("salesApi", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
    readStoredUserIdMock.mockReset();
  });

  it("listSales tenta /sale e faz fallback para /sales quando 404", async () => {
    readStoredTokenMock.mockReturnValue("t-1");
    requestMock
      .mockRejectedValueOnce({ status: 404 })
      .mockResolvedValueOnce({ data: [], page: 1, total: 0 });

    await expect(salesApi.listSales()).resolves.toEqual({ data: [], page: 1, total: 0 });

    expect(requestMock).toHaveBeenCalledTimes(2);
    expect(requestMock.mock.calls[0][0]).toBe("/sale");
    expect(requestMock.mock.calls[1][0]).toBe("/sales");
  });

  it("listSales nao faz fallback quando erro nao é 404", async () => {
    readStoredTokenMock.mockReturnValue("t-1");
    requestMock.mockRejectedValueOnce({ status: 500 });

    await expect(salesApi.listSales()).rejects.toEqual({ status: 500 });
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(requestMock.mock.calls[0][0]).toBe("/sale");
  });

  it("listSales rejeita quando ambos endpoints retornam 404", async () => {
    readStoredTokenMock.mockReturnValue("t-1");
    requestMock.mockRejectedValueOnce({ status: 404 }).mockRejectedValueOnce({ status: 404 });

    await expect(salesApi.listSales()).rejects.toEqual({ status: 404 });
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it("getSaleById chama request com auth", async () => {
    requestMock.mockResolvedValue({ user_id: "u-1", sale: { id: "s-1" } });

    await expect(salesApi.getSaleById("s-1", "t-2")).resolves.toEqual({ user_id: "u-1", sale: { id: "s-1" } });
    expect(requestMock).toHaveBeenCalledWith(
      "/sale/s-1",
      expect.objectContaining({
        method: "GET",
        headers: { Authorization: "Bearer t-2" },
      })
    );
  });

  it("createSale valida payload e usa readStoredUserId", async () => {
    readStoredUserIdMock.mockReturnValue(null);

    await expect(salesApi.createSale({ product_id: "p-1", amount: 10, payment_method: "pix" } as any)).rejects.toThrow(
      /Missing user_id/i
    );

    readStoredUserIdMock.mockReturnValue("u-1");
    await expect(salesApi.createSale({ amount: 10, payment_method: "pix" } as any)).rejects.toThrow(/Missing product_id/i);
    await expect(salesApi.createSale({ product_id: "p-1", payment_method: "pix" } as any)).rejects.toThrow(/Missing amount/i);
    await expect(salesApi.createSale({ product_id: "p-1", amount: 10 } as any)).rejects.toThrow(/Missing payment_method/i);
  });

  it("createSale envia POST com body normalizado", async () => {
    readStoredTokenMock.mockReturnValue("t-3");
    readStoredUserIdMock.mockReturnValue("u-3");
    requestMock.mockResolvedValue({ sale_id: "sale-1", status: "created" });

    await expect(
      salesApi.createSale({ product_id: "p-9", amount: 42, payment_method: "card" } as any)
    ).resolves.toEqual({ sale_id: "sale-1", status: "created" });

    expect(requestMock).toHaveBeenCalledWith(
      "/sale",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer t-3",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          product_id: "p-9",
          user_id: "u-3",
          amount: 42,
          payment_method: "card",
          sale_type: "PRODUCTOR",
        }),
      })
    );
  });
});


import { paymentMethodRequests } from "@/lib/services/products/checkouts/paymentMethod";

jest.mock("../request", () => ({
  API_BASE_URL: "http://api.example.test",
  readStoredToken: jest.fn(),
  request: jest.fn(),
}));

const requestMock = jest.requireMock("../request").request as jest.Mock;
const readStoredTokenMock = jest.requireMock("../request").readStoredToken as jest.Mock;

describe("paymentMethodRequests", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
  });

  it("getCheckoutPaymentMethods exige token e retorna [] em 404", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(paymentMethodRequests.getCheckoutPaymentMethods("p-1", "c-1")).rejects.toThrow(/Missing authentication token/i);

    readStoredTokenMock.mockReturnValue("t-1");
    requestMock.mockRejectedValueOnce({ status: 404 });
    await expect(paymentMethodRequests.getCheckoutPaymentMethods("p-1", "c-1")).resolves.toEqual([]);
  });

  it("getCheckoutPaymentMethods propaga erro nao-404", async () => {
    readStoredTokenMock.mockReturnValue("t-1");
    requestMock.mockRejectedValueOnce({ status: 500 });
    await expect(paymentMethodRequests.getCheckoutPaymentMethods("p-1", "c-1")).rejects.toEqual({ status: 500 });
  });

  it("saveCheckoutPaymentMethods valida ids/token e faz POST", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(
      paymentMethodRequests.saveCheckoutPaymentMethods("", "c-1", {} as any)
    ).rejects.toThrow(/Missing product or checkout id/i);

    await expect(
      paymentMethodRequests.saveCheckoutPaymentMethods("p-1", "c-1", {} as any)
    ).rejects.toThrow(/Missing authentication token/i);

    readStoredTokenMock.mockReturnValue("t-2");
    requestMock.mockResolvedValue({ id: "pm-1" });
    await expect(
      paymentMethodRequests.saveCheckoutPaymentMethods(
        "p-1",
        "c-1",
        {
          accept_document_company: false,
          accept_document_individual: true,
          accept_pix: true,
          accept_credit_card: true,
          accept_ticket: false,
          accept_coupon: true,
          shown_seller_detail: true,
          require_address: true,
        },
        undefined
      )
    ).resolves.toEqual({ id: "pm-1" });

    expect(requestMock).toHaveBeenCalledWith(
      "/product/p-1/checkouts/c-1/paymentMethods",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer t-2" }),
      })
    );
  });

  it("getCheckoutPaymentMethodById retorna null em 404", async () => {
    readStoredTokenMock.mockReturnValue("t-3");
    requestMock.mockRejectedValueOnce({ status: 404 });
    await expect(
      paymentMethodRequests.getCheckoutPaymentMethodById("p-1", "c-1", "pm-1")
    ).resolves.toBeNull();
  });

  it("updateCheckoutPaymentMethod valida token/id e filtra undefined", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(
      paymentMethodRequests.updateCheckoutPaymentMethod("p-1", "c-1", "pm-1", {} as any)
    ).rejects.toThrow(/Missing authentication token/i);

    readStoredTokenMock.mockReturnValue("t-4");
    await expect(
      paymentMethodRequests.updateCheckoutPaymentMethod("p-1", "c-1", "", {} as any)
    ).rejects.toThrow(/Missing payment method id/i);

    requestMock.mockResolvedValue({ ok: true });
    await expect(
      paymentMethodRequests.updateCheckoutPaymentMethod(
        "p-1",
        "c-1",
        "pm-1",
        {
          accept_document_company: false,
          accept_document_individual: true,
          accept_pix: true,
          accept_credit_card: true,
          accept_ticket: false,
          accept_coupon: true,
          shown_seller_detail: false,
          require_address: true,
          detail_discount: undefined,
          detail_payment_method: undefined,
        },
        undefined
      )
    ).resolves.toEqual({ ok: true });

    const body = JSON.parse(requestMock.mock.calls[0][1].body);
    expect(body.detail_discount).toBeUndefined();
    expect(body.detail_payment_method).toBeUndefined();
  });
});


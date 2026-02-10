import { offersApi } from "@/lib/services/products/offers";

jest.mock("../request", () => ({
  API_BASE_URL: "http://api.example.test",
  readStoredToken: jest.fn(),
  request: jest.fn(),
}));

const requestMock = jest.requireMock("../request").request as jest.Mock;
const readStoredTokenMock = jest.requireMock("../request").readStoredToken as jest.Mock;

describe("offersApi", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
  });

  it("getOffersByProductId faz GET com header opcional", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    requestMock.mockResolvedValue([{ id: "o-1" }]);

    await expect(offersApi.getOffersByProductId("p-1")).resolves.toEqual([{ id: "o-1" }]);
    expect(requestMock).toHaveBeenCalledWith(
      "/product/p-1/offers",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("createOffer valida id/nome/tipo/token", async () => {
    readStoredTokenMock.mockReturnValue("t-1");
    await expect(offersApi.createOffer("", { name: "X", type: "single_purchase" } as any)).rejects.toThrow(/Missing product id/i);
    await expect(offersApi.createOffer("p-1", { name: "", type: "" } as any)).rejects.toThrow(/Missing offer name or type/i);

    readStoredTokenMock.mockReturnValue(undefined);
    await expect(offersApi.createOffer("p-1", { name: "X", type: "single_purchase" } as any)).rejects.toThrow(
      /Missing authentication token/i
    );
  });

  it("createOffer envia body filtrado e retorna response", async () => {
    readStoredTokenMock.mockReturnValue("t-2");
    requestMock.mockResolvedValue({ id: "o-1" });

    await expect(
      offersApi.createOffer(
        "p-1",
        {
          name: "Oferta",
          type: "single_purchase",
          status: "active",
          offer_price: 10,
          free: false,
          back_redirect_url: undefined,
          next_redirect_url: null as any,
        } as any
      )
    ).resolves.toEqual({ id: "o-1" });

    const body = JSON.parse(requestMock.mock.calls[0][1].body);
    expect(body.back_redirect_url).toBeUndefined();
    expect(body.next_redirect_url).toBeUndefined();
    expect(body.name).toBe("Oferta");
  });

  it("updateOffer/deleteOffer validam ids e token", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(offersApi.updateOffer("p-1", "o-1", {} as any)).rejects.toThrow(/Missing authentication token/i);
    await expect(offersApi.deleteOffer("p-1", "o-1")).rejects.toThrow(/Missing authentication token/i);

    readStoredTokenMock.mockReturnValue("t-3");
    await expect(offersApi.updateOffer("", "o-1", {} as any)).rejects.toThrow(/Missing product id or offer id/i);
    await expect(offersApi.deleteOffer("", "o-1")).rejects.toThrow(/Missing product id or offer id/i);
  });

  it("createOfferPlan/createOfferBump exigem token", async () => {
    readStoredTokenMock.mockReturnValue(undefined);
    await expect(offersApi.createOfferPlan("p-1", "o-1", {} as any)).rejects.toThrow(/Missing authentication token/i);
    await expect(offersApi.createOfferBump("p-1", "o-1", {} as any)).rejects.toThrow(/Missing authentication token/i);
  });
});


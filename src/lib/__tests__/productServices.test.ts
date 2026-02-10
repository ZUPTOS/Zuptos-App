import * as libApi from "@/lib/api";
import { productApi } from "@/lib/services/products";
import { coproducersApi } from "@/lib/services/products/coproducers";
import { couponsApi } from "@/lib/services/products/coupons";
import { productsApi } from "@/lib/services/products/base";
import { strategiesApi } from "@/lib/services/products/strategies";
import { trackingsApi } from "@/lib/services/products/trackings";

jest.mock("../request", () => ({
  API_BASE_URL: "http://api.example.test",
  buildQuery: jest.fn(),
  readStoredToken: jest.fn(),
  request: jest.fn(),
}));

const requestMock = jest.requireMock("../request").request as jest.Mock;
const readStoredTokenMock = jest.requireMock("../request").readStoredToken as jest.Mock;
const buildQueryMock = jest.requireMock("../request").buildQuery as jest.Mock;

describe("lib/services/products request wrappers", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
    buildQueryMock.mockReset();
  });

  it("src/lib/api.ts exports: modulo carrega e expõe apis", () => {
    // Accessing the exports helps mark re-exports as used in coverage instrumentation.
    expect(typeof libApi.authApi).toBe("object");
    expect(typeof libApi.salesApi).toBe("object");
    expect(typeof libApi.productApi).toBe("object");
    expect(typeof libApi.kycApi).toBe("object");
    expect(typeof libApi.financesApi).toBe("object");
  });

  describe("productsApi", () => {
    it("listProducts: clampa page/limit e inclui header apenas quando ha token", async () => {
      buildQueryMock.mockReturnValue("?page=1&limit=10");
      requestMock.mockResolvedValueOnce([]);

      await expect(productsApi.listProducts({ page: 0, limit: 99 })).resolves.toEqual([]);
      expect(buildQueryMock).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(requestMock).toHaveBeenCalledWith(
        "/product?page=1&limit=10",
        expect.objectContaining({
          method: "GET",
          headers: undefined,
        })
      );

      buildQueryMock.mockReturnValue("?page=2&limit=1");
      requestMock.mockResolvedValueOnce([{ id: "p-1" }]);
      await productsApi.listProducts({ page: 2, limit: 0 }, "t-1");
      expect(buildQueryMock).toHaveBeenCalledWith({ page: 2, limit: 1 });
      expect(requestMock).toHaveBeenCalledWith(
        "/product?page=2&limit=1",
        expect.objectContaining({
          method: "GET",
          headers: { Authorization: "Bearer t-1" },
        })
      );
    });

    it("getProductById/deleteProduct: monta URL e respeita token opcional", async () => {
      requestMock.mockResolvedValueOnce({ id: "p-1" });
      await expect(productsApi.getProductById("p-1")).resolves.toEqual({ id: "p-1" });
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1",
        expect.objectContaining({ method: "GET", headers: undefined })
      );

      requestMock.mockResolvedValueOnce(undefined);
      await expect(productsApi.deleteProduct("p-2")).resolves.toBeUndefined();
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-2",
        expect.objectContaining({ method: "DELETE", headers: undefined })
      );
    });

    it("createProduct: valida payload/token e filtra undefined/null no body", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(productsApi.createProduct({ type: "x" } as any)).rejects.toThrow(/Missing name/i);
      await expect(productsApi.createProduct({ name: "n" } as any)).rejects.toThrow(/Missing type/i);
      await expect(productsApi.createProduct({ name: "n", type: "t" } as any)).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce({ id: "p-9" });
      await expect(
        productsApi.createProduct(
          {
            name: "Produto",
            type: "digital",
            description: undefined,
            category: null as any,
            internal_description: "interno",
          } as any,
          "t-1"
        )
      ).resolves.toEqual({ id: "p-9" });

      const [, opts] = requestMock.mock.calls[0] as any;
      const body = JSON.parse(opts.body);
      expect(body).toEqual({
        name: "Produto",
        type: "digital",
        internal_description: "interno",
      });
    });

    it("updateProductStatus: valida entradas/token e envia PATCH", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(productsApi.updateProductStatus("", "ACTIVE" as any, "t")).rejects.toThrow(/Missing product id/i);
      await expect(productsApi.updateProductStatus("p", "ACTIVE" as any)).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce({ id: "p-1", status: "ACTIVE" });
      await expect(productsApi.updateProductStatus("p-1", "ACTIVE" as any, "t-1")).resolves.toEqual({
        id: "p-1",
        status: "ACTIVE",
      });

      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({ Authorization: "Bearer t-1" }),
        })
      );
    });
  });

  describe("coproducersApi/couponsApi/trackingsApi/strategiesApi", () => {
    it("valida token e chama endpoints principais", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(coproducersApi.getCoproducersByProductId("p")).rejects.toThrow(/Missing authentication token/i);
      await expect(couponsApi.getProductCoupons("p")).rejects.toThrow(/Missing authentication token/i);
      await expect(trackingsApi.getPlansByProductId("p")).rejects.toThrow(/Missing authentication token/i);
      await expect(strategiesApi.getProductStrategy("p")).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce([{ id: "c-1" }]);
      await expect(coproducersApi.getCoproducersByProductId("p-1", "t")).resolves.toEqual([{ id: "c-1" }]);
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/coproducers",
        expect.objectContaining({ method: "GET", headers: { Authorization: "Bearer t" } })
      );

      requestMock.mockResolvedValueOnce({ id: "cp-1" });
      await coproducersApi.createCoproducer("p-1", { email: "a@b.com" } as any, "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/coproducers",
        expect.objectContaining({ method: "POST", headers: expect.objectContaining({ Authorization: "Bearer t" }) })
      );

      requestMock.mockResolvedValueOnce({ id: "cp-1" });
      await coproducersApi.updateCoproducer("p-1", "cp-1", { email: "x@y.com", percent: undefined } as any, "t");
      const copBody = JSON.parse(requestMock.mock.calls[requestMock.mock.calls.length - 1][1].body);
      expect(copBody).toEqual({ email: "x@y.com" });

      requestMock.mockResolvedValueOnce({ ok: true });
      await coproducersApi.deleteCoproducer("p-1", "cp-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/coproducers/cp-1",
        expect.objectContaining({ method: "DELETE" })
      );

      requestMock.mockResolvedValueOnce([{ id: "cup-1" }]);
      await couponsApi.getProductCoupons("p-1", "t");

      requestMock.mockResolvedValueOnce({ id: "cup-1" });
      await couponsApi.createProductCoupon("p-1", { name: "Cupom" } as any, "t");

      requestMock.mockResolvedValueOnce({ id: "cup-1" });
      await couponsApi.updateProductCoupon("p-1", "cup-1", { name: "Cupom", amount: undefined } as any, "t");
      const cupBody = JSON.parse(requestMock.mock.calls[requestMock.mock.calls.length - 1][1].body);
      expect(cupBody).toEqual({ name: "Cupom" });

      requestMock.mockResolvedValueOnce({ ok: true });
      await couponsApi.deleteProductCoupon("p-1", "cup-1", "t");

      requestMock.mockResolvedValueOnce([{ id: "pl-1" }]);
      await trackingsApi.getPlansByProductId("p-1", "t");

      requestMock.mockResolvedValueOnce({ id: "pl-1" });
      await trackingsApi.createPlan("p-1", { name: "Plano" } as any, "t");

      requestMock.mockResolvedValueOnce({ id: "pl-1" });
      await trackingsApi.updateTracking("p-1", "pl-1", { name: "Plano", url: undefined } as any, "t");
      const planBody = JSON.parse(requestMock.mock.calls[requestMock.mock.calls.length - 1][1].body);
      expect(planBody).toEqual({ name: "Plano" });

      requestMock.mockResolvedValueOnce({ ok: true });
      await trackingsApi.deleteTracking("p-1", "pl-1", "t");

      requestMock.mockResolvedValueOnce([{ id: "st-1" }]);
      await strategiesApi.getProductStrategy("p-1", "t");

      requestMock.mockResolvedValueOnce({ id: "st-1" });
      await strategiesApi.createProductStrategy("p-1", { name: "Estrategia" } as any, "t");

      requestMock.mockResolvedValueOnce({ id: "st-1" });
      await strategiesApi.updateProductStrategy("p-1", "st-1", { name: "Estrategia" } as any, "t");

      requestMock.mockResolvedValueOnce(undefined);
      await expect(strategiesApi.deleteProductStrategy("p-1", "st-1", "t")).resolves.toBeUndefined();
    });
  });

  it("productApi (index): agrega metodos sem quebrar", async () => {
    buildQueryMock.mockReturnValue("?page=1&limit=10");
    requestMock.mockResolvedValueOnce([]);

    await expect(productApi.listProducts()).resolves.toEqual([]);
  });
});

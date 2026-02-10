import { kycApi } from "@/lib/services/kyc";
import { checkoutRequests } from "@/lib/services/products/checkouts/checkout";
import { depoimentsRequests } from "@/lib/services/products/checkouts/depoiments";
import { messagesRequests } from "@/lib/services/products/checkouts/messages";
import { paymentMethodRequests } from "@/lib/services/products/checkouts/paymentMethod";
import { deliverablesApi } from "@/lib/services/products/deliverables";
import { offersApi } from "@/lib/services/products/offers";
import { transactionsFinanceApi } from "@/lib/services/finances/transactions";

jest.mock("@/lib/request", () => {
  const request = jest.fn();
  const readStoredToken = jest.fn();
  const buildQuery = jest.fn();
  return {
    API_BASE_URL: "https://api.example.com",
    request,
    readStoredToken,
    buildQuery,
  };
});

const { request: requestMock, readStoredToken: readStoredTokenMock, buildQuery: buildQueryMock } =
  jest.requireMock("@/lib/request") as {
    request: jest.Mock;
    readStoredToken: jest.Mock;
    buildQuery: jest.Mock;
  };

describe("lib/services request wrappers", () => {
  beforeEach(() => {
    requestMock.mockReset();
    readStoredTokenMock.mockReset();
    buildQueryMock.mockReset();
  });

  describe("kycApi", () => {
    it("getStatus: sem token retorna default e com token normaliza status", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(kycApi.getStatus()).resolves.toEqual({ exists: false, approved: false, rawStatus: undefined });

      requestMock.mockResolvedValueOnce([{ status: "APPROVED" }]);
      await expect(kycApi.getStatus("t")).resolves.toEqual({ exists: true, approved: true, rawStatus: "approved" });

      requestMock.mockResolvedValueOnce({ id: "1", status: "pending" });
      await expect(kycApi.getStatus("t")).resolves.toEqual({ exists: true, approved: false, rawStatus: "pending" });

      requestMock.mockResolvedValueOnce(123 as any);
      await expect(kycApi.getStatus("t")).resolves.toEqual({ exists: false, approved: false, rawStatus: undefined });

      requestMock.mockRejectedValueOnce(new Error("boom"));
      await expect(kycApi.getStatus("t")).resolves.toEqual({ exists: false, approved: false, rawStatus: undefined });
    });

    it("create/update/uploadDocument: valida token/ids", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(kycApi.create({} as any)).rejects.toThrow(/Missing auth token/i);
      await expect(kycApi.update("", {} as any, "t")).rejects.toThrow(/Missing KYC id/i);
      await expect(kycApi.uploadDocument("", new Blob(["x"]), "t")).rejects.toThrow(/Missing document name/i);

      requestMock.mockResolvedValueOnce({ id: "kyc-1" });
      await expect(kycApi.create({ foo: "bar" } as any, "t")).resolves.toEqual({ id: "kyc-1" });
    });

    it("get/update/uploadDocument: cobre fluxos de sucesso e validacoes", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(kycApi.get()).resolves.toBeNull();
      await expect(kycApi.update("kyc-1", {} as any)).rejects.toThrow(/Missing auth token for KYC update/i);
      await expect(kycApi.uploadDocument("rg", new Blob(["x"]))).rejects.toThrow(/Missing auth token for KYC document upload/i);

      requestMock.mockResolvedValueOnce({ id: "kyc-1" });
      await expect(kycApi.get("t")).resolves.toEqual({ id: "kyc-1" });

      requestMock.mockResolvedValueOnce(undefined);
      await expect(kycApi.get("t")).resolves.toBeNull();

      requestMock.mockResolvedValueOnce({ id: "kyc-2" });
      await expect(kycApi.update("kyc-2", { foo: "bar" } as any, "t")).resolves.toEqual({ id: "kyc-2" });
      expect(requestMock).toHaveBeenCalledWith(
        "/kyc/kyc-2",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({ Authorization: "Bearer t" }),
        })
      );

      requestMock.mockResolvedValueOnce({ ok: true });
      await expect(kycApi.uploadDocument("my doc", new Blob(["x"]), "t")).resolves.toEqual({ ok: true });
      const blobCall = requestMock.mock.calls[requestMock.mock.calls.length - 1] as any;
      const blobForm = blobCall[1].body as FormData;
      expect((blobForm.get("file") as File).name).toBe("my doc.bin");
      expect(blobCall[0]).toBe("/kyc/document/my%20doc");

      requestMock.mockResolvedValueOnce({ ok: true });
      await expect(kycApi.uploadDocument("selfie", new File(["x"], "selfie.png"), "t")).resolves.toEqual({ ok: true });
      const fileCall = requestMock.mock.calls[requestMock.mock.calls.length - 1] as any;
      const fileForm = fileCall[1].body as FormData;
      expect((fileForm.get("file") as File).name).toBe("selfie.png");
    });
  });

  describe("checkoutRequests", () => {
    it("createCheckout: valida entradas e chama request filtrando undefined", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(checkoutRequests.createCheckout("", { name: "x" } as any)).rejects.toThrow(/Missing product id/i);
      await expect(checkoutRequests.createCheckout("p", {} as any)).rejects.toThrow(/Missing checkout name/i);
      await expect(checkoutRequests.createCheckout("p", { name: "x" } as any)).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce({ id: "c-1" });
      const payload = { name: "Checkout", theme: undefined, required_address: true } as any;
      await checkoutRequests.createCheckout("p-1", payload, "t-1");

      expect(requestMock).toHaveBeenCalledWith("/product/p-1/checkouts", expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer t-1" }),
      }));
      const body = JSON.parse((requestMock.mock.calls[0][1] as any).body);
      expect(body.theme).toBeUndefined();
      expect(body.required_address).toBe(true);
    });

    it("uploadCheckoutAsset: monta query e envia FormData", async () => {
      buildQueryMock.mockReturnValue("?type=logo");
      requestMock.mockResolvedValueOnce({ ok: true });

      await checkoutRequests.uploadCheckoutAsset("p-1", "c-1", "logo", new Blob(["x"]), "t-1");
      expect(buildQueryMock).toHaveBeenCalledWith({ type: "logo" });
      expect(requestMock).toHaveBeenCalledWith("/product/p-1/checkouts/c-1/upload?type=logo", expect.any(Object));
    });

    it("update/getById/delete: valida entradas/token e chama request", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(checkoutRequests.updateCheckout("", "c", {} as any, "t")).rejects.toThrow(/Missing product or checkout id/i);
      await expect(checkoutRequests.updateCheckout("p", "", {} as any, "t")).rejects.toThrow(/Missing product or checkout id/i);
      await expect(checkoutRequests.updateCheckout("p", "c", {} as any)).rejects.toThrow(/Missing authentication token for checkout update/i);

      requestMock.mockResolvedValueOnce({ id: "c-1" });
      await checkoutRequests.updateCheckout("p-1", "c-1", { name: "Checkout", theme: null, foo: undefined } as any, "t");
      const updateBody = JSON.parse((requestMock.mock.calls[0][1] as any).body);
      expect(updateBody).toEqual({ name: "Checkout" });

      requestMock.mockResolvedValueOnce([{ id: "c-1" }]);
      await checkoutRequests.getCheckoutsByProductId("p-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/checkouts",
        expect.objectContaining({ method: "GET", headers: expect.objectContaining({ Authorization: "Bearer t" }) })
      );

      requestMock.mockResolvedValueOnce({ id: "c-1" });
      await checkoutRequests.getCheckoutById("p-1", "c-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/checkouts/c-1",
        expect.objectContaining({ method: "GET" })
      );

      await expect(checkoutRequests.deleteCheckout("", "c", "t")).rejects.toThrow(/Missing product or checkout id/i);
      await expect(checkoutRequests.deleteCheckout("p", "c")).rejects.toThrow(/Missing authentication token for checkout deletion/i);

      requestMock.mockResolvedValueOnce(undefined);
      await expect(checkoutRequests.deleteCheckout("p-1", "c-1", "t")).resolves.toBeUndefined();
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p-1/checkouts/c-1",
        expect.objectContaining({ method: "DELETE", headers: { Authorization: "Bearer t" } })
      );
    });
  });

  describe("paymentMethodRequests/messagesRequests", () => {
    it("getCheckoutPaymentMethods/getCheckoutMessages: 404 vira lista vazia", async () => {
      requestMock.mockRejectedValueOnce({ status: 404 });
      await expect(paymentMethodRequests.getCheckoutPaymentMethods("p", "c", "t")).resolves.toEqual([]);

      requestMock.mockRejectedValueOnce({ status: 404 });
      await expect(messagesRequests.getCheckoutMessages("p", "c", "t")).resolves.toEqual([]);

      requestMock.mockRejectedValueOnce({ status: 404 });
      await expect(messagesRequests.getCheckoutMessageById("p", "c", "m", "t")).resolves.toBeNull();
    });

    it("messagesRequests: valida token, filtra undefined e rethrow em status != 404", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(messagesRequests.getCheckoutMessages("p", "c")).rejects.toThrow(/Missing authentication token for checkout messages/i);
      await expect(messagesRequests.createCheckoutMessage("p", "c", {} as any)).rejects.toThrow(
        /Missing authentication token for checkout message/i
      );
      await expect(messagesRequests.updateCheckoutMessage("p", "c", "m", {} as any)).rejects.toThrow(
        /Missing authentication token for checkout message/i
      );

      requestMock.mockResolvedValueOnce({ id: "m-1" });
      await messagesRequests.createCheckoutMessage("p", "c", { title: "x", extra: undefined } as any, "t");
      const createBody = JSON.parse((requestMock.mock.calls[0][1] as any).body);
      expect(createBody).toEqual({ title: "x" });

      requestMock.mockResolvedValueOnce({ id: "m-1" });
      await messagesRequests.updateCheckoutMessage("p", "c", "m-1", { title: "y", extra: undefined } as any, "t");
      const patchBody = JSON.parse((requestMock.mock.calls[1][1] as any).body);
      expect(patchBody).toEqual({ title: "y" });

      requestMock.mockRejectedValueOnce({ status: 500 });
      await expect(messagesRequests.getCheckoutMessages("p", "c", "t")).rejects.toEqual({ status: 500 });

      requestMock.mockRejectedValueOnce({ status: 500 });
      await expect(messagesRequests.getCheckoutMessageById("p", "c", "m", "t")).rejects.toEqual({ status: 500 });
    });

    it("updateCheckoutPaymentMethod: valida id", async () => {
      await expect(paymentMethodRequests.updateCheckoutPaymentMethod("p", "c", "", {} as any, "t")).rejects.toThrow(
        /Missing payment method id/i
      );
    });
  });

  describe("depoimentsRequests", () => {
    it("create/update/delete/get/upload: valida token e chama request", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(
        depoimentsRequests.createCheckoutDepoiment("p", "c", { name: "n", depoiment: "d" })
      ).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce({ id: "dep-1" });
      await expect(
        depoimentsRequests.createCheckoutDepoiment("p", "c", { name: "n", depoiment: "d" }, "t")
      ).resolves.toEqual({ id: "dep-1" });
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/checkouts/c/depoiments",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer t" }),
        })
      );

      requestMock.mockResolvedValueOnce({ ok: true });
      await depoimentsRequests.updateCheckoutDepoiment("p", "c", "dep-1", { name: "x", active: undefined }, "t");
      const updateBody = JSON.parse((requestMock.mock.calls[1][1] as any).body);
      expect(updateBody.active).toBeUndefined();
      expect(updateBody.name).toBe("x");

      requestMock.mockResolvedValueOnce([{ id: "dep-1" }]);
      await depoimentsRequests.getCheckoutDepoiments("p", "c", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/checkouts/c/depoiments",
        expect.objectContaining({ method: "GET" })
      );

      requestMock.mockResolvedValueOnce({ id: "dep-1" });
      await depoimentsRequests.getCheckoutDepoiment("p", "c", "dep-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/checkouts/c/depoiments/dep-1",
        expect.objectContaining({ method: "GET" })
      );

      requestMock.mockResolvedValueOnce(undefined);
      await depoimentsRequests.deleteCheckoutDepoiment("p", "c", "dep-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/checkouts/c/depoiments/dep-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });

    it("uploadCheckoutDepoimentImage: valida ids", async () => {
      await expect(
        depoimentsRequests.uploadCheckoutDepoimentImage("", "c", "d", new Blob(["x"]), "t")
      ).rejects.toThrow(/Missing ids/i);
    });

    it("uploadCheckoutDepoimentImage: envia FormData", async () => {
      requestMock.mockResolvedValueOnce({ url: "https://cdn/img.png" });
      await depoimentsRequests.uploadCheckoutDepoimentImage("p", "c", "d", new File(["x"], "a.png"), "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/checkouts/c/depoiments/d/upload",
        expect.objectContaining({ method: "POST", body: expect.any(FormData) })
      );
    });
  });

  describe("deliverablesApi/offersApi", () => {
    it("deliverablesApi.createDeliverable valida payload e chama request", async () => {
      await expect(deliverablesApi.createDeliverable("", { name: "x", type: "file" } as any, "t")).rejects.toThrow(
        /Missing product id/i
      );
      await expect(deliverablesApi.createDeliverable("p", { name: "", type: "file" } as any, "t")).rejects.toThrow(
        /Missing deliverable name/i
      );
      await expect(deliverablesApi.createDeliverable("p", { name: "x", type: "" } as any, "t")).rejects.toThrow(
        /Missing deliverable type/i
      );
      await expect(deliverablesApi.createDeliverable("p", { name: "x", type: "link" } as any, "t")).rejects.toThrow(
        /Missing deliverable content/i
      );

      requestMock.mockResolvedValueOnce({ id: "d-1" });
      await expect(
        deliverablesApi.createDeliverable(
          "p",
          { name: "x", type: "FILE", status: undefined, content: "c" } as any,
          "t"
        )
      ).resolves.toEqual({ id: "d-1" });
    });

    it("deliverablesApi.update/delete/upload: valida entradas e token", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(deliverablesApi.updateDeliverable("", "d", { name: "x" } as any, "t")).rejects.toThrow(
        /Missing deliverable id/i
      );
      await expect(deliverablesApi.updateDeliverable("p", "d", {} as any, "t")).rejects.toThrow(/No fields provided/i);
      await expect(deliverablesApi.updateDeliverable("p", "d", { name: "x" } as any)).rejects.toThrow(
        /Missing authentication token/i
      );

      requestMock.mockResolvedValueOnce({ id: "d-1" });
      await deliverablesApi.updateDeliverable("p", "d", { name: "x", status: undefined } as any, "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/deliverables/d",
        expect.objectContaining({ method: "PATCH" })
      );

      await expect(deliverablesApi.deleteDeliverable("", "d", "t")).rejects.toThrow(/Missing deliverable id/i);
      await expect(deliverablesApi.deleteDeliverable("p", "d")).rejects.toThrow(/Missing authentication token/i);

      requestMock.mockResolvedValueOnce(undefined);
      await deliverablesApi.deleteDeliverable("p", "d", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/deliverables/d",
        expect.objectContaining({ method: "DELETE" })
      );

      await expect(deliverablesApi.uploadDeliverableFile("", "d", new File(["x"], "a.txt"), "t")).rejects.toThrow(
        /Missing deliverable id/i
      );
      await expect(deliverablesApi.uploadDeliverableFile("p", "d", new File(["x"], "a.txt"))).rejects.toThrow(
        /Missing authentication token/i
      );

      requestMock.mockResolvedValueOnce({ id: "d-1" });
      await deliverablesApi.uploadDeliverableFile("p", "d", new File(["x"], "a.txt"), "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/product/p/deliverables/d/upload",
        expect.objectContaining({ method: "POST", body: expect.any(FormData) })
      );
    });

    it("offersApi.createOffer valida entradas e chama request", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(offersApi.createOffer("", { name: "x", type: "single" } as any)).rejects.toThrow(/Missing product id/i);
      await expect(offersApi.createOffer("p", { name: "", type: "" } as any, "t")).rejects.toThrow(/Missing offer name/i);

      requestMock.mockResolvedValueOnce({ id: "o-1" });
      await expect(offersApi.createOffer("p", { name: "Oferta", type: "single" } as any, "t")).resolves.toEqual({
        id: "o-1",
      });
    });
  });

  describe("transactionsFinanceApi", () => {
    it("valida token e monta query string", async () => {
      readStoredTokenMock.mockReturnValue(undefined);
      await expect(transactionsFinanceApi.getTransactions()).rejects.toThrow(/Missing auth token/i);
      await expect(transactionsFinanceApi.getTransactionById("1")).rejects.toThrow(/Missing auth token/i);
      await expect(transactionsFinanceApi.getTransactionsByType("chargeback")).rejects.toThrow(/Missing auth token/i);

      requestMock.mockResolvedValueOnce({ data: [] });
      await transactionsFinanceApi.getTransactions({ page: 2, limit: 10 }, "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/finance/transactions?page=2&limit=10",
        expect.objectContaining({ method: "GET", headers: expect.objectContaining({ Authorization: "Bearer t" }) })
      );

      requestMock.mockResolvedValueOnce({ ok: true });
      await transactionsFinanceApi.getTransactionById("tx-1", "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/finance/transactions/tx-1",
        expect.objectContaining({ method: "GET" })
      );

      requestMock.mockResolvedValueOnce({ data: [] });
      await transactionsFinanceApi.getTransactionsByType("pix", { limit: 5 }, "t");
      expect(requestMock).toHaveBeenCalledWith(
        "/finance/transactions/type/pix?limit=5",
        expect.objectContaining({ method: "GET" })
      );
    });
  });
});

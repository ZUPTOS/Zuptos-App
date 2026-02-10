import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useOffers } from "@/views/editar-produto/hooks/useOffers";

jest.mock("@/shared/ui/notification-toast", () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const notifyApiErrorMock = jest.fn();
jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

jest.mock("@/lib/api", () => {
  const productApi = {
    getOffersByProductId: jest.fn(),
    getCheckoutsByProductId: jest.fn(),
    listProducts: jest.fn(),
    createOffer: jest.fn(),
    updateOffer: jest.fn(),
    deleteOffer: jest.fn(),
    createOfferPlan: jest.fn(),
    createOfferBump: jest.fn(),
  };
  return {
    productApi,
    ProductOfferType: {
      SUBSCRIPTION: "subscription",
      SINGLE_PURCHASE: "single_purchase",
    },
  };
});

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };
const { notify } = jest.requireMock("@/shared/ui/notification-toast") as { notify: Record<string, jest.Mock> };

describe("useOffers", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notify.error.mockReset();
    notify.success.mockReset();
    notifyApiErrorMock.mockReset();
    localStorage.clear();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("carrega offers e, ao abrir modal, carrega checkouts e ofertas para order bump", async () => {
    productApi.getOffersByProductId.mockImplementation(async (id: string) => {
      if (id === "p-1") return [{ id: "o-1", name: "Oferta 1", type: "single_purchase" }];
      if (id === "p-2") return [{ id: "o-2", name: "Oferta 2", type: "single_purchase" }];
      return [];
    });
    productApi.getCheckoutsByProductId.mockResolvedValue([{ id: "chk-1", name: "Checkout 1" }]);
    productApi.listProducts.mockResolvedValue([
      { id: "p-1", name: "Produto Principal" },
      { id: "p-2", name: "Produto 2" },
    ]);

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.offers).toHaveLength(1);

    act(() => result.current.openCreateOffer());

    await waitFor(() => expect(result.current.checkoutOptionsLoading).toBe(false));
    await waitFor(() => expect(result.current.orderBumpOffersLoading).toBe(false));

    expect(result.current.checkoutOptions).toHaveLength(1);
    expect(result.current.orderBumpProducts).toHaveLength(1);
    expect(result.current.orderBumpOffers).toHaveLength(1);
  });

  it("handleCopyAccess copia e limpa copiedOfferId apos timeout", async () => {
    jest.useFakeTimers();
    productApi.getOffersByProductId.mockResolvedValue([]);

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleCopyAccess("https://example.com", "offer-1");
    });
    expect(result.current.copiedOfferId).toBe("offer-1");

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copiedOfferId).toBeNull();
    jest.useRealTimers();
  });

  it("handleCreateOffer cria oferta de assinatura com plano e order bump", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.getCheckoutsByProductId.mockResolvedValue([{ id: "chk-1", name: "Checkout 1" }]);
    productApi.listProducts.mockResolvedValue([]);
    productApi.createOffer.mockResolvedValue({ id: "offer-1" });
    productApi.createOfferPlan.mockResolvedValue({ id: "plan-1" });
    productApi.createOfferBump.mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.openCreateOffer());
    await waitFor(() => expect(result.current.checkoutOptionsLoading).toBe(false));

    act(() => {
      result.current.setOfferType("assinatura");
      result.current.setOfferName("Oferta Assinatura");
      result.current.setSubscriptionFrequency("mensal");
      result.current.setSubscriptionTitle("Plano Mensal");
      result.current.setSubscriptionPrice("R$ 20,00");
      result.current.setOrderBumpEnabled(true);
      result.current.setOrderBumps([{ title: "Bump", offer: "o-2" } as any]);
    });

    await act(async () => {
      await result.current.handleCreateOffer();
    });

    expect(productApi.createOffer).toHaveBeenCalledWith(
      "p-1",
      expect.objectContaining({
        name: "Oferta Assinatura",
        type: "subscription",
        subscription_plan: expect.objectContaining({
          type: "monthly",
          name: "Plano Mensal",
          plan_price: 20,
        }),
      }),
      "t-1"
    );

    expect(productApi.createOfferPlan).toHaveBeenCalledWith(
      "p-1",
      "offer-1",
      expect.objectContaining({
        type: "monthly",
        name: "Plano Mensal",
        plan_price: 20,
      }),
      "t-1"
    );

    expect(productApi.createOfferBump).toHaveBeenCalledWith(
      "p-1",
      "offer-1",
      expect.objectContaining({ bumped_offer_show_id: "o-2", title: "Bump" }),
      "t-1"
    );

    expect(result.current.showOfferModal).toBe(false);
  });

  it("openEditOffer mapeia dados da oferta (assinatura) e abre modal", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.getCheckoutsByProductId.mockResolvedValue([]);
    productApi.listProducts.mockResolvedValue([]);

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.openEditOffer({
        id: "offer-9",
        name: "Oferta X",
        type: "subscription",
        status: "inactive",
        free: false,
        offer_price: 99.9,
        back_redirect_url: "https://example.com/back",
        next_redirect_url: "https://example.com/next",
        checkout_id: "chk-1",
        subscription_plan: {
          type: "quarterly",
          name: "Plano Tri",
          plan_price: 20,
          discount_price: 15,
          price_first_cycle: 5,
          cycles: 3,
          default: true,
          status: "active",
        },
      } as any);
    });

    expect(result.current.showOfferModal).toBe(true);
    expect(result.current.editingOffer?.id).toBe("offer-9");
    expect(result.current.offerType).toBe("assinatura");
    expect(result.current.offerName).toBe("Oferta X");
    expect(result.current.offerStatus).toBe("inactive");
    expect(result.current.offerFree).toBe(false);
    expect(result.current.offerBackRedirect).toBe("https://example.com/back");
    expect(result.current.offerNextRedirect).toBe("https://example.com/next");
    expect(result.current.selectedCheckoutId).toBe("chk-1");
    expect(result.current.subscriptionFrequency).toBe("trimestral");
    expect(result.current.subscriptionTitle).toBe("Plano Tri");
    expect(result.current.subscriptionPrice).toMatch(/20/);
    expect(result.current.subscriptionPromoPrice).toMatch(/15/);
    expect(result.current.firstChargePriceEnabled).toBe(true);
    expect(result.current.fixedChargesEnabled).toBe(true);
    expect(result.current.subscriptionDefault).toBe(true);
  });

  it("handleCopyAccess ignora repeticao em curto intervalo e trata falha do clipboard", async () => {
    jest.useFakeTimers();
    let now = 1000;
    const nowSpy = jest.spyOn(Date, "now").mockImplementation(() => now);

    productApi.getOffersByProductId.mockResolvedValue([]);
    const clipboardWrite = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleCopyAccess("https://example.com", "offer-1");
    });
    now = 1500;
    await act(async () => {
      await result.current.handleCopyAccess("https://example.com", "offer-1");
    });
    expect(clipboardWrite).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copiedOfferId).toBeNull();

    clipboardWrite.mockRejectedValueOnce(new Error("no clipboard"));
    await act(async () => {
      await result.current.handleCopyAccess("https://example.com/2", "offer-2");
    });
    expect(clipboardWrite).toHaveBeenCalledTimes(2);

    nowSpy.mockRestore();
    jest.useRealTimers();
  });

  it("handleSaveOrderBump valida, adiciona, edita, cancela e remove", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.getCheckoutsByProductId.mockResolvedValue([]);
    productApi.listProducts.mockResolvedValue([]);

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setOfferType("preco_unico");
      result.current.setOfferPrice("R$ 10,00");
    });

    act(() => result.current.handleSaveOrderBump());
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/Selecione produto e oferta/i));

    act(() =>
      result.current.setOrderBumpForm({
        product: "p-2",
        offer: "o-2",
        title: "",
        tag: "",
        price: "",
        description: "",
      })
    );
    act(() => result.current.handleSaveOrderBump());
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/Informe o título/i));

    act(() =>
      result.current.setOrderBumpForm({
        product: "p-2",
        offer: "o-2",
        title: "Bump",
        tag: "novidade",
        price: "5",
        description: "Desc",
      })
    );
    act(() => result.current.handleSaveOrderBump());
    expect(result.current.orderBumps).toHaveLength(1);
    expect(result.current.editingOrderBumpIndex).toBeNull();

    act(() => result.current.handleEditOrderBump(0));
    expect(result.current.editingOrderBumpIndex).toBe(0);

    act(() => result.current.handleCancelOrderBumpEdit());
    expect(result.current.editingOrderBumpIndex).toBeNull();

    act(() => result.current.handleEditOrderBump(0));
    act(() => result.current.setOrderBumpForm(prev => ({ ...prev, title: "Bump 2" })));
    act(() => result.current.handleSaveOrderBump());
    expect(result.current.orderBumps).toHaveLength(1);
    expect(result.current.orderBumps[0]?.title).toBe("Bump 2");

    act(() => result.current.handleDeleteOrderBump(0));
    expect(result.current.orderBumps).toHaveLength(0);
  });

  it("handleCreateOffer usa updateOffer quando esta editando e reporta erro via notifyApiError", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.getCheckoutsByProductId.mockResolvedValue([]);
    productApi.listProducts.mockResolvedValue([]);
    productApi.updateOffer.mockRejectedValueOnce(new Error("update fail"));
    productApi.updateOffer.mockResolvedValueOnce({ id: "offer-10" });

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openEditOffer({ id: "offer-10", name: "Old", type: "single_purchase" } as any));
    act(() => {
      result.current.setOfferName("Nova");
      result.current.setOfferPrice("R$ 10,00");
    });

    await act(async () => {
      await result.current.handleCreateOffer();
    });
    expect(productApi.updateOffer).toHaveBeenCalled();
    expect(notifyApiErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ title: expect.any(String) }));
    expect(result.current.showOfferModal).toBe(true);

    await act(async () => {
      await result.current.handleCreateOffer();
    });
    expect(result.current.showOfferModal).toBe(false);
  });

  it("handleCreateOffer exige order bumps quando habilitado e cria oferta apenas quando valido", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.getCheckoutsByProductId.mockResolvedValue([]);
    productApi.listProducts.mockResolvedValue([]);
    productApi.createOffer.mockResolvedValue({ id: "offer-1" });

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCreateOffer());
    act(() => {
      result.current.setOfferPrice("R$ 10,00");
      result.current.setOrderBumpEnabled(true);
      result.current.setOrderBumps([]);
    });

    await act(async () => {
      await result.current.handleCreateOffer();
    });
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/Order bump não especificado/i));
    expect(productApi.createOffer).not.toHaveBeenCalled();
  });

  it("handleDeleteOffer remove e recarrega, e usa notifyApiError quando falha", async () => {
    productApi.getOffersByProductId.mockResolvedValue([]);
    productApi.deleteOffer.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOffers({ productId: "p-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setOfferDeleteTarget({ id: "offer-del", name: "Del" } as any));
    await act(async () => {
      await result.current.handleDeleteOffer();
    });
    expect(productApi.deleteOffer).toHaveBeenCalledWith("p-1", "offer-del", "t-1");
    expect(result.current.offerDeleteTarget).toBeNull();

    productApi.deleteOffer.mockRejectedValueOnce(new Error("delete fail"));
    act(() => result.current.setOfferDeleteTarget({ id: "offer-del2", name: "Del2" } as any));
    await act(async () => {
      await result.current.handleDeleteOffer();
    });
    expect(notifyApiErrorMock).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ title: expect.any(String) }));
  });
});

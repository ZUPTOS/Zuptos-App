import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useUpsell } from "@/views/editar-produto/hooks/useUpsell";

const notifyApiErrorMock = jest.fn();
jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

jest.mock("@/lib/api", () => ({
  productApi: {
    getProductStrategy: jest.fn(),
    getOffersByProductId: jest.fn(),
    createProductStrategy: jest.fn(),
    updateProductStrategy: jest.fn(),
    deleteProductStrategy: jest.fn(),
  },
}));

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };

describe("useUpsell", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notifyApiErrorMock.mockReset();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("carrega estrategias/ofertas e expõe helpers", async () => {
    productApi.getProductStrategy.mockResolvedValue({ data: [{ id: "s-1", name: "S1", offer_id: "o-1" }] });
    productApi.getOffersByProductId.mockResolvedValue([{ id: "o-1", name: "Oferta 1", offer_price: 10 }]);

    const { result } = renderHook(() => useUpsell({ productId: "p-up-1", token: "t-1", withLoading }));

    await waitFor(() => expect(result.current.strategiesLoading).toBe(false));
    await waitFor(() => expect(result.current.offersLoading).toBe(false));

    expect(result.current.strategies).toHaveLength(1);
    expect(result.current.offers).toHaveLength(1);
    expect(result.current.offerNameById("o-1")).toBe("Oferta 1");
    expect(result.current.offerById("o-1")?.id).toBe("o-1");
    expect(result.current.formatOfferPrice(12)).toContain("R$");
    expect(result.current.formatOfferPrice(12)).toContain("12,00");
    expect(result.current.formatOfferPrice("not-number")).toBeUndefined();

    expect(result.current.resolveOfferId({ offer: "o-1" } as any)).toBe("o-1");
    expect(result.current.resolveOfferId({ offer_id: "o-2" } as any)).toBe("o-2");
  });

  it("handleCopyScript copia e limpa copiedStrategyId", async () => {
    jest.useFakeTimers();
    productApi.getProductStrategy.mockResolvedValue([]);
    productApi.getOffersByProductId.mockResolvedValue([]);

    const { result } = renderHook(() => useUpsell({ productId: "p-up-2", token: "t-2", withLoading }));
    await waitFor(() => expect(result.current.strategiesLoading).toBe(false));

    await act(async () => {
      await result.current.handleCopyScript("https://example.com/script.js", "s-1");
    });
    expect(result.current.copiedStrategyId).toBe("s-1");

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.copiedStrategyId).toBeNull();
    jest.useRealTimers();
  });

  it("cria/atualiza/deleta estrategia e trata erro", async () => {
    productApi.getProductStrategy.mockResolvedValue([]);
    productApi.getOffersByProductId.mockResolvedValue([{ id: "o-1", name: "Oferta 1" }]);
    productApi.createProductStrategy.mockResolvedValue({ id: "s-1" });
    productApi.updateProductStrategy.mockResolvedValue({ ok: true });
    productApi.deleteProductStrategy.mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpsell({ productId: "p-up-3", token: "t-3", withLoading }));
    await waitFor(() => expect(result.current.strategiesLoading).toBe(false));

    // Early return: missing type/productId
    await act(async () => {
      await result.current.handleCreateStrategy();
    });
    expect(productApi.createProductStrategy).not.toHaveBeenCalled();

    act(() => {
      result.current.setStrategyForm(prev => ({ ...prev, type: "upsell", productId: "o-1", name: "Minha estrategia" }));
    });
    await act(async () => {
      await result.current.handleCreateStrategy();
    });
    expect(productApi.createProductStrategy).toHaveBeenCalledWith(
      "p-up-3",
      expect.objectContaining({ type: "upsell", offer_id: "o-1" }),
      "t-3"
    );

    // Edit path -> update
    act(() => result.current.openEditStrategy({ id: "s-1", name: "S1", type: "upsell", offer: "o-1" } as any));
    await act(async () => {
      await result.current.handleCreateStrategy();
    });
    expect(productApi.updateProductStrategy).toHaveBeenCalled();

    // Delete
    act(() => result.current.setDeleteTarget({ id: "s-1" } as any));
    await act(async () => {
      await result.current.handleDeleteStrategy();
    });
    expect(productApi.deleteProductStrategy).toHaveBeenCalledWith("p-up-3", "s-1", "t-3");

    // Error path
    productApi.createProductStrategy.mockRejectedValueOnce(new Error("fail"));
    act(() => {
      result.current.openCreateStrategy();
      result.current.setStrategyForm(prev => ({ ...prev, type: "upsell", productId: "o-1" }));
    });
    await act(async () => {
      await result.current.handleCreateStrategy();
    });
    expect(notifyApiErrorMock).toHaveBeenCalled();
  });
});

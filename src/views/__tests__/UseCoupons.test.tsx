import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useCoupons } from "@/views/editar-produto/hooks/useCoupons";

const notifyApiErrorMock = jest.fn();
jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

jest.mock("@/lib/api", () => ({
  productApi: {
    getProductCoupons: jest.fn(),
    createProductCoupon: jest.fn(),
    updateProductCoupon: jest.fn(),
    deleteProductCoupon: jest.fn(),
  },
}));

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };

describe("useCoupons", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notifyApiErrorMock.mockReset();
  });

  it("carrega cupons e abre edicao com unidade percent", async () => {
    productApi.getProductCoupons.mockResolvedValue([{ id: "c-1", coupon_code: "OFF10", is_percentage: true, discount_amount: 10 }]);

    const { result } = renderHook(() => useCoupons({ productId: "p-c-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.couponsLoading).toBe(false));
    expect(result.current.coupons).toHaveLength(1);

    act(() => result.current.openEditCoupon(result.current.coupons[0] as any));
    expect(result.current.showCouponModal).toBe(true);
    expect(result.current.couponUnit).toBe("percent");
    expect(result.current.editingCoupon?.id).toBe("c-1");
  });

  it("handleSaveCoupon valida sessao e campos numericos", async () => {
    productApi.getProductCoupons.mockResolvedValue([]);
    const { result } = renderHook(() => useCoupons({ productId: undefined, token: undefined, withLoading }));

    await act(async () => {
      await result.current.handleSaveCoupon();
    });
    expect(result.current.couponsError).toMatch(/Sessão expirada/i);

    const { result: result2 } = renderHook(() => useCoupons({ productId: "p-c-2", token: "t-2", withLoading }));
    await waitFor(() => expect(result2.current.couponsLoading).toBe(false));

    act(() => result2.current.openCreateCoupon());
    act(() => result2.current.setCouponForm(prev => ({ ...prev, discount_amount: "abc" })));
    await act(async () => {
      await result2.current.handleSaveCoupon();
    });
    expect(result2.current.couponsError).toMatch(/desconto válido/i);

    act(() =>
      result2.current.setCouponForm(prev => ({ ...prev, discount_amount: "R$ 10,00", limit_usage: "abc" }))
    );
    await act(async () => {
      await result2.current.handleSaveCoupon();
    });
    expect(result2.current.couponsError).toMatch(/limite de uso válido/i);
  });

  it("cria/atualiza/deleta cupom e trata erro", async () => {
    productApi.getProductCoupons.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "c-2", coupon_code: "OFF10" }]);
    productApi.createProductCoupon.mockResolvedValue({ id: "c-2" });
    productApi.updateProductCoupon.mockResolvedValue({ ok: true });
    productApi.deleteProductCoupon.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCoupons({ productId: "p-c-3", token: "t-3", withLoading }));
    await waitFor(() => expect(result.current.couponsLoading).toBe(false));

    act(() => result.current.openCreateCoupon());
    act(() => {
      result.current.setCouponForm(prev => ({
        ...prev,
        coupon_code: "OFF10",
        discount_amount: "R$ 10,00",
        status: "active",
      }));
    });
    await act(async () => {
      await result.current.handleSaveCoupon();
    });
    expect(productApi.createProductCoupon).toHaveBeenCalledWith(
      "p-c-3",
      expect.objectContaining({ coupon_code: "OFF10", discount_amount: 10, is_percentage: false }),
      "t-3"
    );
    expect(result.current.showCouponModal).toBe(false);

    act(() => result.current.openEditCoupon({ id: "c-2", coupon_code: "OFF10", discount_amount: 10, is_percentage: false } as any));
    await act(async () => {
      await result.current.handleSaveCoupon();
    });
    expect(productApi.updateProductCoupon).toHaveBeenCalled();

    act(() => result.current.setDeleteTarget({ id: "c-2" } as any));
    await act(async () => {
      await result.current.handleDeleteCoupon();
    });
    expect(productApi.deleteProductCoupon).toHaveBeenCalledWith("p-c-3", "c-2", "t-3");

    productApi.createProductCoupon.mockRejectedValueOnce(new Error("fail"));
    act(() => {
      result.current.openCreateCoupon();
      result.current.setCouponForm(prev => ({ ...prev, coupon_code: "X", discount_amount: "R$ 1,00" }));
    });
    await act(async () => {
      await result.current.handleSaveCoupon();
    });
    expect(notifyApiErrorMock).toHaveBeenCalled();
    expect(result.current.couponsError).toMatch(/Não foi possível salvar/i);
  });
});

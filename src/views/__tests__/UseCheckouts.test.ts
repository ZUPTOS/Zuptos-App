import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useCheckouts } from "@/views/editar-produto/hooks/useCheckouts";

const getCheckoutsByProductIdMock = jest.fn();
const deleteCheckoutMock = jest.fn();
const notifyApiErrorMock = jest.fn();

jest.mock("@/lib/api", () => ({
  productApi: {
    getCheckoutsByProductId: (...args: unknown[]) => getCheckoutsByProductIdMock(...args),
    deleteCheckout: (...args: unknown[]) => deleteCheckoutMock(...args),
  },
}));

jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

describe("useCheckouts", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    getCheckoutsByProductIdMock.mockReset();
    deleteCheckoutMock.mockReset();
    notifyApiErrorMock.mockReset();
  });

  it("carrega checkouts e permite excluir (happy path)", async () => {
    getCheckoutsByProductIdMock.mockResolvedValueOnce([{ id: "c-1", name: "Checkout 1" }]);
    getCheckoutsByProductIdMock.mockResolvedValueOnce([{ id: "c-2", name: "Checkout 2" }]);
    deleteCheckoutMock.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useCheckouts({ productId: "p-1", token: "t-1", withLoading })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.checkouts).toHaveLength(1);

    act(() => result.current.setDeleteTarget({ id: "c-1", name: "Checkout 1" } as any));
    await act(async () => {
      await result.current.handleDeleteCheckout();
    });

    expect(deleteCheckoutMock).toHaveBeenCalledWith("p-1", "c-1", "t-1");
    await waitFor(() => expect(result.current.checkouts[0]?.id).toBe("c-2"));
  });

  it("notifica erro ao falhar exclusao", async () => {
    getCheckoutsByProductIdMock.mockResolvedValueOnce([{ id: "c-1", name: "Checkout 1" }]);
    deleteCheckoutMock.mockRejectedValue(new Error("nope"));

    const { result } = renderHook(() =>
      useCheckouts({ productId: "p-1", token: "t-1", withLoading })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setDeleteTarget({ id: "c-1", name: "Checkout 1" } as any));

    await act(async () => {
      await result.current.handleDeleteCheckout();
    });

    expect(notifyApiErrorMock).toHaveBeenCalled();
  });
});


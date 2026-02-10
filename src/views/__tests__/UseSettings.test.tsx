import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useSettings } from "@/views/editar-produto/hooks/useSettings";

jest.mock("@/shared/ui/notification-toast", () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const notifyApiErrorMock = jest.fn();
jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

jest.mock("@/lib/api", () => {
  const productApi = {
    getProductById: jest.fn(),
    getProductSettings: jest.fn(),
    updateProductSettings: jest.fn(),
  };
  return {
    productApi,
    ProductSettingsStatus: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
  };
});

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };
const { notify } = jest.requireMock("@/shared/ui/notification-toast") as { notify: Record<string, jest.Mock> };

describe("useSettings", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notify.success.mockReset();
    notify.error.mockReset();
    notifyApiErrorMock.mockReset();
  });

  it("carrega produto/configuracoes e nao envia PATCH quando nao houve mudancas", async () => {
    productApi.getProductById.mockResolvedValue({ id: "p-1", name: "Produto" });
    productApi.getProductSettings.mockResolvedValue({
      support_email: "a@a.com",
      phone_support: "999",
      language: "pt",
      currency: "BRL",
      status: "active",
    });

    const { result } = renderHook(() => useSettings({ productId: "p-1", token: "t-1", withLoading }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.product?.id).toBe("p-1");
    expect(result.current.settings?.status).toBe("active");

    await act(async () => {
      await result.current.handleSave();
    });
    expect(productApi.updateProductSettings).not.toHaveBeenCalled();
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("handleSave envia apenas campos alterados e tenta refresh", async () => {
    productApi.getProductById
      .mockResolvedValueOnce({ id: "p-2", name: "Old", description: "D" })
      .mockResolvedValueOnce({ id: "p-2", name: "New", description: "D" });
    productApi.getProductSettings
      .mockResolvedValueOnce({ support_email: "old@a.com", status: "active" })
      .mockResolvedValueOnce({ support_email: "new@a.com", status: "inactive" });
    productApi.updateProductSettings.mockResolvedValue({ support_email: "new@a.com", status: "inactive" });

    const { result } = renderHook(() => useSettings({ productId: "p-2", token: "t-2", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setFormValues(prev => ({ ...prev, support_email: "new@a.com" }));
      result.current.setStatusDraft("inactive" as any);
      result.current.setProductForm(prev => ({ ...prev, name: "New" }));
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(productApi.updateProductSettings).toHaveBeenCalledWith(
      "p-2",
      expect.objectContaining({
        support_email: "new@a.com",
        status: "inactive",
        product: expect.objectContaining({ id: "p-2", name: "New" }),
      }),
      "t-2"
    );
    expect(productApi.getProductSettings).toHaveBeenCalledTimes(2);
    expect(productApi.getProductById).toHaveBeenCalledTimes(2);
    expect(result.current.settings?.support_email).toBe("new@a.com");
    expect(result.current.statusDraft).toBe("inactive");
    expect(result.current.formValues.support_email).toBe("");
    expect(result.current.productForm.name).toBe("");
  });

  it("handleDeactivateProduct atualiza status e notifica, com tratamento de erro", async () => {
    productApi.getProductById.mockResolvedValue({ id: "p-3", name: "Produto" });
    productApi.getProductSettings.mockResolvedValue({ status: "active" });

    const { result } = renderHook(() => useSettings({ productId: "p-3", token: "t-3", withLoading }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    productApi.updateProductSettings.mockRejectedValueOnce(new Error("fail"));
    await act(async () => {
      await result.current.handleDeactivateProduct();
    });
    expect(notifyApiErrorMock).toHaveBeenCalled();
    expect(result.current.error).toMatch(/desativar/i);

    productApi.updateProductSettings.mockResolvedValueOnce({ status: "inactive" });
    await act(async () => {
      await result.current.handleDeactivateProduct();
    });
    expect(productApi.updateProductSettings).toHaveBeenCalledWith(
      "p-3",
      { status: "inactive" },
      "t-3"
    );
    expect(result.current.statusDraft).toBe("inactive");
    expect(notify.success).toHaveBeenCalledWith("Produto desativado");
  });
});


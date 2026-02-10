import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useDeliverables } from "@/views/editar-produto/hooks/useDeliverables";

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

jest.mock("@/lib/api", () => ({
  productApi: {
    getDeliverablesByProductId: jest.fn(),
    getDeliverableById: jest.fn(),
    createDeliverable: jest.fn(),
    uploadDeliverableFile: jest.fn(),
    updateDeliverable: jest.fn(),
    deleteDeliverable: jest.fn(),
  },
}));

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };
const { notify } = jest.requireMock("@/shared/ui/notification-toast") as { notify: Record<string, jest.Mock> };

describe("useDeliverables", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notify.success.mockReset();
    notify.error.mockReset();
    notifyApiErrorMock.mockReset();
  });

  it("carrega entregaveis normalizando resposta { data: [] }", async () => {
    productApi.getDeliverablesByProductId.mockResolvedValue({
      data: [{ id: "d-1", name: "E1", type: "link", content: "https://x" }],
    });

    const { result } = renderHook(() =>
      useDeliverables({ productId: "p-del-1", token: "t-1", withLoading })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.deliverables).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("valida e cria entregavel de arquivo (upload pode falhar)", async () => {
    productApi.getDeliverablesByProductId.mockResolvedValueOnce([]).mockResolvedValueOnce([
      { id: "d-2", name: "Arquivo", type: "file", status: "active" },
    ]);
    productApi.createDeliverable.mockResolvedValue({ id: "d-2" });
    productApi.uploadDeliverableFile.mockRejectedValue(new Error("upload fail"));

    const { result } = renderHook(() =>
      useDeliverables({ productId: "p-del-2", token: "t-2", withLoading })
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.openCreateDeliverable());

    await act(async () => {
      await result.current.handleCreateDeliverable();
    });
    expect(result.current.deliverableFormError).toMatch(/Selecione um arquivo/i);

    act(() => {
      result.current.setDeliverableName("Arquivo");
      result.current.setDeliverableTab("arquivo");
      result.current.setDeliverableFile(new File(["x"], "x.pdf", { type: "application/pdf" }));
    });

    await act(async () => {
      await result.current.handleCreateDeliverable();
    });

    expect(productApi.createDeliverable).toHaveBeenCalledWith(
      "p-del-2",
      expect.objectContaining({ name: "Arquivo", type: "file", status: "active" }),
      "t-2"
    );
    expect(productApi.uploadDeliverableFile).toHaveBeenCalledWith(
      "p-del-2",
      "d-2",
      expect.any(File),
      "t-2"
    );
    expect(notify.success).toHaveBeenCalledWith("Entregável criado");

    await waitFor(() => expect(result.current.showDeliverableModal).toBe(false));
    expect(result.current.deliverables).toHaveLength(1);
  });

  it("abre edição, atualiza e deleta entregavel", async () => {
    productApi.getDeliverablesByProductId
      .mockResolvedValueOnce([{ id: "d-3", name: "Old", type: "link", content: "https://old", status: "active" }])
      .mockResolvedValueOnce([{ id: "d-3", name: "New", type: "link", content: "https://new", status: "active" }])
      .mockResolvedValueOnce([]);
    productApi.getDeliverableById.mockResolvedValue({
      id: "d-3",
      name: "Old",
      type: "link",
      content: "https://old",
      status: "active",
    });
    productApi.updateDeliverable.mockResolvedValue({ ok: true });
    productApi.deleteDeliverable.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useDeliverables({ productId: "p-del-3", token: "t-3", withLoading })
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.openEditDeliverable("d-3");
    });
    expect(result.current.showDeliverableModal).toBe(true);
    expect(result.current.editingDeliverable?.id).toBe("d-3");

    act(() => {
      result.current.setDeliverableTab("link");
      result.current.setDeliverableName("New");
      result.current.setDeliverableContent("https://new");
    });

    await act(async () => {
      await result.current.handleUpdateDeliverable();
    });
    expect(productApi.updateDeliverable).toHaveBeenCalledWith(
      "p-del-3",
      "d-3",
      expect.objectContaining({ name: "New", type: "link", content: "https://new" }),
      "t-3"
    );
    expect(notify.success).toHaveBeenCalledWith("Entregável atualizado");
    await waitFor(() => expect(result.current.showDeliverableModal).toBe(false));

    act(() => result.current.setDeleteTarget({ id: "d-3" } as any));
    await act(async () => {
      await result.current.handleDeleteDeliverable();
    });
    expect(productApi.deleteDeliverable).toHaveBeenCalledWith("p-del-3", "d-3", "t-3");
    expect(notify.success).toHaveBeenCalledWith("Entregável deletado");
    await waitFor(() => expect(result.current.deliverables).toHaveLength(0));
  });
});


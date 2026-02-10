import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useCoproducers } from "@/views/editar-produto/hooks/useCoproducers";

jest.mock("@/lib/api", () => ({
  productApi: {
    getCoproducersByProductId: jest.fn(),
    createCoproducer: jest.fn(),
    updateCoproducer: jest.fn(),
    deleteCoproducer: jest.fn(),
  },
}));

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };

describe("useCoproducers", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
  });

  it("carrega coprodutores, abre detalhes e preenche edicao", async () => {
    productApi.getCoproducersByProductId.mockResolvedValue({
      data: [
        {
          id: "cp-1",
          name: "Ana",
          email: "ana@example.com",
          duration_months: 0,
          revenue_share_percentage: 12,
          share_sales_details: true,
          extend_product_strategies: false,
          split_invoice: true,
        },
      ],
    });

    const { result } = renderHook(() => useCoproducers({ productId: "p-co-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.coproducersLoading).toBe(false));
    expect(result.current.coproducers).toHaveLength(1);

    act(() => result.current.openDetailModal(result.current.coproducers[0] as any));
    expect(result.current.selectedCoproducer?.id).toBe("cp-1");
    expect(result.current.showCoproductionDetailModal).toBe(true);
    act(() => result.current.closeDetailModal());
    expect(result.current.selectedCoproducer).toBeNull();

    act(() => result.current.openEditCoproducer(result.current.coproducers[0] as any));
    expect(result.current.showCoproductionModal).toBe(true);
    expect(result.current.editingCoproducer?.id).toBe("cp-1");
    expect(result.current.coproducerForm.lifetime).toBe(true);
    expect(result.current.coproducerForm.commission).toBe("12");
  });

  it("salva (create/update) e deleta coprodutor, com validacao e erro", async () => {
    productApi.getCoproducersByProductId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "cp-2", name: "Bob" }])
      .mockResolvedValueOnce([{ id: "cp-2", name: "Bob", revenue_share_percentage: 10 }])
      .mockResolvedValueOnce([]);
    productApi.createCoproducer.mockResolvedValue({ id: "cp-2" });
    productApi.updateCoproducer.mockResolvedValue({ ok: true });
    productApi.deleteCoproducer.mockRejectedValueOnce(new Error("fail")).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useCoproducers({ productId: "p-co-2", token: "t-2", withLoading }));
    await waitFor(() => expect(result.current.coproducersLoading).toBe(false));

    act(() => result.current.openCreateCoproducer());
    act(() => result.current.setCoproducerForm(prev => ({ ...prev, name: "Bob", email: "bob@x.com", commission: "abc" })));
    await act(async () => {
      await result.current.handleSaveCoproducer();
    });
    expect(result.current.coproducerFormError).toMatch(/comissão válida/i);

    act(() =>
      result.current.setCoproducerForm(prev => ({
        ...prev,
        commission: "10",
        lifetime: true,
        durationMonths: "",
        shareSalesDetails: true,
        extendProductStrategies: true,
        splitInvoice: false,
      }))
    );
    await act(async () => {
      await result.current.handleSaveCoproducer();
    });
    expect(productApi.createCoproducer).toHaveBeenCalledWith(
      "p-co-2",
      expect.objectContaining({ name: "Bob", email: "bob@x.com", duration_months: 0, revenue_share_percentage: 10 }),
      "t-2"
    );

    act(() =>
      result.current.openEditCoproducer({ id: "cp-2", name: "Bob", email: "bob@x.com", duration_months: 3, revenue_share_percentage: 10 } as any)
    );
    await act(async () => {
      await result.current.handleSaveCoproducer();
    });
    expect(productApi.updateCoproducer).toHaveBeenCalled();

    act(() => result.current.setDeleteTarget({ id: "cp-2" } as any));
    await act(async () => {
      await result.current.handleDeleteCoproducer();
    });
    expect(result.current.coproducerFormError).toMatch(/excluir/i);

    await act(async () => {
      await result.current.handleDeleteCoproducer();
    });
    expect(productApi.deleteCoproducer).toHaveBeenCalledWith("p-co-2", "cp-2", "t-2");
  });
});


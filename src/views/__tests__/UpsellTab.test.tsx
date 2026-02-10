import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpsellTab } from "@/views/editar-produto/UpsellTab";

const useUpsellMock = jest.fn();

jest.mock("@/views/editar-produto/hooks/useUpsell", () => ({
  useUpsell: (...args: unknown[]) => useUpsellMock(...args),
}));

jest.mock("@/shared/components/PaginatedTable", () => ({
  __esModule: true,
  default: ({ data, columns, rowKey }: any) => (
    <div data-testid="table">
      {data.map((row: any) => (
        <div key={rowKey ? rowKey(row) : row.id}>
          {columns.map((col: any) => (
            <div key={col.id}>{col.render(row)}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe("UpsellTab", () => {
  beforeEach(() => {
    useUpsellMock.mockReset();
  });

  it("renderiza tabela, modal, copia script e confirmacao de exclusao", async () => {
    const user = userEvent.setup();

    const offers = [
      { id: "offer-1", name: "Oferta 1", offer_price: 25, free: false },
      { id: "offer-2", name: "Oferta 2", offer_price: 0, free: true },
    ];
    let strategyForm = {
      name: "",
      type: "upsell",
      productId: "offer-1",
      acceptAction: "redirect",
      acceptUrl: "https://example.com/ok",
      rejectAction: "redirect",
      rejectUrl: "https://example.com/no",
    };

    const state = {
      strategies: [
        {
          id: "st-1",
          name: "E1",
          type: "upsell",
          offer: "offer-1",
          value: 10,
          script: "https://example.com/script.js",
        },
        {
          // cover fallbacks for rowKey/scriptUrl/value
          type: "downsell",
          offer: "offer-2",
          offerPrice: "15",
          action_successful_url: "https://example.com/success",
        },
      ],
      strategiesLoading: false,
      strategiesError: null,
      showUpsellModal: true,
      savingStrategy: false,
      offers,
      offersLoading: false,
      editingStrategy: { id: "st-1" },
      deleteTarget: { id: "st-1", name: "E1" },
      deletingStrategy: false,
      copiedStrategyId: "st-1",
      strategyForm,
      setStrategyForm: jest.fn((updater: any) => {
        strategyForm = typeof updater === "function" ? updater(strategyForm) : updater;
      }),
      setShowUpsellModal: jest.fn(),
      setDeleteTarget: jest.fn(),
      openCreateStrategy: jest.fn(),
      openEditStrategy: jest.fn(),
      closeUpsellModal: jest.fn(),
      handleCopyScript: jest.fn(),
      handleCreateStrategy: jest.fn(),
      handleDeleteStrategy: jest.fn(),
      resolveOfferId: (item: any) => item.offer ?? item.offer_id ?? item.offerId,
      offerNameById: (offerId?: string) => offers.find(o => o.id === offerId)?.name,
      offerById: (offerId?: string) => offers.find(o => o.id === offerId),
      formatOfferPrice: (value?: number | string) => (value == null || value === "" ? undefined : `R$ ${String(value)}`),
      toText: (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined),
    };

    useUpsellMock.mockReturnValue(state);

    render(<UpsellTab productId="p-1" token="t-1" withLoading={async task => task()} />);

    expect(screen.getByText(/Upsell, downsell/i)).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText(/Link copiado/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Adicionar/i }));
    expect(state.openCreateStrategy).toHaveBeenCalled();

    // Script copy
    await user.click(screen.getByRole("button", { name: "example.com/script.js" }));
    expect(state.handleCopyScript).toHaveBeenCalledWith("https://example.com/script.js", "st-1");

    // Actions
    await user.click(screen.getAllByRole("button", { name: /Editar estratégia/i })[0]);
    expect(state.openEditStrategy).toHaveBeenCalled();
    await user.click(screen.getAllByRole("button", { name: /Excluir estratégia/i })[0]);
    expect(state.setDeleteTarget).toHaveBeenCalled();

    // Modal overlay closes
    await user.click(screen.getByLabelText(/Fechar modal estratégia/i));
    expect(state.setShowUpsellModal).toHaveBeenCalledWith(false);

    // Typing calls setStrategyForm with a functional updater (we execute it in the mock)
    const nameInput = screen.getAllByPlaceholderText("Digite um nome")[0] as HTMLInputElement;
    await user.type(nameInput, "X");
    expect(state.setStrategyForm).toHaveBeenCalled();
    expect(strategyForm.name).toBe("X");

    // Enabled submit button
    await user.click(screen.getByRole("button", { name: /Atualizar/i }));
    expect(state.handleCreateStrategy).toHaveBeenCalled();

    // Delete confirmation
    await user.click(screen.getByLabelText(/Fechar confirmação/i));
    expect(state.setDeleteTarget).toHaveBeenCalledWith(null);
    await user.click(screen.getByRole("button", { name: /^Excluir$/i }));
    expect(state.handleDeleteStrategy).toHaveBeenCalled();
  });
});

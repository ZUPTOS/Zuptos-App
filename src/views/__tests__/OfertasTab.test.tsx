import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OfertasTab } from "@/views/editar-produto/OfertasTab";

const useOffersMock = jest.fn();

jest.mock("@/views/editar-produto/hooks/useOffers", () => ({
  useOffers: (...args: unknown[]) => useOffersMock(...args),
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

describe("OfertasTab", () => {
  beforeEach(() => {
    useOffersMock.mockReset();
  });

  const baseState = () => ({
    offers: [],
    loading: false,
    error: null,
    showOfferModal: false,
    editingOffer: null,
    offerName: "",
    offerPrice: "",
    offerBackRedirect: "",
    offerNextRedirect: "",
    offerStatus: "active",
    offerFree: false,
    backRedirectEnabled: true,
    nextRedirectEnabled: true,
    firstChargePriceEnabled: false,
    fixedChargesEnabled: false,
    subscriptionFrequency: "anual",
    subscriptionTitle: "",
    subscriptionTag: "",
    subscriptionPrice: "",
    subscriptionPromoPrice: "",
    subscriptionFirstChargePrice: "",
    subscriptionChargesCount: "",
    subscriptionDefault: false,
    selectedCheckoutId: "",
    checkoutOptions: [],
    checkoutOptionsLoading: false,
    orderBumpEnabled: false,
    orderBumpOffers: [],
    orderBumpOffersLoading: false,
    orderBumpProducts: [],
    orderBumps: [],
    orderBumpForm: { product: "", offer: "", title: "", tag: "", price: "", description: "" },
    editingOrderBumpIndex: null,
    savingOffer: false,
    offerType: "preco_unico",
    offerDeleteTarget: null,
    deletingOffer: false,
    copiedOfferId: null,
    setOfferName: jest.fn(),
    setOfferPrice: jest.fn(),
    setOfferBackRedirect: jest.fn(),
    setOfferNextRedirect: jest.fn(),
    setOfferStatus: jest.fn(),
    setOfferFree: jest.fn(),
    setBackRedirectEnabled: jest.fn(),
    setNextRedirectEnabled: jest.fn(),
    setFirstChargePriceEnabled: jest.fn(),
    setFixedChargesEnabled: jest.fn(),
    setSubscriptionFrequency: jest.fn(),
    setSubscriptionTitle: jest.fn(),
    setSubscriptionTag: jest.fn(),
    setSubscriptionPrice: jest.fn(),
    setSubscriptionPromoPrice: jest.fn(),
    setSubscriptionFirstChargePrice: jest.fn(),
    setSubscriptionChargesCount: jest.fn(),
    setSubscriptionDefault: jest.fn(),
    setSelectedCheckoutId: jest.fn(),
    setOrderBumpEnabled: jest.fn(),
    setOrderBumpForm: jest.fn(),
    setOfferType: jest.fn(),
    setOfferDeleteTarget: jest.fn(),
    openCreateOffer: jest.fn(),
    openEditOffer: jest.fn(),
    closeOfferModal: jest.fn(),
    handleCopyAccess: jest.fn(),
    handleSaveOrderBump: jest.fn(),
    handleEditOrderBump: jest.fn(),
    handleDeleteOrderBump: jest.fn(),
    handleCancelOrderBumpEdit: jest.fn(),
    handleCreateOffer: jest.fn(),
    handleDeleteOffer: jest.fn(),
  });

  it("renderiza tabela, modal preco unico e confirmacao de exclusao", async () => {
    const state = {
      ...baseState(),
      offers: [
        {
          id: "offer-1",
          name: "Oferta 1",
          type: "single_purchase",
          offer_price: 10,
          status: "active",
          checkout_id: "chk-1",
          template: "default",
        },
      ],
      showOfferModal: true,
      offerType: "preco_unico",
      offerName: "Oferta 1",
      offerPrice: "R$ 10,00",
      selectedCheckoutId: "chk-1",
      checkoutOptions: [{ id: "chk-1", name: "Checkout 1" }],
      copiedOfferId: "offer-1",
      offerDeleteTarget: { id: "offer-1", name: "Oferta 1" },
    };
    useOffersMock.mockReturnValue(state);

    const user = userEvent.setup();
    render(<OfertasTab productId="p-1" token="t-1" withLoading={async task => task()} />);

    expect(screen.getByText(/Ofertas/i)).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText(/Link copiado/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Adicionar oferta/i })[0]);
    expect(state.openCreateOffer).toHaveBeenCalled();

    const copyButtons = screen.getAllByTitle(/Copiar link de acesso/i);
    await user.click(copyButtons[0]);
    expect(state.handleCopyAccess).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Editar oferta/i }));
    expect(state.openEditOffer).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Excluir oferta/i }));
    expect(state.setOfferDeleteTarget).toHaveBeenCalled();

    expect(screen.getByText(/Criar oferta/i)).toBeInTheDocument();
    expect(screen.getByText(/Oferta gratuita/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Fechar modal/i));
    expect(state.closeOfferModal).toHaveBeenCalled();

    await user.click(screen.getByLabelText(/Fechar confirmação/i));
    expect(state.setOfferDeleteTarget).toHaveBeenCalledWith(null);

    await user.click(screen.getByRole("button", { name: /^Excluir$/i }));
    expect(state.handleDeleteOffer).toHaveBeenCalled();
  });

  it("renderiza modal de assinatura", () => {
    const state = {
      ...baseState(),
      showOfferModal: true,
      offerType: "assinatura",
      subscriptionFrequency: "mensal",
      subscriptionTitle: "Plano Mensal",
      subscriptionPrice: "R$ 20,00",
      subscriptionPromoPrice: "R$ 15,00",
    };
    useOffersMock.mockReturnValue(state);

    render(<OfertasTab productId="p-1" token="t-1" withLoading={async task => task()} />);

    expect(screen.getByText(/Planos de assinatura/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Preço normal/i)).toBeInTheDocument();
  });

  it("cobre branches do modal de assinatura (plano, order bump, redirect) e acesso backend/computed", async () => {
    const state = {
      ...baseState(),
      offers: [
        {
          id: "offer-1",
          name: "Oferta 1",
          type: "subscription",
          offer_price: 10,
          status: "active",
          back_redirect_url: "https://example.com/checkout/offer-1/product/p-1",
        },
        {
          id: "offer-2",
          name: "Oferta 2",
          type: "single_purchase",
          offer_price: null,
          status: "inactive",
          next_redirect_url: "https://example.com/redirect",
        },
        {
          // offer without id -> uses accessUrl as key
          name: "Sem ID",
          type: "single_purchase",
          free: true,
          status: "active",
          back_redirect_url: "https://example.com/no-id",
        },
      ],
      showOfferModal: true,
      offerType: "assinatura",
      subscriptionFrequency: "mensal",
      subscriptionTitle: "Plano Mensal",
      subscriptionTag: "novidade",
      subscriptionPrice: "R$ 20,00",
      subscriptionPromoPrice: "R$ 15,00",
      subscriptionFirstChargePrice: "R$ 5,00",
      subscriptionChargesCount: "3",
      subscriptionDefault: true,
      firstChargePriceEnabled: true,
      fixedChargesEnabled: true,
      orderBumpEnabled: true,
      orderBumpOffersLoading: false,
      orderBumpProducts: [{ id: "p-2", name: "Produto 2" }],
      orderBumpOffers: [{ id: "o-2", name: "Oferta bump", productId: "p-2", offer_price: 5 }],
      orderBumps: [{ title: "Bump 1", offer: "o-2", product: "p-2", tag: "novidade", description: "Desc" }],
      orderBumpForm: { product: "p-2", offer: "o-2", title: "Bump 1", tag: "novidade", price: "", description: "Desc" },
      editingOrderBumpIndex: 0,
      checkoutOptions: [{ id: "chk-1", name: "Checkout 1" }],
      selectedCheckoutId: "chk-1",
    };
    useOffersMock.mockReturnValue(state);

    const user = userEvent.setup();
    render(<OfertasTab productId="p-1" token="t-1" withLoading={async task => task()} />);

    const accessButtons = screen.getAllByTitle(/Copiar link de acesso/i);
    expect(accessButtons.length).toBeGreaterThanOrEqual(2);
    await user.click(accessButtons[0]);
    await user.click(accessButtons[1]);
    expect(state.handleCopyAccess).toHaveBeenCalled();

    await user.click(screen.getByLabelText(/Ativar back redirect/i));
    expect(state.setBackRedirectEnabled).toHaveBeenCalled();

    await user.click(screen.getByLabelText(/Ativar redirecionamento após aprovado/i));
    expect(state.setNextRedirectEnabled).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Salvar Order Bump/i }));
    expect(state.handleSaveOrderBump).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Cancelar edição/i }));
    expect(state.handleCancelOrderBumpEdit).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /^Editar$/i }));
    expect(state.handleEditOrderBump).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /^Excluir$/i }));
    // Excluir (order bump) shares label; in this scenario it should still be callable
    expect(state.handleDeleteOrderBump).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Excluir plano/i }));
    expect(state.setSubscriptionFrequency).toHaveBeenCalledWith("anual");
    expect(state.setSubscriptionTitle).toHaveBeenCalledWith("");
    expect(state.setFirstChargePriceEnabled).toHaveBeenCalledWith(false);
    expect(state.setFixedChargesEnabled).toHaveBeenCalledWith(false);
  });
});

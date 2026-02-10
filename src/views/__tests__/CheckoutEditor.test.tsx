import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheckoutEditorCreate } from "@/views/editar-produto/CheckoutEditorCreate";
import { CheckoutEditorEdit } from "@/views/editar-produto/CheckoutEditorEdit";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "token" }),
}));

jest.mock("@/contexts/LoadingOverlayContext", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();
  return {
    useLoadingOverlay: () => ({ withLoading }),
  };
});

jest.mock("@/shared/ui/notification-toast", () => ({
  notify: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/api", () => ({
  productApi: {
    getProductById: jest.fn(),
    getCheckoutById: jest.fn(),
    getCheckoutDepoiments: jest.fn(),
    getCheckoutDepoiment: jest.fn(),
    getCheckoutPaymentMethods: jest.fn(),
    getCheckoutPaymentMethodById: jest.fn(),
    getCheckoutMessages: jest.fn(),
    getCheckoutMessageById: jest.fn(),
    createCheckout: jest.fn(),
    updateCheckout: jest.fn(),
    createCheckoutMessage: jest.fn(),
    updateCheckoutMessage: jest.fn(),
    saveCheckoutPaymentMethods: jest.fn(),
    updateCheckoutPaymentMethod: jest.fn(),
    uploadCheckoutAsset: jest.fn(),
    createCheckoutDepoiment: jest.fn(),
    uploadCheckoutDepoimentImage: jest.fn(),
    updateCheckoutDepoiment: jest.fn(),
    deleteCheckoutDepoiment: jest.fn(),
  },
  CheckoutTemplate: { DEFAULT: "default" },
}));

const { productApi: productApiMock } = jest.requireMock("@/lib/api") as {
  productApi: Record<string, jest.Mock>;
};

describe("CheckoutEditor", () => {
  beforeEach(() => {
    Object.values(productApiMock).forEach(mockFn => {
      if (typeof mockFn === "function" && "mockReset" in mockFn) {
        (mockFn as jest.Mock).mockReset();
      }
    });
  });

  it("CheckoutEditorCreate: permite configurar gatilhos/reviews e salvar", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApiMock.getProductById.mockResolvedValue({
      id: "product-1",
      name: "Produto Teste",
      status: "active",
      total_invoiced: 100,
      total_sold: 2,
    });
    productApiMock.createCheckout.mockResolvedValue({ id: "checkout-1" });
    productApiMock.createCheckoutMessage.mockResolvedValue({ id: "message-1" });
    productApiMock.saveCheckoutPaymentMethods.mockResolvedValue({ id: "payment-1" });
    productApiMock.createCheckoutDepoiment.mockResolvedValue({ id: "dep-1" });

    render(<CheckoutEditorCreate productId="product-1" onSaved={onSaved} />);

    expect(await screen.findByText("Produto Teste")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/Digite um nome/i), "Checkout A");

    // Contador regressivo
    const countdownRow = screen.getByText(/Contador Regressivo/i).closest("div");
    const countdownToggle = countdownRow?.querySelector("button");
    expect(countdownToggle).toBeTruthy();
    await user.click(countdownToggle as HTMLButtonElement);
    await user.type(screen.getByPlaceholderText("15"), "10");

    // Notificacoes de vendas
    const notifRow = screen.getByText(/Notificações de vendas/i).closest("div");
    const notifToggle = notifRow?.querySelector("button");
    expect(notifToggle).toBeTruthy();
    await user.click(notifToggle as HTMLButtonElement);
    await user.type(screen.getByPlaceholderText(/15 segundos/i), "15");

    const buyingRule = screen.getByLabelText(/XX pessoas estão comprando/i);
    await user.click(buyingRule);
    const buyingLabel = buyingRule.closest("label");
    expect(buyingLabel).toBeTruthy();
    await user.type(within(buyingLabel as HTMLElement).getByPlaceholderText("1"), "3");

    // Prova social
    const socialRow = screen.getByText(/Prova Social/i).closest("div");
    const socialToggle = socialRow?.querySelector("button");
    expect(socialToggle).toBeTruthy();
    await user.click(socialToggle as HTMLButtonElement);
    await user.type(
      screen.getByPlaceholderText(/Outras/i),
      "Pessoas estão comprando agora"
    );
    await user.type(screen.getByPlaceholderText(/15 visitantes/i), "25");

    // Reviews
    const reviewsRow = screen.getByText("Depoimentos/Reviews").closest("div");
    const reviewsToggle = reviewsRow?.querySelector("button");
    expect(reviewsToggle).toBeTruthy();
    await user.click(reviewsToggle as HTMLButtonElement);

    await user.click(screen.getByRole("button", { name: /Nota 4/i }));
    await user.type(screen.getByPlaceholderText(/Insira um nome/i), "Carlos");
    await user.type(screen.getByPlaceholderText(/Insira um depoimento/i), "Muito bom");
    await user.click(screen.getByRole("button", { name: /Inserir novo depoimento/i }));

    // Salva pelo CTA do preview (mais acima) para exercitar o mesmo handler
    const saveButtons = screen.getAllByRole("button", { name: /Salvar alterações/i });
    await user.click(saveButtons[0]);

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(productApiMock.createCheckout).toHaveBeenCalled();
    expect(productApiMock.saveCheckoutPaymentMethods).toHaveBeenCalled();
    expect(productApiMock.createCheckoutMessage).toHaveBeenCalled();
    expect(productApiMock.createCheckoutDepoiment).toHaveBeenCalled();
  });

  it("CheckoutEditorEdit: carrega dados, atualiza e salva (PATCH)", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApiMock.getProductById.mockResolvedValue({
      id: "product-1",
      name: "Produto Teste",
      status: "active",
    });
    productApiMock.getCheckoutById.mockResolvedValue({
      data: {
        name: "Checkout Antigo",
        required_address: true,
        required_phone: true,
        required_birthdate: true,
        required_document: true,
        required_email_confirmation: false,
        theme: "dark",
        default_color: "#5f17ff",
        after_sale_title: "Obrigado",
        after_sale_message: "Mensagem",
      },
    });
    productApiMock.getCheckoutDepoiments.mockResolvedValue([]);
    productApiMock.getCheckoutPaymentMethods.mockResolvedValue({
      id: "pm-1",
      accept_pix: true,
      accept_document_individual: true,
    });
    productApiMock.getCheckoutMessages.mockResolvedValue([{ id: "msg-1" }]);
    productApiMock.getCheckoutMessageById.mockResolvedValue({ title: "Obrigado", message: "Mensagem" });

    productApiMock.updateCheckout.mockResolvedValue({ id: "checkout-1" });
    productApiMock.updateCheckoutMessage.mockResolvedValue(undefined);
    productApiMock.updateCheckoutPaymentMethod.mockResolvedValue(undefined);

    render(
      <CheckoutEditorEdit productId="product-1" checkoutId="checkout-1" onSaved={onSaved} />
    );

    expect(await screen.findByText("Produto Teste")).toBeInTheDocument();

    // espera placeholder carregar do checkout atual
    expect(await screen.findByPlaceholderText("Checkout Antigo")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Checkout Antigo"), " Novo");
    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(productApiMock.updateCheckout).toHaveBeenCalled();
    expect(productApiMock.updateCheckoutMessage).toHaveBeenCalled();
    expect(productApiMock.updateCheckoutPaymentMethod).toHaveBeenCalled();
  });
});

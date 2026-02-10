import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

jest.mock("@/views/editar-produto/checkout-editor/utils", () => {
  const actual = jest.requireActual("@/views/editar-produto/checkout-editor/utils");
  return {
    ...actual,
    compressImageFile: jest.fn(async (_file: File, options: { maxWidth: number }) => {
      // Logo compress succeeds; banner compress fails to exercise catch path.
      if (options.maxWidth === 400) return "data:image/jpeg;base64,logo";
      throw new Error("compress fail");
    }),
  };
});

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

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };
const { notify } = jest.requireMock("@/shared/ui/notification-toast") as { notify: Record<string, jest.Mock> };
const { compressImageFile } = jest.requireMock("@/views/editar-produto/checkout-editor/utils") as {
  compressImageFile: jest.Mock;
};

describe("CheckoutEditor (advanced)", () => {
  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notify.success.mockReset();
    notify.error.mockReset();
    compressImageFile.mockClear();
    localStorage.clear();

    // HEAD requests for stored logo/banner sizes
    const fetchMock = jest.fn(async () => ({
      headers: {
        get: (key: string) => (key === "content-length" ? "1024" : null),
      },
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;
  });

  it("CheckoutEditorCreate usa productId do localStorage quando prop nao é informada", async () => {
    localStorage.setItem("lastProductId", "p-ls");
    productApi.getProductById.mockResolvedValue({ id: "p-ls", name: "Produto LS", status: "active" });

    render(<CheckoutEditorCreate onSaved={jest.fn()} />);

    expect(await screen.findByText("Produto LS")).toBeInTheDocument();
    expect(productApi.getProductById).toHaveBeenCalledWith("p-ls", "token");
  });

  it("CheckoutEditorCreate carrega dados, altera visual/pagamentos, edita depoimento e salva com uploads", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-1", name: "Produto Teste", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({
      data: {
        name: "Checkout Atual",
        theme: "light",
        default_color: "#123456",
        logo: "https://cdn.example.com/logo.png",
        banner: "https://cdn.example.com/banner.png",
        position_logo: "right",
        required_email_confirmation: true,
        countdown_active: true,
        countdown: true,
        countdown_background: "#111111",
        countdown_text_color: "#FFFFFF",
        countdown_expire: 10,
        sell_notification: true,
        sell_time: 30,
        people_buy: 2,
        buy_at_thirty: 1,
        buy_at_hour: "3",
        social_proof_enabled: true,
        social_proofs_message: "Mensagem",
        social_proofs_min_client: 5,
        testimonials_enabled: true,
        after_sale_title: "Obrigado",
        after_sale_message: "Mensagem",
      },
    });
    productApi.getCheckoutDepoiments.mockResolvedValue([{ id: "dep-1" }]);
    productApi.getCheckoutDepoiment.mockResolvedValue({
      id: "dep-1",
      name: "Maria",
      depoiment: "Top",
      ratting: 4,
      active: true,
      image_url: "https://cdn.example.com/dep.png",
    });
    productApi.getCheckoutPaymentMethods.mockResolvedValue([
      {
        id: "pm-1",
        accept_document_company: true,
        accept_document_individual: true,
        accept_pix: true,
        accept_credit_card: true,
        accept_ticket: true,
        accept_coupon: true,
        shown_seller_detail: true,
        require_address: true,
        detail_discount: { card: 10, pix: 5 },
        detail_payment_method: { installments_limit: 6, installments_preselected: 3, boleto_due_days: 4, pix_expire_minutes: 10 },
      },
    ]);
    productApi.getCheckoutMessages.mockResolvedValue([{ id: "msg-1" }]);
    productApi.getCheckoutMessageById.mockResolvedValue({ data: { id: "msg-1", title: "Obrigado", message: "Mensagem" } });

    productApi.createCheckout.mockResolvedValue({ id: "checkout-created" });
    productApi.updateCheckoutMessage.mockResolvedValue(undefined);
    productApi.saveCheckoutPaymentMethods.mockResolvedValue({ id: "pm-created" });
    productApi.uploadCheckoutAsset
      .mockResolvedValueOnce({ url: "https://cdn.example.com/logo-new.png" })
      .mockResolvedValueOnce({ url: "https://cdn.example.com/banner-new.png" });
    productApi.updateCheckoutDepoiment.mockResolvedValue({ ok: true });
    productApi.deleteCheckoutDepoiment.mockResolvedValue(undefined);
    productApi.createCheckoutDepoiment.mockResolvedValue({ id: "dep-new" });
    productApi.uploadCheckoutDepoimentImage.mockResolvedValue({ url: "https://cdn.example.com/dep-new.png" });

    const revokeSpy = jest.spyOn(URL, "revokeObjectURL");

    const { container } = render(
      <CheckoutEditorCreate productId="product-1" checkoutId="checkout-1" onSaved={onSaved} />
    );

    expect(await screen.findByText("Produto Teste")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Checkout Atual")).toBeInTheDocument();

    // Stored previews should trigger HEAD size fetch
    await waitFor(() => expect((global.fetch as unknown as jest.Mock)).toHaveBeenCalled());

    // Upload invalid logo -> error
    const logoFileInput = container.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    await act(async () => {
      fireEvent.change(logoFileInput, {
        target: { files: [new File(["x"], "x.gif", { type: "image/gif" })] },
      });
    });
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/Formato de imagem inválido/i));

    // Upload valid logo (compress ok)
    await act(async () => {
      fireEvent.change(logoFileInput, {
        target: { files: [new File(["x"], "x.png", { type: "image/png" })] },
      });
    });
    expect(compressImageFile).toHaveBeenCalled();

    // Upload banner (compress fails -> fallback preview from file)
    const fileInputs = Array.from(container.querySelectorAll('input[type="file"][accept="image/*"]'));
    const bannerFileInput = fileInputs[fileInputs.length - 1] as HTMLInputElement;
    await act(async () => {
      fireEvent.change(bannerFileInput, {
        target: { files: [new File(["x"], "b.png", { type: "image/png" })] },
      });
    });

    // Remove stored logo preview
    await user.click(screen.getByRole("button", { name: /Remover logo/i }));

    // Toggle testimonial active (API ok) and then delete
    const firstCardHeader = screen.getByText("#1").closest("div")?.parentElement;
    expect(firstCardHeader).toBeTruthy();
    const headerButtons = within(firstCardHeader as HTMLElement).getAllByRole("button");
    await user.click(headerButtons[0]);
    expect(productApi.updateCheckoutDepoiment).toHaveBeenCalled();
    await user.click(within(firstCardHeader as HTMLElement).getByRole("button", { name: /Excluir/i }));
    expect(productApi.deleteCheckoutDepoiment).toHaveBeenCalledWith("product-1", "checkout-1", "dep-1", "token");

    // Add new testimonial with image (will be created + image uploaded on save)
    const testimonialFileInput = container.querySelector(
      'input[type="file"][accept="image/png,image/jpeg"]'
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(testimonialFileInput, {
        target: { files: [new File(["x"], "avatar.png", { type: "image/png" })] },
      });
    });
    await user.type(screen.getByPlaceholderText(/Insira um nome/i), "Carlos");
    await user.type(screen.getByPlaceholderText(/Insira um depoimento/i), "Muito bom");
    await user.click(screen.getByRole("button", { name: /Inserir novo depoimento/i }));
    expect(notify.success).toHaveBeenCalledWith("Depoimento adicionado");

    // Edit the newly added testimonial to hit update + upload path (needs an id: created on save, so save once first)
    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(productApi.createCheckout).toHaveBeenCalled();
    expect(productApi.saveCheckoutPaymentMethods).toHaveBeenCalled();
    expect(productApi.uploadCheckoutAsset).toHaveBeenCalled();
    expect(productApi.createCheckoutDepoiment).toHaveBeenCalled();
    expect(productApi.uploadCheckoutDepoimentImage).toHaveBeenCalled();

    // Now edit first testimonial in the list and save edition with image upload
    const editButtons = screen.getAllByRole("button", { name: /Editar/i });
    await user.click(editButtons[0]);
    await act(async () => {
      fireEvent.change(testimonialFileInput, {
        target: { files: [new File(["y"], "avatar2.png", { type: "image/png" })] },
      });
    });
    await user.click(screen.getByRole("button", { name: /Salvar edição/i }));
    expect(productApi.updateCheckoutDepoiment).toHaveBeenCalled();
    expect(productApi.uploadCheckoutDepoimentImage).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
  });

  it("CheckoutEditorEdit salva com payment methods CREATE e sem mensagem (skip PATCH)", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-2", name: "Produto 2", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({
      data: {
        name: "Checkout Edit",
        productCheckoutPayment: {
          accept_document_individual: true,
          accept_credit_card: true,
          accept_pix: true,
          accept_ticket: false,
          accept_coupon: true,
        },
      },
    });
    productApi.getCheckoutDepoiments.mockResolvedValue([]);
    productApi.getCheckoutPaymentMethods.mockResolvedValue([]);
    productApi.getCheckoutMessages.mockResolvedValue([]);

    productApi.updateCheckout.mockResolvedValue({ id: "checkout-2" });
    productApi.saveCheckoutPaymentMethods.mockResolvedValue({ data: { id: "pm-new" } });
    productApi.uploadCheckoutAsset.mockResolvedValue({ url: "https://cdn.example.com/logo-upload.png" });
    productApi.createCheckoutDepoiment.mockResolvedValue({ id: "dep-x" });
    productApi.uploadCheckoutDepoimentImage.mockResolvedValue({ url: "https://cdn.example.com/dep-x.png" });

    const { container } = render(
      <CheckoutEditorEdit productId="product-2" checkoutId="checkout-2" onSaved={onSaved} />
    );

    expect(await screen.findByText("Produto 2")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Checkout Edit")).toBeInTheDocument();

    // Ensure we can type a valid name
    await user.type(screen.getByPlaceholderText("Checkout Edit"), " Novo");

    // Enable reviews and add a new testimonial with image
    const reviewsRow = screen.getByText("Depoimentos/Reviews").closest("div");
    const reviewsToggle = reviewsRow?.querySelector("button");
    expect(reviewsToggle).toBeTruthy();
    await user.click(reviewsToggle as HTMLButtonElement);

    const testimonialFileInput = container.querySelector(
      'input[type="file"][accept="image/png,image/jpeg"]'
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(testimonialFileInput, {
        target: { files: [new File(["x"], "a.png", { type: "image/png" })] },
      });
    });
    await user.type(screen.getByPlaceholderText(/Insira um nome/i), "Ana");
    await user.type(screen.getByPlaceholderText(/Insira um depoimento/i), "Otimo");
    await user.click(screen.getByRole("button", { name: /Inserir novo depoimento/i }));

    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);
    await waitFor(() => expect(onSaved).toHaveBeenCalled());

    expect(productApi.updateCheckout).toHaveBeenCalled();
    expect(productApi.saveCheckoutPaymentMethods).toHaveBeenCalled();
    // MessageId is null => skip PATCH branch; we just assert it didn't try to update
    expect(productApi.updateCheckoutMessage).not.toHaveBeenCalled();
    expect(productApi.createCheckoutMessage).not.toHaveBeenCalled();
  });

  it("CheckoutEditorEdit usa productId do localStorage quando prop nao é informada", async () => {
    localStorage.setItem("lastProductId", "p-edit-ls");
    productApi.getProductById.mockResolvedValue({ id: "p-edit-ls", name: "Produto Edit LS", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({ data: { name: "Checkout Edit LS" } });
    productApi.getCheckoutDepoiments.mockResolvedValue([]);
    productApi.getCheckoutPaymentMethods.mockResolvedValue([]);
    productApi.getCheckoutMessages.mockResolvedValue([]);

    render(<CheckoutEditorEdit checkoutId="checkout-ls" />);

    expect(await screen.findByText("Produto Edit LS")).toBeInTheDocument();
    expect(productApi.getProductById).toHaveBeenCalledWith("p-edit-ls", "token");
  });

  it("CheckoutEditorEdit cobre uploads, message fallback, update payment method e erros em depoimentos", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-3", name: "Produto 3", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({
      data: {
        name: "Checkout Edit 3",
        theme: "dark",
        default_color: "#abcdef",
        logo: "https://cdn.example.com/logo.png",
        banner: "https://cdn.example.com/banner.png",
        position_logo: "left",
        sell_notification: true,
        sell_time: "30 segundos",
        people_buy: 0,
        buy_now: 2,
        buy_at_thirty: "abc",
        buy_at_hour: "3",
        social_proof_enabled: true,
        social_proofs_message: "Mensagem",
        social_proofs_min_client: 5,
        productCheckoutPaymentId: "pm-existing",
        productCheckoutMessage: { id: "msg-fallback", title: "Obrigado", message: "Texto" },
      },
    });
    productApi.getCheckoutDepoiments.mockResolvedValue([{ id: "dep-1" }]);
    productApi.getCheckoutDepoiment.mockResolvedValue({
      id: "dep-1",
      name: "Joao",
      depoiment: "Bom",
      ratting: 5,
      active: true,
      image_url: "blob:dep.png",
    });
    productApi.getCheckoutPaymentMethods.mockResolvedValue([]);
    productApi.getCheckoutPaymentMethodById.mockResolvedValue({
      id: "pm-existing",
      accept_document_company: false,
      accept_document_individual: true,
      accept_pix: true,
      accept_credit_card: true,
      accept_ticket: false,
      accept_coupon: true,
      shown_seller_detail: true,
      require_address: true,
      detail_discount: { card: 10, pix: 5 },
      detail_payment_method: {
        installments_limit: 6,
        installments_preselected: 3,
        boleto_due_days: 4,
        pix_expire_minutes: 10,
      },
    });
    productApi.getCheckoutMessages.mockResolvedValue([]);

    productApi.updateCheckout.mockResolvedValue({ id: "checkout-3" });
    productApi.updateCheckoutMessage.mockRejectedValue(new Error("msg fail"));
    productApi.updateCheckoutPaymentMethod.mockResolvedValue({ ok: true });
    productApi.uploadCheckoutAsset
      .mockRejectedValueOnce(new Error("logo upload fail"))
      .mockResolvedValueOnce({ url: "https://cdn.example.com/banner-new.png" });

    productApi.updateCheckoutDepoiment
      .mockRejectedValueOnce(new Error("toggle fail"))
      .mockResolvedValueOnce({ ok: true });
    productApi.deleteCheckoutDepoiment
      .mockRejectedValueOnce(new Error("delete fail"))
      .mockResolvedValueOnce(undefined);

    const revokeSpy = jest.spyOn(URL, "revokeObjectURL");

    const { container } = render(
      <CheckoutEditorEdit productId="product-3" checkoutId="checkout-3" onSaved={onSaved} />
    );

    expect(await screen.findByText("Produto 3")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Checkout Edit 3")).toBeInTheDocument();

    // Stored previews should trigger HEAD size fetch
    await waitFor(() => expect((global.fetch as unknown as jest.Mock)).toHaveBeenCalled());

    // Upload invalid logo -> error
    const fileInputs = Array.from(container.querySelectorAll('input[type="file"][accept="image/*"]'));
    const logoFileInput = fileInputs[0] as HTMLInputElement;
    const bannerFileInput = fileInputs[fileInputs.length - 1] as HTMLInputElement;

    await act(async () => {
      fireEvent.change(logoFileInput, {
        target: { files: [new File(["x"], "x.gif", { type: "image/gif" })] },
      });
    });
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/Formato de imagem inválido/i));

    // Upload oversize logo -> error
    const bigFile = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(bigFile, "size", { value: 11 * 1024 * 1024 });
    await act(async () => {
      fireEvent.change(logoFileInput, { target: { files: [bigFile] } });
    });
    expect(notify.error).toHaveBeenCalledWith(expect.stringMatching(/menos de 10MB/i));

    // Upload valid logo (compress ok)
    await act(async () => {
      fireEvent.change(logoFileInput, {
        target: { files: [new File(["x"], "x.png", { type: "image/png" })] },
      });
    });
    expect(compressImageFile).toHaveBeenCalled();

    // Upload banner (compress fails -> fallback preview from file)
    await act(async () => {
      fireEvent.change(bannerFileInput, {
        target: { files: [new File(["x"], "b.png", { type: "image/png" })] },
      });
    });

    // Toggle testimonial active: first fails (revert), then succeeds
    const firstCardHeader = screen.getByText("#1").closest("div")?.parentElement;
    expect(firstCardHeader).toBeTruthy();
    const headerButtons = within(firstCardHeader as HTMLElement).getAllByRole("button");

    await user.click(headerButtons[0]);
    await waitFor(() => expect(productApi.updateCheckoutDepoiment).toHaveBeenCalled());
    expect(notify.error).toHaveBeenCalledWith("Erro ao atualizar depoimento.");

    await user.click(headerButtons[0]);
    await waitFor(() => expect(notify.success).toHaveBeenCalledWith("Depoimento atualizado"));

    // Delete testimonial: first fails (keeps), then succeeds and revokes blob url
    await user.click(within(firstCardHeader as HTMLElement).getByRole("button", { name: /Excluir/i }));
    await waitFor(() => expect(productApi.deleteCheckoutDepoiment).toHaveBeenCalled());
    expect(notify.error).toHaveBeenCalledWith("Erro ao excluir depoimento.");

    await user.click(within(firstCardHeader as HTMLElement).getByRole("button", { name: /Excluir/i }));
    await waitFor(() => expect(revokeSpy).toHaveBeenCalled());

    // Save triggers message PATCH (fallback messageId) + payment method PATCH + uploads
    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);

    await waitFor(() => expect(productApi.updateCheckout).toHaveBeenCalled());
    await waitFor(() => expect(productApi.updateCheckoutMessage).toHaveBeenCalled());
    expect(notify.error).toHaveBeenCalledWith("Erro ao salvar mensagem pós-compra.");
    await waitFor(() => expect(productApi.updateCheckoutPaymentMethod).toHaveBeenCalled());
    await waitFor(() => expect(productApi.uploadCheckoutAsset).toHaveBeenCalled());

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it("CheckoutEditorCreate cria mensagem pos-compra quando messageId é null e trata erro em payment methods", async () => {
    const onSaved = jest.fn();
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-4", name: "Produto 4", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({
      data: {
        name: "Checkout Valido",
        productCheckoutPayment: {
          accept_document_individual: true,
          accept_credit_card: true,
          accept_pix: true,
          accept_ticket: false,
          accept_coupon: true,
        },
      },
    });
    productApi.getCheckoutDepoiments.mockResolvedValue([]);
    productApi.getCheckoutPaymentMethods.mockResolvedValue([
      {
        id: "pm-1",
        accept_document_individual: true,
        accept_credit_card: true,
        accept_pix: true,
        accept_ticket: false,
        accept_coupon: true,
      },
    ]);
    productApi.getCheckoutMessages.mockResolvedValue([]);

    productApi.createCheckout.mockResolvedValue({ id: "checkout-created" });
    productApi.createCheckoutMessage.mockResolvedValue({ data: { id: "msg-new" } });
    productApi.saveCheckoutPaymentMethods.mockRejectedValueOnce(new Error("pay fail"));

    render(<CheckoutEditorCreate productId="product-4" checkoutId="checkout-4" onSaved={onSaved} />);

    expect(await screen.findByText("Produto 4")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Checkout Valido")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);
    await waitFor(() => expect(productApi.createCheckout).toHaveBeenCalled());
    await waitFor(() => expect(productApi.createCheckoutMessage).toHaveBeenCalled());
    await waitFor(() => expect(notify.error).toHaveBeenCalledWith("Erro ao salvar métodos de pagamento."));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
  });

  it("CheckoutEditorCreate valida nome/documentos/metodos antes de salvar", async () => {
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-5", name: "Produto 5", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({ data: { name: "Checkout" } });
    productApi.getCheckoutDepoiments.mockResolvedValue([]);
    productApi.getCheckoutPaymentMethods.mockResolvedValue([
      { accept_document_individual: true, accept_credit_card: true, accept_pix: true, accept_ticket: false, accept_coupon: true },
    ]);
    productApi.getCheckoutMessages.mockResolvedValue([]);

    render(<CheckoutEditorCreate productId="product-5" checkoutId="checkout-5" onSaved={jest.fn()} />);
    expect(await screen.findByText("Produto 5")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);
    expect(notify.error).toHaveBeenCalledWith("Informe um nome válido para o checkout.");
  });

  it("CheckoutEditorCreate bloqueia save quando acceptedDocuments ou paymentMethods vem vazios da API", async () => {
    const user = userEvent.setup();

    productApi.getProductById.mockResolvedValue({ id: "product-6", name: "Produto 6", status: "active" });
    productApi.getCheckoutById.mockResolvedValue({ data: { name: "Checkout OK" } });
    productApi.getCheckoutDepoiments.mockResolvedValue([]);
    productApi.getCheckoutMessages.mockResolvedValue([]);

    // acceptedDocuments empty
    productApi.getCheckoutPaymentMethods.mockResolvedValueOnce([
      { accept_document_individual: false, accept_document_company: false, accept_credit_card: true, accept_pix: true, accept_ticket: false, accept_coupon: true },
    ]);

    render(<CheckoutEditorCreate productId="product-6" checkoutId="checkout-6" onSaved={jest.fn()} />);
    expect(await screen.findByText("Produto 6")).toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Checkout OK")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: /Salvar alterações/i })[0]);
    expect(notify.error).toHaveBeenCalledWith("Selecione ao menos um documento (CPF/CNPJ).");
  });
});

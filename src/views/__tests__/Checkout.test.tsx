import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkout from "@/views/Checkout";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/shared/ui/notification-toast", () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const { notify } = jest.requireMock("@/shared/ui/notification-toast") as { notify: Record<string, jest.Mock> };

describe("Checkout", () => {
  beforeEach(() => {
    pushMock.mockReset();
    notify.error.mockReset();
    notify.success.mockReset();
    (global.fetch as unknown as jest.Mock | undefined)?.mockReset?.();
  });

  it("aplica cupom, alterna meios de pagamento e confirma pagamento (sucesso)", async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;

    render(
      <Checkout
        publicApiBase="https://api.example.com"
        offerId="offer-1"
        productId="product-1"
        checkout={{
          name: "Checkout 1",
          defaultColor: "#0f864b",
          countdown: true,
          countdown_active: true,
          countdown_expire: 0.05,
          banner: "banner.png",
          logo: "/logo.png",
          position_logo: "center",
          required_email_confirmation: true,
          testimonials_enabled: true,
          testimonials: [
            { id: "t-1", name: "Joao", rating: 4, text: "Bom", active: true, image_url: "/avatar.png" } as any,
            { id: "t-2", name: "Hidden", rating: 5, text: "X", active: false } as any,
          ],
          productCheckoutPayment: {
            accept_credit_card: true,
            accept_pix: true,
            accept_ticket: true,
            accept_coupon: true,
            accept_document_individual: true,
            detail_discount: { card: 10, boleto: 5 },
          },
        } as any}
        product={{
          id: "product-1",
          name: "Produto",
          image_url: "/prod.png",
          coupons: [
            {
              id: "c-1",
              coupon_code: "OFF10",
              status: "active",
              minimum_purchase_amount: 10,
              discount_amount: 10,
              is_percentage: false,
            },
          ],
        } as any}
        offer={{
          id: "offer-1",
          type: "single_purchase",
          offer_price: 100,
          order_bumps: [
            { id: "b-1", title: "B1", offer_price: 10, normal_price: 20, description: "desc" } as any,
            { id: "b-2", title: "B2", offer_price: 0 } as any,
          ],
        } as any}
      />
    );

    // Banner/logo error handlers
    fireEvent.error(screen.getByAltText("Banner"));
    fireEvent.error(screen.getByAltText("Logo"));

    // Payment method switch
    await user.click(screen.getByRole("button", { name: "Pix" }));
    expect(screen.getByText(/QR Code será gerado/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Boleto" }));
    expect(screen.getByText(/Boleto será gerado/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Cartão de crédito/i }));

    // Fill identification
    await user.type(screen.getByPlaceholderText(/Digite seu nome completo/i), "Fulano");
    await user.type(screen.getByLabelText(/^E-mail$/i), "a@a.com");
    await user.type(screen.getByLabelText(/Confirmar e-mail/i), "a@a.com");

    // Coupon
    await user.type(screen.getByPlaceholderText(/Digite seu cupom/i), "OFF10");
    await user.click(screen.getByRole("button", { name: /Aplicar/i }));
    expect(screen.getByText(/CUPOM: OFF10/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Confirmar pagamento/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(body.payment_method).toBe("credit_card");
    expect(body.offer_id).toBe("offer-1");
    expect(body.product_id).toBe("product-1");
    expect(body.bumps).toEqual([{ id: "b-1" }, { id: "b-2" }]);

    expect(pushMock).toHaveBeenCalledWith(expect.stringMatching(/^\/pagamento-confirmado\?/));
  });

  it("bloqueia confirmacao quando email nao confere", async () => {
    const user = userEvent.setup();
    const fetchMock = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).alert = jest.fn();

    render(
      <Checkout
        offerId="offer-1"
        productId="product-1"
        checkout={{ required_email_confirmation: true, productCheckoutPayment: { accept_credit_card: true } } as any}
      />
    );

    await user.type(screen.getByLabelText(/^E-mail$/i), "a@a.com");
    await user.type(screen.getByLabelText(/Confirmar e-mail/i), "b@b.com");

    await user.click(screen.getByRole("button", { name: /Confirmar pagamento/i }));
    expect((global as any).alert).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mostra erro quando pagamento nao aprova ou falha na requisicao", async () => {
    const user = userEvent.setup();
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "no" }),
      })
      .mockRejectedValueOnce(new Error("network"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).fetch = fetchMock;

    const baseProps = {
      offerId: "offer-1",
      productId: "product-1",
      checkout: { productCheckoutPayment: { accept_credit_card: true } } as any,
    };

    const { rerender } = render(<Checkout {...(baseProps as any)} />);
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento/i }));
    await waitFor(() => expect(notify.error).toHaveBeenCalledWith("Pagamento não aprovado", "no"));

    rerender(<Checkout {...(baseProps as any)} />);
    await user.click(screen.getByRole("button", { name: /Confirmar pagamento/i }));
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        "Falha ao processar pagamento",
        "Verifique sua conexão e tente novamente."
      )
    );
  });

  it("atualiza o contador regressivo", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-10T12:00:00Z"));

    render(
      <Checkout
        offerId="offer-1"
        productId="product-1"
        checkout={{
          countdown: true,
          countdown_active: true,
          countdown_expire: 0.05, // 3s
          productCheckoutPayment: { accept_credit_card: true },
        } as any}
      />
    );

    expect(screen.getByText(/00:00:0[1-3]/)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/00:00:0[0-2]/)).toBeInTheDocument();

    jest.useRealTimers();
  });
});

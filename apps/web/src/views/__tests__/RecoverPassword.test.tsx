import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecoverPasswordView from "@/modules/auth/views/RecoverPassword";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("RecoverPasswordView", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("envia para a tela de confirmação ao preencher o email", async () => {
    const user = userEvent.setup();
    render(<RecoverPasswordView />);

    await user.type(screen.getByPlaceholderText(/seu endereço de e-mail/i), "contato@zuptos.com");
    await user.click(screen.getByRole("button", { name: /enviar e-mail/i }));

    expect(pushMock).toHaveBeenCalledWith("/email-enviado");
  });
});

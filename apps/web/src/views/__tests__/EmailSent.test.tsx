import { render, screen } from "@testing-library/react";
import EmailSentView from "@/views/EmailSent";

describe("EmailSentView", () => {
  it("exibe instruções para o usuário", () => {
    render(<EmailSentView />);

    expect(screen.getByText(/confira seu e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/caixa de entrada/i)).toBeInTheDocument();
    expect(screen.getByText(/verificar a caixa de spam/i)).toBeInTheDocument();
  });
});

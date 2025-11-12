import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotFound from "@/views/NotFound";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("NotFound view", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("mostra mensagem e permite voltar para home", async () => {
    const user = userEvent.setup();
    render(<NotFound />);

    expect(screen.getByText(/page not found/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /go home/i }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });
});

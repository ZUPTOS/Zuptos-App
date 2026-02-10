import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLoginView from "@/modules/admin/views/AdminLogin";

const signInMock = jest.fn().mockResolvedValue(undefined);
const clearErrorMock = jest.fn();

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signIn: signInMock,
    isLoading: false,
    error: null,
    clearError: clearErrorMock,
  }),
}));

describe("AdminLoginView", () => {
  beforeEach(() => {
    signInMock.mockClear();
    clearErrorMock.mockClear();
  });

  it("submete credenciais e chama signIn", async () => {
    const user = userEvent.setup();
    render(<AdminLoginView />);

    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(screen.getByLabelText(/Email/i), "admin@example.com");
    await user.clear(screen.getByLabelText(/Senha/i));
    await user.type(screen.getByLabelText(/Senha/i), "secret");

    await user.click(screen.getByRole("button", { name: /^Entrar$/i }));

    expect(clearErrorMock).toHaveBeenCalled();
    expect(signInMock).toHaveBeenCalledWith(
      { email: "admin@example.com", password: "secret" },
      { redirectTo: "/admin-dashboard" }
    );
  });
});


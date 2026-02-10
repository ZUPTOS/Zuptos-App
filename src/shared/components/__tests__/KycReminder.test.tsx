import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KycReminder from "@/shared/components/KycReminder";

const pushMock = jest.fn();
const getStatusMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  kycApi: {
    getStatus: (...args: unknown[]) => getStatusMock(...args),
  },
}));

const useAuthMock = jest.requireMock("@/contexts/AuthContext").useAuth as jest.Mock;
const usePathnameMock = jest.requireMock("next/navigation").usePathname as jest.Mock;

describe("KycReminder", () => {
  beforeEach(() => {
    pushMock.mockClear();
    getStatusMock.mockReset();
    useAuthMock.mockReset();
    usePathnameMock.mockReset();
  });

  it("mostra status pendente no perfil e navega para /kyc", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1", kyc: { status: "pending" } },
      token: "token",
      isAuthenticated: true,
    });

    usePathnameMock.mockReturnValue("/profile");
    render(<KycReminder />);

    expect(await screen.findByText(/^Cadastro em análise$/i)).toBeInTheDocument();
    expect(getStatusMock).not.toHaveBeenCalled();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Ver cadastro/i }));
    expect(pushMock).toHaveBeenCalledWith("/kyc");
  });

  it("consulta status quando nao ha info no perfil e mostra CTA de conclusao", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1" },
      token: "token",
      isAuthenticated: true,
    });

    getStatusMock.mockResolvedValue({ exists: false, rawStatus: undefined });
    usePathnameMock.mockReturnValue("/produtos");
    render(<KycReminder />);

    expect(await screen.findByText(/^Complete seu cadastro$/i)).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Concluir cadastro/i }));
    expect(pushMock).toHaveBeenCalledWith("/kyc");
  });

  it("mostra fallback de erro quando a API falha", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1" },
      token: "token",
      isAuthenticated: true,
    });

    getStatusMock.mockRejectedValue(new Error("boom"));
    usePathnameMock.mockReturnValue("/produtos");
    render(<KycReminder />);

    expect(await screen.findByText(/Não foi possível validar/i)).toBeInTheDocument();
  });
});

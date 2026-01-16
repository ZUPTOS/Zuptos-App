import { render, screen, waitFor } from "@testing-library/react";
import { withAuth, checkAuthentication, useAccessControl } from "@/lib/auth-guards";
import { useAuth } from "@/contexts/AuthContext";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("auth-guards", () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    pushMock.mockClear();
    mockUseAuth.mockReset();
  });

  it("withAuth renderiza componente quando autenticado", () => {
    const Protected = withAuth(() => <div>Conteúdo protegido</div>);
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(<Protected />);
    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
  });

  it("withAuth redireciona quando não autenticado", async () => {
    const Protected = withAuth(() => <div>Bloqueado</div>);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<Protected />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
    expect(screen.queryByText("Bloqueado")).not.toBeInTheDocument();
  });

  it("exibe estado de carregamento enquanto verifica autenticação", () => {
    const Protected = withAuth(() => <div>conteúdo</div>);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<Protected />);
    expect(screen.getByText(/Carregando.../i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("checkAuthentication confirma presença de token", async () => {
    localStorage.setItem("authToken", "token");
    const result = await checkAuthentication();
    expect(result).toBe(true);
  });

  it("useAccessControl retorna sem acesso quando usuário não autenticado", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
    });

    const result = useAccessControl("purchases");
    expect(result.hasAccess).toBe(false);
    expect(result.user).toBeNull();
  });

  it("useAccessControl verifica acesso por tipo", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { accessType: "purchases" },
    });

    const { user, hasAccess } = useAccessControl("purchases");
    expect(hasAccess).toBe(true);
    expect(user?.accessType).toBe("purchases");
  });

  it("useAccessControl bloqueia quando tipo não confere", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { accessType: "products" },
    });

    const result = useAccessControl("purchases");
    expect(result.hasAccess).toBe(false);
    expect(result.user?.accessType).toBe("products");
  });
});

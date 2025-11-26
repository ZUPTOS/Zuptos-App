import { render, screen } from "@testing-library/react";
import { DashboardWithHook, DashboardWithHOC } from "@/lib/protected-page-examples";
import { useAuth } from "@/contexts/AuthContext";

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe("protected-page-examples", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("renderiza DashboardWithHook quando autenticado", () => {
    mockUseAuth.mockReturnValue({
      user: { fullName: "Tester", email: "tester@example.com", accessType: "purchases" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<DashboardWithHook />);
    expect(screen.getByText(/Bem-vindo ao Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/tester@example.com/i)).toBeInTheDocument();
  });

  it("mostra mensagem de carregamento quando isLoading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    render(<DashboardWithHook />);
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it("informa necessidade de autenticação quando usuário não está logado", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<DashboardWithHook />);
    expect(screen.getByText(/precisa estar autenticado/i)).toBeInTheDocument();
  });

  it("componente com HOC respeita autenticação", () => {
    mockUseAuth.mockReturnValue({
      user: { fullName: "Tester", email: "tester@example.com", accessType: "purchases" },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<DashboardWithHOC />);
    expect(screen.getByText(/Bem-vindo ao Dashboard/i)).toBeInTheDocument();
  });
});

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembersCollectionPage from "@/views/members/pages/MembersCollectionPage";
import ProductMembersPage from "@/views/members/pages/ProductMembersPage";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", fullName: "User" },
  }),
}));

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/members",
}));

describe("Members pages", () => {
  beforeEach(() => {
    pushMock.mockClear();
    jest.useFakeTimers();
    // clipboard is used by MembersCard
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("ProductMembersPage: carrega produtos, filtra por busca e fecha menu ao clicar fora", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProductMembersPage areaId="members-area-1" />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Produto inicial
    expect(await screen.findByText("Gestão de Tráfego 1")).toBeInTheDocument();

    // Abre menu
    await user.click(screen.getAllByRole("button", { name: /Abrir menu do produto/i })[0]);
    expect(screen.getByText("Pré-visualizar")).toBeInTheDocument();

    // Clica fora fecha
    act(() => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(screen.queryByText("Pré-visualizar")).not.toBeInTheDocument();

    // Filtra
    await user.type(screen.getByRole("searchbox", { name: /Buscar produtos/i }), "Funil");
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(await screen.findByText("Funil de Conversão 2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Voltar para áreas de membros/i }));
    expect(pushMock).toHaveBeenCalledWith("/members");
  });

  it("MembersCollectionPage: pagina, abre e fecha modal de criação", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<MembersCollectionPage />);

    expect(screen.getByText(/Carregando áreas de membros/i)).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(await screen.findByText("Área de membros 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Próximo/i }));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(await screen.findByText("Área de membros 7")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Criar área de membros/i }));
    expect(screen.getAllByText(/Criar área de membros/i).length).toBeGreaterThan(0);

    await user.type(screen.getByPlaceholderText(/Insira o nome/i), "Minha área");
    expect(screen.getByDisplayValue("Minha área")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Fechar/i }));
    expect(screen.queryByDisplayValue("Minha área")).not.toBeInTheDocument();
  });
});

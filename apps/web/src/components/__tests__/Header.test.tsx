import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";

const toggleThemeMock = jest.fn();

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: toggleThemeMock,
    switchable: true
  })
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  )
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <>{children}</>
}));

describe("Header", () => {
  beforeEach(() => {
    toggleThemeMock.mockClear();
  });

  const renderHeader = () =>
    render(
      <AuthProvider>
        <Header
          userName="Zuptos"
          userLocation="RJ"
          pageTitle="Minha conta"
          pageSubtitle="Aluno"
        />
      </AuthProvider>
    );

  it("exibe título e subtítulo informados", () => {
    renderHeader();
    expect(screen.getByText("Minha conta")).toBeInTheDocument();
    expect(screen.getByText("Aluno")).toBeInTheDocument();
  });

  it("chama toggleTheme ao selecionar a opção no menu", async () => {
    const user = userEvent.setup();
    renderHeader();

    const profileButton = screen.getByRole("button", { name: /zuptos/i });
    await user.click(profileButton);

    const themeButton = await screen.findByRole("button", { name: /modo escuro/i });
    await user.click(themeButton);

    expect(toggleThemeMock).toHaveBeenCalled();
  });

  it("fecha o menu ao clicar fora", async () => {
    const user = userEvent.setup();
    renderHeader();

    const profileButton = screen.getByRole("button", { name: /zuptos/i });
    await user.click(profileButton);
    expect(await screen.findByText("Meu perfil")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText("Meu perfil")).not.toBeInTheDocument();
  });
});

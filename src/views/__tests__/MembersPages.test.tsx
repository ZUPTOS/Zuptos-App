import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MembersCollectionPage from "@/views/members/pages/MembersCollectionPage";
import ProductMembersPage from "@/views/members/pages/ProductMembersPage";
import ProductMemberEditPage from "@/views/members/pages/ProductMemberEditPage";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", fullName: "User" },
  }),
}));

jest.mock("@/lib/api", () => ({
  __esModule: true,
  ...jest.requireActual("@/lib/api"),
  productApi: {
    ...jest.requireActual("@/lib/api").productApi,
    listProducts: jest.fn(),
  },
}));

const { productApi: productApiMock } = jest.requireMock("@/lib/api") as {
  productApi: { listProducts: jest.Mock };
};

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
    productApiMock.listProducts.mockReset();
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

  it("ProductMembersPage: clicar no card navega para edição do produto na área de membros", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProductMembersPage areaId="members-area-1" />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(await screen.findByText("Gestão de Tráfego 1")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Abrir produto Gestão de Tráfego 1/i })
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/members/members-area-1/products/members-area-1-product-1"
    );
  });

  it("ProductMembersPage: abre modais de importar/layout/remover e atualiza lista", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProductMembersPage areaId="members-area-1" />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(await screen.findByText("Gestão de Tráfego 1")).toBeInTheDocument();

    productApiMock.listProducts.mockResolvedValueOnce([
      { id: "prod-99", name: "Produto Importado" },
    ]);

    await user.click(screen.getByRole("button", { name: /Importar produto/i }));

    const importDialog = await screen.findByRole("dialog");
    expect(within(importDialog).getByText(/Importar produto/i)).toBeInTheDocument();

    // Select product to import
    const selectTrigger = within(importDialog).getByText("Insira o nome").closest("button");
    expect(selectTrigger).toBeTruthy();
    await user.click(selectTrigger as HTMLButtonElement);
    await user.click(await screen.findByText("Produto Importado"));

    await user.click(within(importDialog).getByRole("button", { name: /^Importar$/i }));
    expect(await screen.findByText("Produto Importado")).toBeInTheDocument();

    // Import modal fallback (API error) + duplicate import shouldn't add a second entry
    productApiMock.listProducts.mockRejectedValueOnce(new Error("boom"));
    await user.click(screen.getByRole("button", { name: /Importar produto/i }));
    const importDialog2 = await screen.findByRole("dialog");
    const selectTrigger2 = within(importDialog2).getByText("Insira o nome").closest("button");
    expect(selectTrigger2).toBeTruthy();
    await user.click(selectTrigger2 as HTMLButtonElement);
    // Option text also exists in the product card, so scope to the select listbox.
    const listbox2 = await screen.findByRole("listbox");
    await user.click(within(listbox2).getByRole("option", { name: "Gestão de Tráfego 1" }));
    await user.click(within(importDialog2).getByRole("button", { name: /^Importar$/i }));
    expect(screen.getAllByText("Gestão de Tráfego 1")).toHaveLength(1);

    // Layout modal
    await user.click(screen.getAllByRole("button", { name: /Abrir menu do produto/i })[0]);
    await user.click(screen.getByRole("button", { name: /Layout/i }));

    const layoutDialog = await screen.findByRole("dialog");
    expect(within(layoutDialog).getByText("Layout")).toBeInTheDocument();
    expect(within(layoutDialog).getByText(/Capa do curso/i)).toBeInTheDocument();
    expect(within(layoutDialog).getByText(/Banner do curso/i)).toBeInTheDocument();

    const fileInputs = Array.from(
      layoutDialog.querySelectorAll('input[type="file"][accept="image/jpeg,image/jpg,image/png,image/webp"]')
    ) as HTMLInputElement[];
    expect(fileInputs.length).toBeGreaterThanOrEqual(2);
    await user.upload(fileInputs[0], new File(["x"], "cover.webp", { type: "image/webp" }));
    expect(await screen.findByText("cover.webp")).toBeInTheDocument();
    await user.upload(fileInputs[1], new File(["y"], "banner.webp", { type: "image/webp" }));
    expect(await screen.findByText("banner.webp")).toBeInTheDocument();

    await user.click(within(layoutDialog).getByRole("button", { name: /Atualizar/i }));
    expect(screen.queryByText("cover.webp")).not.toBeInTheDocument();
    expect(screen.queryByText("banner.webp")).not.toBeInTheDocument();

    // Remove modal
    await user.click(screen.getAllByRole("button", { name: /Abrir menu do produto/i })[0]);
    await user.click(screen.getByRole("button", { name: /Remover/i }));

    const removeDialog = await screen.findByRole("dialog");
    expect(within(removeDialog).getByText(/Remover produto/i)).toBeInTheDocument();
    await user.click(within(removeDialog).getByRole("button", { name: /Sim, remover/i }));

    // Imported product should be removable (it should no longer be present).
    expect(screen.queryByText("Produto Importado")).not.toBeInTheDocument();
  });

  it("ProductMembersPage: tab Alunos mostra cards, tabela e menu de ações", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProductMembersPage areaId="members-area-1" />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await user.click(screen.getByRole("button", { name: "Alunos" }));

    expect(screen.getByRole("button", { name: /Adicionar aluno/i })).toBeInTheDocument();
    expect(screen.getByText(/Número de alunos ativos/i)).toBeInTheDocument();
    expect(screen.getByText(/Progresso/i)).toBeInTheDocument();
    expect(screen.getByText(/Conclusão/i)).toBeInTheDocument();

    // Mocked list should render
    expect(await screen.findByText("Bruno Dias")).toBeInTheDocument();

    const searchInput = screen.getByRole("searchbox", { name: /Buscar alunos/i });
    await user.clear(searchInput);
    await user.type(searchInput, "Carla");
    expect((await screen.findAllByText("Carla Ferreira")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Bruno Dias")).not.toBeInTheDocument();

    await user.clear(searchInput);
    expect(await screen.findByText("Bruno Dias")).toBeInTheDocument();

    // Actions menu
    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Reenviar email de acesso/i }));
    const resendDialog = await screen.findByRole("dialog");
    expect(within(resendDialog).getByText(/Reenviar email de acesso/i)).toBeInTheDocument();
    await user.click(within(resendDialog).getByRole("button", { name: /Cancelar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Reenviar email de acesso/i }));
    const resendDialog2 = await screen.findByRole("dialog");
    await user.click(within(resendDialog2).getByRole("button", { name: /Sim, Reenviar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Criar nova senha/i }));
    const passwordDialog = await screen.findByRole("dialog");
    expect(within(passwordDialog).getByText(/Criar nova senha/i)).toBeInTheDocument();
    const passwordInputs = within(passwordDialog).getAllByPlaceholderText("senha");
    await user.type(passwordInputs[0], "123456");
    await user.type(passwordInputs[1], "123456");
    await user.click(within(passwordDialog).getByRole("button", { name: /Salvar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Editar aluno/i }));
    const editDialog = await screen.findByRole("dialog");
    expect(within(editDialog).getByText(/Editar aluno/i)).toBeInTheDocument();
    const emailInput = within(editDialog).getByPlaceholderText(/email@email.com/i);
    await user.clear(emailInput);
    await user.type(emailInput, "bruno+1@email.com");
    await user.click(within(editDialog).getByRole("button", { name: /Bloquear aluno/i }));
    await user.click(within(editDialog).getByRole("button", { name: "Produto 01" }));
    await user.click(within(editDialog).getByRole("button", { name: /Salvar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByText("bruno+1@email.com")).toBeInTheDocument();

    // Remove access removes the row from the table
    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Remover acesso/i }));
    const removeDialog = await screen.findByRole("dialog");
    expect(within(removeDialog).getByText(/Remover acesso/i)).toBeInTheDocument();
    await user.click(within(removeDialog).getByRole("button", { name: /Cancelar/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /Abrir menu do aluno/i })[0]);
    await user.click(screen.getByRole("button", { name: /Remover acesso/i }));
    const removeDialog2 = await screen.findByRole("dialog");
    await user.click(within(removeDialog2).getByRole("button", { name: /Sim, remover/i }));
    expect(screen.queryByText("Bruno Dias")).not.toBeInTheDocument();
  });

  it("ProductMemberEditPage: renderiza header e permite trocar abas", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ProductMemberEditPage
        areaId="members-area-1"
        productId="members-area-1-product-1"
      />
    );

    expect(await screen.findByText("Gestão de Tráfego 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Módulos" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /Buscar módulos/i })).toBeInTheDocument();

    const moduleCard = screen.getByRole("button", { name: /Abrir módulo module-1/i });
    await user.click(moduleCard);
    expect(moduleCard).toHaveAttribute("aria-expanded", "true");
    expect(within(moduleCard).getByRole("button", { name: "Mostrar" })).toBeInTheDocument();

    await user.click(
      within(moduleCard).getByRole("button", { name: /Abrir menu da aula do module-1/i })
    );
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Excluir" }).length).toBeGreaterThanOrEqual(2);

    act(() => {
      document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Excluir" })).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Turmas" }));
    expect(screen.getByRole("heading", { name: "Turmas" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Área de membros" }));
    expect(screen.queryByRole("button", { name: "Comentários" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ofertas" }));
    expect(screen.getByRole("heading", { name: "Ofertas" })).toBeInTheDocument();
  });

  it("ProductMembersPage: tab Configurações renderiza e permite alterar campos", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ProductMembersPage areaId="members-area-1" />);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await user.click(screen.getByRole("button", { name: "Configurações" }));

    expect(screen.getByText(/Tipo de área de membros/i)).toBeInTheDocument();
    expect(screen.getByText(/Proteção anti pirataria/i)).toBeInTheDocument();

    const liteCard = screen.getByRole("button", { name: /Lite/i });
    const completoCard = screen.getByRole("button", { name: /Completo/i });

    expect(completoCard).toHaveAttribute("aria-pressed", "true");
    await user.click(liteCard);
    expect(liteCard).toHaveAttribute("aria-pressed", "true");
    expect(completoCard).toHaveAttribute("aria-pressed", "false");

    const commentsSwitch = screen.getByRole("switch", { name: /Ativar comentários/i });
    expect(commentsSwitch).toHaveAttribute("aria-checked", "true");
    await user.click(commentsSwitch);
    expect(commentsSwitch).toHaveAttribute("aria-checked", "false");

    const blockCopySwitch = screen.getByRole("switch", { name: /Bloquear Ctrl/i });
    expect(blockCopySwitch).toHaveAttribute("aria-checked", "true");
    await user.click(blockCopySwitch);
    expect(blockCopySwitch).toHaveAttribute("aria-checked", "false");

    const languageTrigger = screen.getByRole("combobox", {
      name: /Idioma da área de membros/i,
    });
    await user.click(languageTrigger);
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: "English" }));
    expect(
      screen.getByRole("combobox", { name: /Idioma da área de membros/i })
    ).toHaveTextContent("English");

    const emailInput = screen.getByLabelText(/E-mail de suporte/i);
    await user.type(emailInput, "suporte@zuptos.com");
    expect(emailInput).toHaveValue("suporte@zuptos.com");

    await user.click(screen.getByRole("button", { name: /Salvar alterações/i }));
    await user.click(screen.getByRole("button", { name: /Excluir área de membros/i }));
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

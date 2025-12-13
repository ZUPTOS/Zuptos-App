import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import Products from "@/views/Products";

function buildMockProducts() {
  const baseProducts = [
    { id: "1", name: "Produto A", category: "Curso", description: "Descrição A", status: "pausado", mode: "producao", thumbnail: "/custom-a.png" },
    { id: "2", name: "Produto B", category: "E-book", description: "Descrição B", status: "em_breve", mode: "coproducao", thumbnail: "/custom-b.png" },
    { id: "3", name: "Produto C", category: "Assinatura", description: "Descrição C", status: "ativo", mode: "producao", thumbnail: "/custom-c.png" },
    { id: "4", name: "Produto D", category: "Assinatura", description: "Descrição D", status: "ativo", mode: "producao", thumbnail: "/custom-d.png" },
    { id: "5", name: "Produto E", category: "Assinatura", description: "Descrição E", status: "ativo", mode: "producao", thumbnail: "/custom-e.png" },
    { id: "6", name: "Produto F", category: "Assinatura", description: "Descrição F", status: "ativo", mode: "producao", thumbnail: "/custom-f.png" },
    { id: "7", name: "Produto G", category: "Assinatura", description: "Descrição G", status: "ativo", mode: "producao", thumbnail: "/custom-g.png" },
    { id: "8", name: "Produto H", category: "Assinatura", description: "Descrição H", status: "ativo", mode: "producao", thumbnail: "/custom-h.png" },
    { id: "9", name: "Produto I", category: "Assinatura", description: "Descrição I", status: "ativo", mode: "producao", thumbnail: "/custom-i.png" },
    { id: "10", name: "Produto J", category: "Assinatura", description: "Descrição J", status: "ativo", mode: "producao", thumbnail: "/custom-j.png" },
    { id: "11", name: "Produto K", category: "Assinatura", description: "Descrição K", status: "ativo", mode: "producao", thumbnail: "/custom-k.png" },
    { id: "12", name: "Produto L", category: "Assinatura", description: "Descrição L", status: "ativo", mode: "producao", thumbnail: "/custom-l.png" },
    { id: "13", name: "Produto M", category: "Assinatura", description: "Descrição M", status: "ativo", mode: "producao", thumbnail: "/custom-m.png" }
  ];

  const extraProducts = Array.from({ length: 80 }, (_, index) => {
    const id = `${index + baseProducts.length + 1}`;
    return {
      id,
      name: `Produto Extra ${id}`,
      category: "Assinatura",
      description: `Descrição Extra ${id}`,
      status: "ativo",
      mode: index % 2 === 0 ? "producao" : "coproducao",
      thumbnail: "/custom-extra.png"
    };
  });

  return [...baseProducts, ...extraProducts];
}

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (): ReactElement => <span data-testid="mocked-image" />
}));

jest.mock("@/data/productsData.json", () => ({
  products: buildMockProducts()
}));

describe("Products view", () => {
  it("renderiza produtos e badge Ativo para todos", () => {
    render(<Products />);

    expect(screen.getByText("Produto A")).toBeInTheDocument();
    expect(screen.getByText("Produto B")).toBeInTheDocument();
    const badges = screen.getAllByText("Ativo");
    expect(badges.length).toBeGreaterThanOrEqual(12);
    expect(screen.queryByText("Descrição A")).not.toBeInTheDocument();
  });

  it("filtra por aba Coprodução", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByRole("button", { name: "Coprodução" }));
    expect(screen.queryByText("Produto A")).not.toBeInTheDocument();
    expect(screen.getByText("Produto B")).toBeInTheDocument();
  });

  it("mostra estado vazio quando a busca não encontra", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.type(screen.getByPlaceholderText(/Buscar produto/i), "termo-inexistente");
    expect(await screen.findByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
  });

  it("abre e fecha o modal de filtro", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByLabelText(/Abrir filtros de produtos/i));
    expect(screen.getByText(/Tipo/i)).toBeInTheDocument();
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Adicionar filtro/i }));
    expect(screen.queryByText(/Tipo/i)).not.toBeInTheDocument();
  });

  it("abre o modal de novo produto e preenche campos básicos", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByRole("button", { name: /Adicionar produto/i }));
    expect(screen.getByText(/^Novo produto$/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Curso/i));
    const [nomeInput] = screen.getAllByPlaceholderText(/Insira o nome/i);
    await user.type(nomeInput, "Produto Teste");
    await user.selectOptions(screen.getByDisplayValue("Selecione a categoria"), "Tecnologia da Informação");

    await user.click(screen.getByRole("button", { name: /Cadastrar produto/i }));
    expect(screen.queryByText(/Novo produto/i)).not.toBeInTheDocument();
  });

  it("mostra paginação com reticências quando há muitas páginas", () => {
    render(<Products />);

    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6" })).toBeInTheDocument();
  });

  it("permite marcar filtros e preencher informações internas no cadastro", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.click(screen.getByLabelText(/Abrir filtros de produtos/i));
    const cursoFilter = screen.getByLabelText(/^Curso$/i);
    await user.click(cursoFilter);
    expect(cursoFilter).toBeChecked();
    const recusadoFilter = screen.getByLabelText(/Recusado/i);
    await user.click(recusadoFilter);
    expect(recusadoFilter).toBeChecked();
    await user.click(screen.getByRole("button", { name: /Adicionar filtro/i }));

    await user.click(screen.getByRole("button", { name: /Adicionar produto/i }));
    const modal = screen.getByText(/^Novo produto$/i).closest("aside") as HTMLElement;

    const textboxes = within(modal).getAllByRole("textbox");
    const [nomeInput, descricaoTextarea, complementoTextarea, paginaVendasInput] = textboxes;

    await user.type(nomeInput, "Produto Cadastro");
    await user.type(descricaoTextarea, "Descrição breve produto");
    await user.type(complementoTextarea, "Informações internas para análise");
    await user.type(paginaVendasInput, "https://exemplo.com");
    const ebookCheckbox = within(modal).getByLabelText(/^E-BOOK ou arquivo$/i);
    await user.click(ebookCheckbox);
    expect(ebookCheckbox).toBeChecked();
  });

  it("filtra por busca e navega na paginação", async () => {
    const user = userEvent.setup();
    render(<Products />);

    // busca por E-book
    await user.type(screen.getByPlaceholderText(/Buscar produto/i), "E-book");
    expect(await screen.findByText("Produto B")).toBeInTheDocument();
    expect(screen.queryByText("Produto A")).not.toBeInTheDocument();

    // limpar busca e verificar paginação
    await user.clear(screen.getByPlaceholderText(/Buscar produto/i));
    expect(screen.getAllByText("Ativo").length).toBeGreaterThan(0);

    // ir para página 2
    await user.click(screen.getByRole("button", { name: "Próximo" }));
    expect(screen.getByText("Produto M")).toBeInTheDocument();

    // voltar para página 1
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByText("Produto A")).toBeInTheDocument();
  });
});

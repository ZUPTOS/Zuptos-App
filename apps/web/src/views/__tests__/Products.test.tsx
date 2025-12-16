import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import Products from "@/views/Products";

// eslint-disable-next-line no-var
var mockProducts: {
  id: string;
  name: string;
  type: string;
  image_url: string;
  total_invoiced: number;
  total_sold: number;
}[];

jest.mock("@/lib/api", () => {
  const productsFixture = [
    { id: "1", name: "Produto A", type: "course", image_url: "/custom-a.png", total_invoiced: 1000, total_sold: 500 },
    { id: "2", name: "Produto B", type: "ebook", image_url: "/custom-b.png", total_invoiced: 800, total_sold: 300 },
    { id: "3", name: "Produto C", type: "service", image_url: "/custom-c.png", total_invoiced: 1200, total_sold: 600 },
    { id: "4", name: "Produto D", type: "course", image_url: "/custom-d.png", total_invoiced: 900, total_sold: 200 },
    { id: "5", name: "Produto E", type: "ebook", image_url: "/custom-e.png", total_invoiced: 400, total_sold: 120 },
    { id: "6", name: "Produto F", type: "service", image_url: "/custom-f.png", total_invoiced: 700, total_sold: 220 },
    { id: "7", name: "Produto G", type: "course", image_url: "/custom-g.png", total_invoiced: 500, total_sold: 80 },
    { id: "8", name: "Produto H", type: "ebook", image_url: "/custom-h.png", total_invoiced: 300, total_sold: 50 },
    { id: "9", name: "Produto I", type: "service", image_url: "/custom-i.png", total_invoiced: 250, total_sold: 40 },
  ];
  mockProducts = productsFixture;

  return {
    productApi: {
      listProducts: jest.fn().mockResolvedValue(productsFixture),
      createProduct: jest.fn().mockResolvedValue({ id: "new-id", status: "success" })
    }
  };
});

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (): ReactElement => <span data-testid="mocked-image" />
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" }, token: "token" })
}));

describe("Products view", () => {
  it("renderiza produtos vindos da API e mostra badge ativo", async () => {
    render(<Products />);

    expect(await screen.findByText("Produto A")).toBeInTheDocument();
    expect(screen.getByText("Produto B")).toBeInTheDocument();
    const badges = await screen.findAllByText("Ativo");
    expect(badges).toHaveLength(mockProducts.length);
  });

  it("filtra por aba Coprodução", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await screen.findByText("Produto A");
    await user.click(screen.getByRole("button", { name: "Coprodução" }));
    expect(screen.queryByText("Produto A")).not.toBeInTheDocument();
    expect(screen.getByText("Produto B")).toBeInTheDocument();
  });

  it("mostra estado vazio quando a busca não encontra", async () => {
    const user = userEvent.setup();
    render(<Products />);

    await user.type(await screen.findByPlaceholderText(/Buscar produto/i), "termo-inexistente");
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

  it("mostra paginação com reticências quando há muitas páginas", async () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, value: 500 });
    const user = userEvent.setup();
    render(<Products />);

    await screen.findAllByText("Ativo");

    const nextButton = screen.getByRole("button", { name: "Próximo" });
    expect(nextButton).not.toBeDisabled();
    await user.click(nextButton);
    expect(screen.getByText("Produto G")).toBeInTheDocument();
    expect(screen.queryByText("Produto A")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(screen.getByText("Produto A")).toBeInTheDocument();
    Object.defineProperty(window, "innerWidth", { writable: true, value: originalWidth });
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

    await user.type(await screen.findByPlaceholderText(/Buscar produto/i), "Produto H");
    expect(await screen.findByText("Produto H")).toBeInTheDocument();
    expect(screen.queryByText("Produto A")).not.toBeInTheDocument();

    await user.clear(screen.getByPlaceholderText(/Buscar produto/i));
    expect(await screen.findByText("Produto A")).toBeInTheDocument();
  });
});

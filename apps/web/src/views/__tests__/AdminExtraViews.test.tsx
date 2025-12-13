import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import AdminCheckout from "@/views/AdminCheckout";
import AdminColaboradores from "@/views/AdminColaboradores";
import AdminColaboradorDetalhes from "@/views/AdminColaboradorDetalhes";
import AdminConfiguracoes from "@/views/AdminConfiguracoes";
import AdminDocumentos from "@/views/AdminDocumentos";
import AdminDocumentoDetalhes from "@/views/AdminDocumentoDetalhes";
import AdminProdutoDetalhes from "@/views/AdminProdutoDetalhes";
import AdminUsuarioDetalhes from "@/views/AdminUsuarioDetalhes";
import AdminProdutos from "@/views/AdminProdutos";
import AdminTransacoes from "@/views/AdminTransacoes";
import AdminFinancas from "@/views/AdminFinancas";
import AdminSaques from "@/views/AdminSaques";

const pushMock = jest.fn();
const backMock = jest.fn();
let searchParams: URLSearchParams = new URLSearchParams();

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="dashboard-layout">{children}</div>,
}));

jest.mock("@/components/FilterDrawer", () => ({
  __esModule: true,
  FilterDrawer: ({
    open,
    onClose,
    title,
    children,
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
  }) =>
    open ? (
      <div data-testid="filter-drawer">
        <p>{title}</p>
        <button onClick={onClose}>Fechar</button>
        {children}
      </div>
    ) : null,
}));

jest.mock("@/components/ConfirmModal", () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    title,
    description,
  }: {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
  }) =>
    open ? (
      <div data-testid="confirm-modal">
        <p>{title}</p>
        <div>{description}</div>
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null,
}));

jest.mock("@/components/DateFilter", () => ({
  __esModule: true,
  default: ({ onDateChange }: { onDateChange?: (start: Date, end: Date) => void }) => (
    <button aria-label="Filtro de datas" onClick={() => onDateChange?.(new Date(2020, 0, 1), new Date(2030, 0, 1))}>
      Filtro
    </button>
  ),
}));

jest.mock("@/components/PaginatedTable", () => ({
  __esModule: true,
  default: ({
    data,
    onRowClick,
  }: {
    data: Array<{ id?: string; name?: string }>;
    onRowClick?: (row: { id?: string; name?: string }) => void;
  }) => (
    <div data-testid="paginated-table">
      {data.map(row => (
        <button key={row.id ?? row.name} type="button" onClick={() => onRowClick?.(row)}>
          {row.name ?? row.id ?? "row"}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
  useSearchParams: () => searchParams,
  usePathname: () => "/",
}));

describe("Admin checkout estático", () => {
  it("renderiza seções principais do checkout", () => {
    render(<AdminCheckout />);
    expect(screen.getByText(/Identificação/i)).toBeInTheDocument();
    expect(screen.getByText(/^Pagamento$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Comprar agora/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Pix|Cartão|Boleto/ }).length).toBeGreaterThanOrEqual(3);
  });
});

describe("AdminColaboradores", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("navega até detalhes do colaborador e alterna para aba de cargos", async () => {
    const user = userEvent.setup();
    render(<AdminColaboradores />);

    await user.click(screen.getAllByText(/email@email.com/i)[0]);
    expect(pushMock).toHaveBeenCalledWith("/admin/colaborador/detalhes");

    await user.click(screen.getByRole("button", { name: /Cargos/i }));
    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "__new__");
    expect(screen.getByText(/Insira o nome do cargo/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Nome/i), "Supervisor");
    await user.click(screen.getByRole("button", { name: /Confirmar/i }));
    expect(screen.getByDisplayValue("Supervisor")).toBeInTheDocument();

    const checkbox = screen.getAllByRole("checkbox")[0];
    await user.click(checkbox);
    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });
});

describe("AdminColaboradorDetalhes", () => {
  beforeEach(() => {
    backMock.mockClear();
  });

  it("permite voltar e alternar permissões do colaborador", async () => {
    const user = userEvent.setup();
    render(<AdminColaboradorDetalhes />);

    await user.click(screen.getByRole("button", { name: /Voltar/i }));
    expect(backMock).toHaveBeenCalled();

    const manageCheckbox = screen.getByRole("checkbox", { name: /Gerenciar Taxas/i });
    await user.click(manageCheckbox);
    expect((manageCheckbox as HTMLInputElement).checked).toBe(true);

    const viewCheckbox = screen.getByRole("checkbox", { name: /Ver dados de Taxas/i });
    await user.click(viewCheckbox);
    expect((viewCheckbox as HTMLInputElement).checked).toBe(true);
  });
});

describe("AdminConfiguracoes", () => {
  it("formata campos e alterna meios de pagamento", async () => {
    const user = userEvent.setup();
    render(<AdminConfiguracoes />);

    const [pixTaxaFixa] = screen.getAllByLabelText(/Taxa fixa/i);
    await user.clear(pixTaxaFixa);
    await user.type(pixTaxaFixa, "1234");
    expect(pixTaxaFixa).toHaveValue("R$ 12,34");

    const [pixTaxaVariavel] = screen.getAllByLabelText(/Taxa variável/i);
    await user.clear(pixTaxaVariavel);
    await user.type(pixTaxaVariavel, "5678");
    expect(pixTaxaVariavel).toHaveValue("56,78%");

    await user.click(screen.getByRole("button", { name: /Ajustes gerais/i }));
    const toggle = screen.getByLabelText(/Alternar Pix/i);
    const card = toggle.closest("div.relative") ?? toggle.closest("div");
    expect(card).toHaveTextContent(/Ativo/i);
    await user.click(toggle);
    expect(card).toHaveTextContent(/Inativo/i);
  });
});

describe("AdminDocumentos", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("abre filtros, marca status e navega para detalhes", async () => {
    const user = userEvent.setup();
    render(<AdminDocumentos />);

    await user.click(screen.getByLabelText(/Filtrar/i));
    expect(screen.getByTestId("filter-drawer")).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Filtro de datas/i));

    await user.click(screen.getByLabelText(/Aprovado/i));
    expect((screen.getByLabelText(/Aprovado/i) as HTMLInputElement).checked).toBe(true);

    await user.click(screen.getByRole("button", { name: /Fechar/i }));
    await user.click(screen.getByRole("button", { name: /Nome 01/i }));
    expect(pushMock).toHaveBeenCalled();
  });

  it("abre modal de exportação ao clicar em Exportar", async () => {
    const user = userEvent.setup();
    render(<AdminDocumentos />);
    await user.click(screen.getByLabelText(/Exportar/i));
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    await user.click(screen.getByText(/Fechar/i));
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
  });
});

describe("AdminDocumentoDetalhes", () => {
  beforeEach(() => {
    searchParams = new URLSearchParams();
  });

  it("exibe status padrão e documentos do usuário", () => {
    render(<AdminDocumentoDetalhes />);
    expect(screen.getByText(/Reprovado/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Documento \(verso\)/i).length).toBeGreaterThan(0);
  });

  it("permite aprovar documentação quando status é pendente", async () => {
    const user = userEvent.setup();
    searchParams = new URLSearchParams("status=Pendente");
    render(<AdminDocumentoDetalhes />);

    await user.click(screen.getByRole("button", { name: /Aprovar/i }));
    expect(screen.getByText(/Tem certeza que deseja aprovar/i)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Fechar modal de aprovação/i));
    expect(screen.queryByText(/Tem certeza que deseja aprovar/i)).not.toBeInTheDocument();
  });
});

describe("AdminProdutoDetalhes", () => {
  it("troca abas e permite alterar status com motivo", async () => {
    const user = userEvent.setup();
    render(<AdminProdutoDetalhes />);

    await user.click(screen.getByRole("button", { name: /Ofertas/i }));
    expect(screen.getByText(/Oferta 01/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Estatísticas/i }));
    expect(screen.getByText(/Faturamento/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Entregável/i }));
    expect(screen.getByText(/Arquivo atual/i)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/Editar status/i));
    await user.click(screen.getByRole("button", { name: /Aprovado/i }));
    await user.click(screen.getByRole("button", { name: /^Reprovado$/i }));
    const textarea = screen.getByPlaceholderText(/Inserir motivo/i);
    await user.type(textarea, "Motivo teste");
    await user.click(screen.getByRole("button", { name: /Confirmar/i }));
    expect(screen.getAllByText(/Reprovado/i)[0]).toBeInTheDocument();
  });
});

describe("AdminProdutos e listagens", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("filtra, pagina e exporta produtos", async () => {
    const user = userEvent.setup();
    render(<AdminProdutos />);

    const searchInput = screen.getByPlaceholderText(/Buscar produto/i);
    await user.type(searchInput, "inexistente");
    expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
    await user.clear(searchInput);
    await user.type(searchInput, "produto");

    await user.click(screen.getByLabelText(/Filtrar/i));
    const drawer = screen.getByTestId("filter-drawer");
    await user.click(within(drawer).getByLabelText(/Filtro de datas/i));
    const statusCheckbox = within(drawer).getByLabelText(/Aprovado/i);
    await user.click(statusCheckbox);
    expect((statusCheckbox as HTMLInputElement).checked).toBe(true);
    const serviceCheckbox = within(drawer).getByLabelText(/Curso/i);
    await user.click(serviceCheckbox);
    await user.click(within(drawer).getByRole("button", { name: /Adicionar filtro/i }));
    expect(screen.queryByTestId("filter-drawer")).not.toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /Próximo/i });
    await user.click(nextButton);
    await user.click(screen.getByRole("button", { name: /Anterior/i }));

    await user.click(screen.getByLabelText(/Exportar/i));
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    await user.click(screen.getByText(/Fechar/i));
    expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();

    await user.click(screen.getAllByText(/Produto 01/i)[0]);
    expect(pushMock).toHaveBeenCalled();
  });
});

describe("AdminTransacoes", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("aplica filtros e exporta relatório", async () => {
    const user = userEvent.setup();
    render(<AdminTransacoes />);

    await user.click(screen.getByLabelText(/Filtrar/i));
    const drawer = await screen.findByTestId("filter-drawer");
    await user.click(within(drawer).getByLabelText(/Filtro de datas/i));
    await user.click(within(drawer).getByLabelText(/Venda/i));
    await user.click(within(drawer).getByLabelText(/Entrada/i));
    await user.click(within(drawer).getByLabelText(/Aprovado/i));
    await user.click(within(drawer).getByRole("button", { name: /Adicionar filtro/i }));
    expect(screen.queryByTestId("filter-drawer")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/Exportar relatório/i));
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    await user.click(screen.getByText(/Fechar/i));

    const tableButtons = within(screen.getByTestId("paginated-table")).queryAllByRole("button");
    expect(tableButtons.length).toBeGreaterThan(0);
    await user.click(tableButtons[0]);
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/admin/transacoes/detalhes"));
  });
});

describe("AdminFinancas", () => {
  it("abre filtro, marca opções e fecha drawer", async () => {
    const user = userEvent.setup();
    const { container } = render(<AdminFinancas />);

    const filterButton = container.querySelector("svg.lucide-filter")?.closest("button") as HTMLButtonElement;
    expect(filterButton).toBeTruthy();
    fireEvent.click(filterButton);
    const drawer = await screen.findByTestId("filter-drawer");
    await user.click(within(drawer).getByLabelText(/Filtro de datas/i));
    const usuarioCheckbox = within(drawer).getByLabelText(/Usuário/i);
    await user.click(usuarioCheckbox);
    expect((usuarioCheckbox as HTMLInputElement).checked).toBe(true);
    await user.type(within(drawer).getByPlaceholderText(/Nome/i), "Maria");
    await user.click(within(drawer).getByRole("button", { name: /Adicionar filtro/i }));
    expect(screen.queryByTestId("filter-drawer")).not.toBeInTheDocument();
  });
});

describe("AdminSaques", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it("filtra saques por status, exporta e abre detalhes", async () => {
    const user = userEvent.setup();
    render(<AdminSaques />);

    await user.click(screen.getByLabelText(/Filtrar/i));
    const drawer = await screen.findByTestId("filter-drawer");
    await user.click(within(drawer).getByLabelText(/Filtro de datas/i));
    const statusCheckbox = within(drawer).getByLabelText(/Aprovado/i);
    await user.click(statusCheckbox);
    await user.click(within(drawer).getByRole("button", { name: /Adicionar filtro/i }));
    expect(screen.queryByTestId("filter-drawer")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/Exportar/i));
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    await user.click(screen.getByText(/Fechar/i));

    const tableButtons = within(screen.getByTestId("paginated-table")).queryAllByRole("button");
    expect(tableButtons.length).toBeGreaterThan(0);
    await user.click(tableButtons[0]);
    expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("/admin/saques/detalhes"));
  });
});

describe("AdminUsuarioDetalhes", () => {
  it("alterna abas, formata valores e gerencia saldo", async () => {
    const user = userEvent.setup();
    render(<AdminUsuarioDetalhes />);

    await user.click(screen.getByRole("button", { name: /Alterar permissões/i }));
    const pixCheckbox = screen.getAllByRole("checkbox")[0];
    expect(pixCheckbox).toHaveAttribute("aria-checked", "false");
    await user.click(pixCheckbox);
    expect(pixCheckbox).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("button", { name: /Financeiro/i }));
    await user.click(screen.getByRole("button", { name: /Gerenciar saldo/i }));
    const saldoInput = screen.getByPlaceholderText("R$0,00");
    await user.clear(saldoInput);
    await user.type(saldoInput, "1234");
    expect(saldoInput).toHaveValue("R$ 12,34");
    await user.click(screen.getByRole("button", { name: /Alterar saldo/i }));
    expect(screen.getByText(/Tem certeza que deseja alterar o saldo/i)).toBeInTheDocument();
    await user.click(screen.getByText(/Confirmar/i));
    expect(screen.queryByText(/Tem certeza que deseja alterar o saldo/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Ações$/i }));
    expect(screen.getByText(/Bloquear usuário/i)).toBeInTheDocument();
  });

  it("preenche taxas e navega por indicações e ações", async () => {
    const user = userEvent.setup();
    render(<AdminUsuarioDetalhes />);

    // Aba de taxas (padrão)
    const [taxaFixaInput] = screen.getAllByLabelText(/Taxa fixa/i);
    await user.clear(taxaFixaInput);
    await user.type(taxaFixaInput, "123456");
    expect(taxaFixaInput).toHaveValue("R$ 1.234,56");

    const [taxaVariavelInput] = screen.getAllByLabelText(/Taxa variável/i);
    await user.clear(taxaVariavelInput);
    await user.type(taxaVariavelInput, "987");
    expect(taxaVariavelInput).toHaveValue("R$ 9,87");

    await user.click(screen.getByRole("button", { name: /Indicações/i }));
    expect(screen.getByText(/Taxas de indicação/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("0,00%"), "50");

    await user.click(screen.getByRole("button", { name: /^Ações$/i }));
    expect(screen.getByText(/Entrar em contato/i)).toBeInTheDocument();
  });
});

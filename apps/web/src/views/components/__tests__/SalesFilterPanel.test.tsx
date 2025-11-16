import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import SalesFilterPanel, { SalesFilters } from "@/views/components/SalesFilterPanel";

const baseFilters: SalesFilters = {
  dateFrom: "",
  dateTo: "",
  product: "",
  paymentMethod: "",
  offers: [],
  statuses: [],
  buyerEmail: "",
  coupon: "",
  tipos: [],
  vendedor: [],
  utm: ""
};

describe("SalesFilterPanel", () => {
  const Wrapper = ({
    onFiltersChange,
    onApply
  }: {
    onFiltersChange: (patch: Partial<SalesFilters>) => void;
    onApply?: () => void;
  }) => {
    const [filters, setFilters] = useState(baseFilters);
    return (
      <SalesFilterPanel
        isOpen
        onClose={() => {}}
        filters={filters}
        onFiltersChange={patch => {
          setFilters(prev => ({ ...prev, ...patch }));
          onFiltersChange(patch);
        }}
        onApply={onApply}
      />
    );
  };

  it("atualiza filtros ao interagir com inputs e botões", async () => {
    const user = userEvent.setup();
    const onFiltersChange = jest.fn();
    const onApply = jest.fn();

    render(<Wrapper onFiltersChange={onFiltersChange} onApply={onApply} />);

    await user.type(screen.getByPlaceholderText(/buscar produto/i), "Curso completo");
    expect(onFiltersChange).toHaveBeenLastCalledWith({ product: "Curso completo" });

    await user.click(screen.getByRole("button", { name: /assinatura/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ offers: ["assinatura"] });

    await user.click(screen.getByRole("button", { name: /adicionar filtro/i }));
    expect(onApply).toHaveBeenCalled();
  });

  it("permite selecionar período e ajustar múltiplos filtros", async () => {
    const user = userEvent.setup();
    const onFiltersChange = jest.fn();
    render(<Wrapper onFiltersChange={onFiltersChange} />);

    await user.click(screen.getByRole("button", { name: /dd\/mm\/aaaa/i }));
    fireEvent.change(screen.getByLabelText(/início/i), { target: { value: "01/01/2024" } });
    expect(onFiltersChange).toHaveBeenCalledWith({ dateFrom: "2024-01-01" });
    fireEvent.change(screen.getByLabelText(/fim/i), { target: { value: "05/01/2024" } });
    expect(onFiltersChange).toHaveBeenCalledWith({ dateTo: "2024-01-05" });
    await user.click(screen.getByRole("button", { name: /definir período/i }));

    await user.click(screen.getByRole("button", { name: /aprovada/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ statuses: ["aprovada"] });

    await user.click(screen.getByRole("button", { name: /curso/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ tipos: ["Curso"] });

    await user.click(screen.getByRole("button", { name: /autoral/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ vendedor: ["Produtor"] });

    await user.type(screen.getByPlaceholderText(/insira o e-mail/i), "cliente@teste.com");
    expect(onFiltersChange).toHaveBeenLastCalledWith({ buyerEmail: "cliente@teste.com" });
  });
});

import { render, screen } from "@testing-library/react";
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
    onApply,
    onClose
  }: {
    onFiltersChange: (patch: Partial<SalesFilters>) => void;
    onApply?: () => void;
    onClose?: () => void;
  }) => {
    const [filters, setFilters] = useState(baseFilters);
    return (
      <SalesFilterPanel
        isOpen
        onClose={onClose ?? (() => {})}
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

    await user.click(screen.getByRole("button", { name: /abrir filtro de datas/i }));
    await user.click(screen.getByRole("button", { name: /ontem/i }));
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateFrom: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        dateTo: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      })
    );

    await user.click(screen.getByRole("button", { name: /curso/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ tipos: ["Curso"] });

    await user.click(screen.getByRole("button", { name: /autoral/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ vendedor: ["Produtor"] });

    await user.type(screen.getByPlaceholderText(/insira o e-mail/i), "cliente@teste.com");
    expect(onFiltersChange).toHaveBeenLastCalledWith({ buyerEmail: "cliente@teste.com" });
  });

  it("abre dropdowns, alterna filtros e fecha painel", async () => {
    const user = userEvent.setup();
    const onFiltersChange = jest.fn();
    const onClose = jest.fn();
    const onApply = jest.fn();

    render(<Wrapper onFiltersChange={onFiltersChange} onClose={onClose} onApply={onApply} />);

    await user.click(screen.getByRole("button", { name: /preço único/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ offers: ["preco_unico"] });

    const [paymentToggle, statusToggle] = screen.getAllByRole("button", { name: /todos/i });
    await user.click(paymentToggle);
    await user.click(screen.getByRole("button", { name: /Pix/i }));
    expect(onFiltersChange).toHaveBeenCalledWith({ paymentMethod: "Pix" });

    await user.click(statusToggle);
    await user.click(screen.getByRole("button", { name: "Pendente" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ statuses: ["pendente"] });

    await user.click(screen.getByLabelText(/fechar filtros/i));
    expect(onClose).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /adicionar filtro/i }));
    expect(onApply).toHaveBeenCalled();
  });
});

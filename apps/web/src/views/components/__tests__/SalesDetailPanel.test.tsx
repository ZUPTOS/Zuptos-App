import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SalesDetailPanel from "@/views/components/SalesDetailPanel";
import salesData from "@/data/salesData.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sale = (salesData as any).salesHistory[0];

describe("SalesDetailPanel", () => {
  it("exibe os detalhes da venda e permite fechar", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<SalesDetailPanel sale={sale} onClose={onClose} />);

    expect(screen.getByText(/id da transação/i)).toHaveTextContent(sale.id);
    expect(screen.getByText(sale.buyerName)).toBeInTheDocument();
    expect(screen.getByText(/status/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /fechar detalhes/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("abre modal de estorno e confirma a ação", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<SalesDetailPanel sale={sale} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /estornar venda/i }));
    expect(
      screen.getByText(/tem certeza que deseja estornar essa venda/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

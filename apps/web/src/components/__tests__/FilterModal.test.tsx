import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterModal from "@/components/FilterModal";

describe("FilterModal", () => {
  it("não renderiza conteúdo quando está fechado", () => {
    const { queryByText } = render(<FilterModal isOpen={false} onClose={jest.fn()} />);
    expect(queryByText(/filtrar por/i)).not.toBeInTheDocument();
  });

  it("permite abrir o calendário e selecionar um dia", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onDateChange = jest.fn();

    render(<FilterModal isOpen onClose={onClose} onDateChange={onDateChange} />);

    expect(screen.getByText(/filtrar por/i)).toBeInTheDocument();

    const monthButtons = screen.getAllByRole("button", { name: /este mês/i });
    await user.click(monthButtons[monthButtons.length - 1]);

    expect(screen.getByText(/outubro de 2025/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(onDateChange).toHaveBeenCalledTimes(1);

    const closeButton = screen.getByRole("button", { name: /fechar filtro/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});

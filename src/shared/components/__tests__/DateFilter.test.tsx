import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateFilter from "@/shared/components/DateFilter";

describe("DateFilter", () => {
  it("permite selecionar presets e fechar ao clicar fora", async () => {
    const onDateChange = jest.fn();
    render(<DateFilter onDateChange={onDateChange} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /abrir filtro de datas/i }));
    expect(screen.getByRole("button", { name: /hoje/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ontem/i }));
    expect(onDateChange).toHaveBeenCalled();

    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByText(/hoje/i)).not.toBeInTheDocument();
    });
  });

  it("abre o calendário detalhado e permite navegar entre meses", async () => {
    const onDateChange = jest.fn();
    render(<DateFilter onDateChange={onDateChange} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /abrir filtro de datas/i }));

    await user.click(screen.getByRole("button", { name: /alternar calendário detalhado/i }));
    expect(screen.getByRole("button", { name: /mês anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo mês/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mês anterior/i }));
    await user.click(screen.getByRole("button", { name: /próximo mês/i }));
  });
});

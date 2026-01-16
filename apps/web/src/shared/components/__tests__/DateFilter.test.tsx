import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateFilter from "@/shared/components/DateFilter";

describe("DateFilter", () => {
  it("permite selecionar presets e fechar ao clicar fora", async () => {
    const onDateChange = jest.fn();
    render(<DateFilter onDateChange={onDateChange} />);

    const input = screen.getByLabelText(/intervalo de datas/i);
    await userEvent.click(input);
    expect(screen.getByRole("button", { name: /hoje/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /ontem/i }));
    expect(onDateChange).toHaveBeenCalled();

    const toggle = screen.getByRole("button", { name: /alternar filtro de datas/i });
    await userEvent.click(toggle);
    expect(screen.getByText(/hoje/i)).toBeInTheDocument();

    await userEvent.click(document.body);
    await waitFor(() => {
      expect(screen.queryByText(/hoje/i)).not.toBeInTheDocument();
    });
  });

  it("aceita colar intervalos, navegar pelo calendário e selecionar datas", async () => {
    const onDateChange = jest.fn();
    render(<DateFilter onDateChange={onDateChange} />);

    const input = screen.getByLabelText(/intervalo de datas/i);
    await userEvent.click(input);
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "01/01/2024 - 05/01/2024"
      }
    } as unknown as ClipboardEvent);

    await waitFor(() => {
      expect(onDateChange).toHaveBeenCalled();
    });

    const toggle = screen.getByRole("button", { name: /alternar filtro de datas/i });
    if (!screen.queryByRole("button", { name: /hoje/i })) {
      await userEvent.click(toggle);
    }
    await userEvent.click(await screen.findByRole("button", { name: /alternar calendário detalhado/i }));

    await userEvent.click(screen.getByLabelText(/mês anterior/i));
    await userEvent.click(screen.getByLabelText(/próximo mês/i));

    const dayTen = screen.getAllByRole("button", { name: "10" })[0];
    const dayTwelve = screen.getAllByRole("button", { name: "12" })[0];

    await userEvent.click(dayTen);
    await userEvent.click(dayTwelve);

    expect(onDateChange.mock.calls.length).toBeGreaterThanOrEqual(3);
  });
});

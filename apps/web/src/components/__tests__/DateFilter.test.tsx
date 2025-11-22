import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import DateFilter from "@/components/DateFilter";

describe("DateFilter", () => {
  const fixedDate = new Date("2024-05-10T12:00:00Z");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fixedDate);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  const openFilter = async (user: ReturnType<typeof setupUser>) => {
    const toggleButton = screen.getByLabelText("Alternar filtro de datas");
    await user.click(toggleButton);
    return toggleButton;
  };

  const openCalendar = async (user: ReturnType<typeof setupUser>) => {
    await openFilter(user);
    const calendarToggle = await screen.findByLabelText("Alternar calendário detalhado");
    await user.click(calendarToggle);
  };

  it("chama onDateChange ao selecionar uma predefinição", async () => {
    const user = setupUser();
    const handleChange = jest.fn();
    render(<DateFilter onDateChange={handleChange} />);

    await openFilter(user);

    const presetButton = await screen.findByRole("button", { name: "Ontem" });
    await user.click(presetButton);

    expect(handleChange).toHaveBeenCalled();
    const [start, end] = handleChange.mock.calls.at(-1);
    expect(start.toISOString()).toContain("2024-05-09");
    expect(end.toISOString()).toContain("2024-05-09");
  });

  it("trata predefinições de mês", async () => {
    const user = setupUser();
    const handleChange = jest.fn();
    render(<DateFilter onDateChange={handleChange} />);

    await openFilter(user);

    const monthButton = await screen.findByRole("button", { name: "Este mês" });
    await user.click(monthButton);

    const [start, end] = handleChange.mock.calls.at(-1);
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBeGreaterThan(start.getDate());
  });

  it("processa todas as predefinições disponíveis", async () => {
    const user = setupUser();
    const handleChange = jest.fn();
    render(<DateFilter onDateChange={handleChange} />);

    const toggleButton = screen.getByLabelText("Alternar filtro de datas");
    const getLastRange = () => {
      const [start, end] = handleChange.mock.calls.at(-1);
      return { start, end };
    };

    const selectPreset = async (label: string) => {
      await user.click(toggleButton);
      const presetButton = await screen.findByRole("button", { name: label });
      await user.click(presetButton);
      return getLastRange();
    };

    const todayRange = await selectPreset("Hoje");
    expect(todayRange.start.toDateString()).toBe(fixedDate.toDateString());
    expect(todayRange.end.toDateString()).toBe(fixedDate.toDateString());

    const yesterdayRange = await selectPreset("Ontem");
    const yesterday = addDays(fixedDate, -1);
    expect(yesterdayRange.start.toDateString()).toBe(yesterday.toDateString());
    expect(yesterdayRange.end.toDateString()).toBe(yesterday.toDateString());

    const weekRange = await selectPreset("Esta semana");
    const startWeek = startOfWeek(fixedDate, { weekStartsOn: 1 });
    const endWeek = endOfWeek(fixedDate, { weekStartsOn: 1 });
    expect(weekRange.start.toDateString()).toBe(startWeek.toDateString());
    expect(weekRange.end.toDateString()).toBe(endWeek.toDateString());

    const lastWeekRange = await selectPreset("Última semana");
    const lastWeekStart = addDays(startWeek, -7);
    const lastWeekEnd = addDays(endWeek, -7);
    expect(lastWeekRange.start.toDateString()).toBe(lastWeekStart.toDateString());
    expect(lastWeekRange.end.toDateString()).toBe(lastWeekEnd.toDateString());

    const monthRange = await selectPreset("Este mês");
    const startMonth = startOfMonth(fixedDate);
    const endMonth = endOfMonth(fixedDate);
    expect(monthRange.start.toDateString()).toBe(startMonth.toDateString());
    expect(monthRange.end.toDateString()).toBe(endMonth.toDateString());
  });

  it("permite selecionar uma data manualmente pelo calendário", async () => {
    const user = setupUser();
    const handleChange = jest.fn();
    render(<DateFilter onDateChange={handleChange} />);

    await openCalendar(user);

    const octoberLabel = format(new Date(2025, 9, 1), "MMMM 'de' yyyy", {
      locale: ptBR
    });
    expect(screen.getByText(octoberLabel)).toBeInTheDocument();

    const startButton = screen.getByRole("button", { name: "10" });
    const endButton = screen.getByRole("button", { name: "15" });
    await user.click(startButton);
    await user.click(endButton);

    const [start, end] = handleChange.mock.calls.at(-1);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(9);
    expect(start.getDate()).toBe(10);
    expect(end.getDate()).toBe(15);

    // Calendário permanece aberto após selecionar o intervalo
    expect(screen.getByText(octoberLabel)).toBeInTheDocument();
  });

  it("permite navegar entre meses no calendário", async () => {
    const user = setupUser();
    render(<DateFilter />);

    await openCalendar(user);

    const monthLabel = (date: Date) =>
      format(date, "MMMM 'de' yyyy", {
        locale: ptBR
      });

    expect(screen.getByText(monthLabel(new Date(2025, 9, 1)))).toBeInTheDocument();

    await user.click(screen.getByLabelText("Mês anterior"));
    expect(screen.getByText(monthLabel(new Date(2025, 8, 1)))).toBeInTheDocument();

    await user.click(screen.getByLabelText("Próximo mês"));
    await user.click(screen.getByLabelText("Próximo mês"));
    expect(screen.getByText(monthLabel(new Date(2025, 10, 1)))).toBeInTheDocument();
  });

  it("fecha o menu ao clicar fora do componente", async () => {
    const user = setupUser();
    render(<DateFilter />);

    await openFilter(user);
    expect(await screen.findByRole("button", { name: "Hoje" })).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Hoje" })).not.toBeInTheDocument();
    });
  });
});

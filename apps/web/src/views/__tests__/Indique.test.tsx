import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import Indique from "@/views/Indique";

jest.mock("@/components/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock("recharts", () => {
  const Noop = () => null;
  const Container = ({ children }: { children: ReactNode }) => (
    <div data-testid="chart">{children}</div>
  );
  return {
    ResponsiveContainer: Container,
    LineChart: Noop,
    Line: Noop,
    Tooltip: Noop,
    XAxis: Noop,
    YAxis: Noop
  };
});

describe("Indique view", () => {
  it("mostra hero, gráfico e métricas no dashboard", () => {
    render(<Indique />);

    expect(screen.getByText(/Convide amigos/i)).toBeInTheDocument();
    expect(screen.getByText(/Comissão recebida/i)).toBeInTheDocument();
    expect(screen.getByText(/Cadastros realizados/i)).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
    expect(screen.getByTestId("chart")).toBeInTheDocument();
  });

  it("exibe tabela de links na aba de indicação", async () => {
    const user = userEvent.setup();
    render(<Indique />);

    await user.click(screen.getByRole("button", { name: /Link de indicação/i }));

    expect(screen.getByText(/Links de indicação/i)).toBeInTheDocument();
    expect(screen.getByText(/1 registro/i)).toBeInTheDocument();
    expect(screen.getByText("sdfbsuy79")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
    expect(screen.getByText("R$ 679,97")).toBeInTheDocument();
  });

  it("exibe tabela de afiliados na aba Meus indicados", async () => {
    const user = userEvent.setup();
    render(<Indique />);

    await user.click(screen.getByRole("button", { name: /Meus indicados/i }));

    expect(screen.getByText(/Meus afiliados/i)).toBeInTheDocument();
    expect(screen.getByText("#KAJFB68")).toBeInTheDocument();
    expect(screen.getByText("R$ 568,99")).toBeInTheDocument();
    expect(screen.getByText("INSTAGRAM 02")).toBeInTheDocument();
    expect(screen.getByText(/Ativo/i)).toBeInTheDocument();
  });
});

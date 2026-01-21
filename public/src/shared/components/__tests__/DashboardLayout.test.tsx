import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";

jest.mock("@/shared/components/layout/Sidebar", () => ({
  __esModule: true,
  default: () => <aside data-testid="sidebar" />
}));

jest.mock("@/shared/components/layout/Header", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <header data-testid="header">{JSON.stringify(props)}</header>
  )
}));

describe("DashboardLayout", () => {
  it("renderiza a sidebar, header e os filhos", () => {
    render(
      <DashboardLayout userName="Zuptos" userLocation="RJ">
        <div>Conteúdo interno</div>
      </DashboardLayout>
    );

    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo interno")).toBeInTheDocument();
    expect(screen.getByTestId("header").textContent).toContain("\"userName\":\"Zuptos\"");
  });
});

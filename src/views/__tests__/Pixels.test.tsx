import { render, screen } from "@testing-library/react";
import PixelsView from "@/views/Pixels";

jest.mock("@/shared/components/layout/DashboardLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

describe("PixelsView", () => {
  it("renderiza conteúdo estático", () => {
    render(<PixelsView />);
    expect(screen.getByTestId("layout")).toBeInTheDocument();
    expect(screen.getByText(/Pixels de rastreamento/i)).toBeInTheDocument();
  });
});


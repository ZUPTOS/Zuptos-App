import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "@/components/Sidebar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/vendas"
}));

jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "dark" })
}));

describe("Sidebar", () => {
  it("expande ao passar o mouse e destaca a rota atual", () => {
    render(<Sidebar />);

    const aside = screen.getByRole("complementary");
    fireEvent.mouseEnter(aside);

    const vendasLink = screen.getByRole("link", { name: /vendas/i });
    expect(vendasLink).toBeInTheDocument();
    expect(vendasLink).toHaveClass("text-foreground");
  });
});

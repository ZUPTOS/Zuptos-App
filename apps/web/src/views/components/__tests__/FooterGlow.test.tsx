import { render, screen } from "@testing-library/react";
import FooterGlow from "@/views/components/FooterGlow";

describe("FooterGlow", () => {
  it("renderiza o monograma e o gradiente decorativo", () => {
    render(<FooterGlow />);

    expect(screen.getByAltText(/zuptos monograma/i)).toBeInTheDocument();
  });
});

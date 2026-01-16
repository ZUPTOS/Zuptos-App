import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function ThemeConsumer() {
  const context = useTheme();
  return (
    <div>
      <span data-testid="theme">{context.theme}</span>
      {context.toggleTheme && (
        <button onClick={context.toggleTheme}>Toggle</button>
      )}
      <span data-testid="switchable">{String(context.switchable)}</span>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("usa o tema padrão e não oferece toggle quando switchable=false", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(screen.getByTestId("switchable")).toHaveTextContent("false");
    expect(screen.queryByRole("button", { name: /toggle/i })).not.toBeInTheDocument();
  });

  it("permite alternar e persiste quando switchable=true", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    await user.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

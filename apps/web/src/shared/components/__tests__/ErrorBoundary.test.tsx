import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

describe("ErrorBoundary", () => {
  const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renderiza children quando não há erro", () => {
    render(
      <ErrorBoundary>
        <p>OK</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("exibe fallback quando ocorre erro", () => {
    const Thrower = () => {
      throw new Error("Boom");
    };

    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(/An unexpected error occurred/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload page/i })).toBeInTheDocument();
  });
});

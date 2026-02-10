import { act, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { LoadingOverlayProvider, useLoadingOverlay } from "@/contexts/LoadingOverlayContext";

describe("LoadingOverlayContext", () => {
  it("useLoadingOverlay: fallback fora do provider", async () => {
    const { result } = renderHook(() => useLoadingOverlay());
    expect(result.current.isLoading).toBe(false);

    const value = await result.current.withLoading(async () => "ok");
    expect(value).toBe("ok");
  });

  it("LoadingOverlayProvider: mostra LoadingScreen em rotas de auth e esconde apos timeout", async () => {
    jest.useFakeTimers();

    render(
      <LoadingOverlayProvider>
        <div>child</div>
      </LoadingOverlayProvider>
    );

    expect(await screen.findByRole("status")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(520);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});


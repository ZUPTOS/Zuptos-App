import { renderHook } from "@testing-library/react";
import { act } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";

describe("usePersistFn", () => {
  it("retorna sempre a mesma referência mas usa a função mais recente", () => {
    const initialFn = jest.fn().mockReturnValue("primeiro");

    const { result, rerender } = renderHook(({ fn }) => usePersistFn(fn), {
      initialProps: { fn: initialFn }
    });

    const persistedFn = result.current;

    const updatedFn = jest.fn().mockReturnValue("segundo");
    rerender({ fn: updatedFn });

    expect(result.current).toBe(persistedFn);

    act(() => {
      result.current("valor");
    });

    expect(initialFn).not.toHaveBeenCalled();
    expect(updatedFn).toHaveBeenCalledWith("valor");
  });
});

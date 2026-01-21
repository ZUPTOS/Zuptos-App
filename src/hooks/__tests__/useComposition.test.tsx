import { renderHook } from "@testing-library/react";
import { act } from "react";
import type React from "react";
import { useComposition } from "@/hooks/useComposition";

const createKeyboardEvent = (overrides: Partial<React.KeyboardEvent<HTMLInputElement>> = {}) => ({
  key: "Enter",
  shiftKey: false,
  stopPropagation: jest.fn(),
  ...overrides
}) as unknown as React.KeyboardEvent<HTMLInputElement>;

const createCompositionEvent = () => ({
  preventDefault: jest.fn()
}) as unknown as React.CompositionEvent<HTMLInputElement>;

describe("useComposition", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("bloqueia eventos de Enter/Escape enquanto está compondo", () => {
    const onKeyDown = jest.fn();
    const onCompositionStart = jest.fn();
    const onCompositionEnd = jest.fn();

    const { result } = renderHook(() =>
      useComposition<HTMLInputElement>({
        onKeyDown,
        onCompositionStart,
        onCompositionEnd
      })
    );

    act(() => {
      result.current.onCompositionStart(createCompositionEvent());
    });

    expect(result.current.isComposing()).toBe(true);
    expect(onCompositionStart).toHaveBeenCalledTimes(1);

    const keyboardEvent = createKeyboardEvent();
    act(() => {
      result.current.onKeyDown(keyboardEvent);
    });

    expect(keyboardEvent.stopPropagation).toHaveBeenCalled();
    expect(onKeyDown).not.toHaveBeenCalled();

    act(() => {
      result.current.onCompositionEnd(createCompositionEvent());
    });

    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();

    expect(onCompositionEnd).toHaveBeenCalledTimes(1);
    expect(result.current.isComposing()).toBe(false);
  });

  it("permite eventos normais quando não está compondo", () => {
    const onKeyDown = jest.fn();
    const { result } = renderHook(() => useComposition<HTMLInputElement>({ onKeyDown }));

    const keyboardEvent = createKeyboardEvent();

    act(() => {
      result.current.onKeyDown(keyboardEvent);
    });

    expect(keyboardEvent.stopPropagation).not.toHaveBeenCalled();
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("limpa timers pendentes ao reiniciar a composição rapidamente", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { result } = renderHook(() => useComposition<HTMLInputElement>());

    act(() => {
      result.current.onCompositionEnd(createCompositionEvent());
    });

    act(() => {
      jest.advanceTimersToNextTimer();
    });

    act(() => {
      result.current.onCompositionStart(createCompositionEvent());
    });

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
    expect(result.current.isComposing()).toBe(true);

    clearTimeoutSpy.mockRestore();
  });
});

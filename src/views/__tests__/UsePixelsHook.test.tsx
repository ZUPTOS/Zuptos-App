import { act } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { usePixels } from "@/views/editar-produto/hooks/usePixels";

const notifyApiErrorMock = jest.fn();
jest.mock("@/lib/notify-error", () => ({
  notifyApiError: (...args: unknown[]) => notifyApiErrorMock(...args),
}));

jest.mock("@/lib/api", () => {
  const productApi = {
    getPlansByProductId: jest.fn(),
    updateTracking: jest.fn(),
    createPlan: jest.fn(),
    deleteTracking: jest.fn(),
  };
  return {
    productApi,
    ProviderTrackingName: {
      GOOGLE: "google",
      FACEBOOK: "facebook",
      TIKTOK: "tiktok",
    },
    TrackingStatus: {
      ACTIVE: "active",
      INACTIVE: "inactive",
    },
    TrackingType: {
      DEFAULT: "default",
      API: "api",
    },
  };
});

const { productApi } = jest.requireMock("@/lib/api") as { productApi: Record<string, jest.Mock> };

describe("usePixels", () => {
  const withLoading = async <T,>(task: () => Promise<T>) => task();

  beforeEach(() => {
    Object.values(productApi).forEach(fn => fn.mockReset());
    notifyApiErrorMock.mockReset();
  });

  it("carrega pixels e resolve plataforma", async () => {
    productApi.getPlansByProductId.mockResolvedValue([
      { id: "pl-1", provider_tracking_name: "google_ads", name: "Pixel 1" },
    ]);

    const { result } = renderHook(() => usePixels({ productId: "p-px-1", token: "t-1", withLoading }));
    await waitFor(() => expect(result.current.trackingsLoading).toBe(false));

    expect(result.current.trackings).toHaveLength(1);
    expect(result.current.resolvePlatform(result.current.trackings[0] as any)).toBe("google");
    expect(result.current.resolvePlatform({ provider_tracking_name: "facebook" } as any)).toBe("facebook");
    expect(result.current.resolvePlatform({ provider_tracking_name: "tiktok" } as any)).toBe("tiktok");
    expect(result.current.resolvePlatform({ provider_tracking_name: "unknown" } as any)).toBeNull();
  });

  it("salva (create/update) e deleta pixel, com validacoes e erro", async () => {
    productApi.getPlansByProductId.mockResolvedValue([]);
    productApi.createPlan.mockResolvedValue({ id: "pl-2" });
    productApi.updateTracking.mockResolvedValue({ ok: true });
    productApi.deleteTracking.mockResolvedValue(undefined);

    const { result } = renderHook(() => usePixels({ productId: "p-px-2", token: "t-2", withLoading }));
    await waitFor(() => expect(result.current.trackingsLoading).toBe(false));

    // Early returns
    await act(async () => {
      await result.current.handleSaveTracking();
    });
    expect(productApi.createPlan).not.toHaveBeenCalled();

    act(() => {
      result.current.setTrackingPlatform("google" as any);
      result.current.setTrackingName("Pixel");
      result.current.setTrackingPixelId("123");
      result.current.setTrackingType("api" as any);
      result.current.setTrackingToken("");
    });
    await act(async () => {
      await result.current.handleSaveTracking();
    });
    expect(productApi.createPlan).not.toHaveBeenCalled();

    // Create
    act(() => {
      result.current.setTrackingType("default" as any);
    });
    await act(async () => {
      await result.current.handleSaveTracking();
    });
    expect(productApi.createPlan).toHaveBeenCalledWith(
      "p-px-2",
      expect.objectContaining({
        provider_tracking_name: "google",
        provider_tracking_id: "123",
        name: "Pixel",
      }),
      "t-2"
    );

    // Update
    act(() => {
      result.current.openEditTracking({
        id: "pl-9",
        provider_tracking_name: "facebook",
        provider_tracking_id: "999",
        name: "Pix old",
        type: "api",
        status: "inactive",
      } as any);
      result.current.setTrackingToken("token");
    });
    await act(async () => {
      await result.current.handleSaveTracking();
    });
    expect(productApi.updateTracking).toHaveBeenCalledWith(
      "p-px-2",
      "pl-9",
      expect.objectContaining({ provider_tracking_name: "facebook" }),
      "t-2"
    );

    // Delete
    act(() => result.current.setDeleteTarget({ id: "pl-9" } as any));
    await act(async () => {
      await result.current.handleDeleteTracking();
    });
    expect(productApi.deleteTracking).toHaveBeenCalledWith("p-px-2", "pl-9", "t-2");

    // Error path
    productApi.createPlan.mockRejectedValueOnce(new Error("fail"));
    act(() => {
      result.current.handleOpenModal();
      result.current.setTrackingPlatform("google" as any);
      result.current.setTrackingType("default" as any);
      result.current.setTrackingName("Pixel");
      result.current.setTrackingPixelId("123");
    });
    await act(async () => {
      await result.current.handleSaveTracking();
    });
    expect(notifyApiErrorMock).toHaveBeenCalled();
  });
});


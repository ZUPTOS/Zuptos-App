import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardData } from "@/views/dashboard/hooks/useDashboardData";

jest.mock("@/lib/services/dashboard", () => ({
  getDashboardSales: jest.fn(),
  getDashboardFinance: jest.fn(),
  getDashboardAccountHealth: jest.fn(),
  getDashboardAccountJourney: jest.fn(),
}));

const dashboardSvc = jest.requireMock("@/lib/services/dashboard") as Record<string, jest.Mock>;

describe("useDashboardData", () => {
  beforeEach(() => {
    Object.values(dashboardSvc).forEach(fn => fn.mockReset());
  });

  it("faz fetch e transforma dados (sales/finance/health/journey)", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-10T12:00:00Z"));

    dashboardSvc.getDashboardSales.mockResolvedValue([
      {
        status: "approved",
        amount: "100",
        payment_method: "pix",
        created_at: "2026-02-10T10:00:00Z",
      },
      {
        status: "paid",
        amount: "50",
        payment_method: "credit_card",
        created_at: "2026-02-10T11:00:00Z",
      },
      {
        status: "rejected",
        amount: "999",
        payment_method: "boleto",
        created_at: "2026-02-10T11:30:00Z",
      },
      {
        status: "approved",
        amount: "10",
        payment_method: "unknown",
        created_at: "2026-02-10T12:00:00Z",
      },
    ]);
    dashboardSvc.getDashboardFinance.mockResolvedValue({ total_available: "1000", total_pending: "2000" });
    dashboardSvc.getDashboardAccountHealth.mockResolvedValue({
      score: 70,
      chargebacks: 1,
      med: 2,
      reimbursement: 3,
    });
    dashboardSvc.getDashboardAccountJourney.mockResolvedValue({
      total_sales_amount: 5000,
      progress_percentage: 33.333,
    });

    const { result } = renderHook(() => useDashboardData(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.salesData.grossRevenue).toBe(160);
    expect(result.current.financeData.availableBalance).toBe(1000);
    expect(result.current.financeData.pendingBalance).toBe(2000);
    expect(result.current.healthData.healthScore).toBe(70);
    expect(result.current.journeyData.user.levelName).toBe("Iniciante");
    expect(result.current.journeyData.user.nextLevel).toBe("Avançado");

    jest.useRealTimers();
  });

  it("aplica filtro de data (inclui range invertido)", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-10T12:00:00Z"));

    dashboardSvc.getDashboardSales.mockResolvedValue([
      { status: "approved", amount: "100", payment_method: "pix", created_at: "2026-02-08T10:00:00Z" },
      { status: "approved", amount: "50", payment_method: "pix", created_at: "2026-02-10T10:00:00Z" },
    ]);
    dashboardSvc.getDashboardFinance.mockResolvedValue(null);
    dashboardSvc.getDashboardAccountHealth.mockResolvedValue(null);
    dashboardSvc.getDashboardAccountJourney.mockResolvedValue(null);

    const range = {
      start: new Date(2026, 1, 10),
      end: new Date(2026, 1, 9),
    };

    const { result } = renderHook(() => useDashboardData(range));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Range invertido vira 09..10 => deve incluir apenas venda do dia 10 (50)
    expect(result.current.salesData.grossRevenue).toBe(50);

    jest.useRealTimers();
  });

  it("seta error quando uma dependencia lança erro sincrono", async () => {
    dashboardSvc.getDashboardSales.mockImplementation(() => {
      throw new Error("boom");
    });
    dashboardSvc.getDashboardFinance.mockResolvedValue(null);
    dashboardSvc.getDashboardAccountHealth.mockResolvedValue(null);
    dashboardSvc.getDashboardAccountJourney.mockResolvedValue(null);

    const { result } = renderHook(() => useDashboardData(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toMatch(/boom/i);
  });
});

import { useState, useEffect, useCallback } from "react";
import {
  getDashboardSales,
  getDashboardFinance,
  getDashboardAccountHealth,
  getDashboardAccountJourney,
  DashboardSalesResponse,
  DashboardFinanceResponse,
  DashboardHealthResponse,
  DashboardJourneyResponse,
  RawSaleItem
} from "@/lib/services/dashboard";
import mockData from "@/data/mockData.json";

interface UseDashboardDataReturn {
  salesData: DashboardSalesResponse;
  financeData: DashboardFinanceResponse;
  healthData: DashboardHealthResponse;
  journeyData: DashboardJourneyResponse;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type DateRange = { start: Date; end: Date };
type NormalizedRange = { start: Date; end: Date };

const normalizeRange = (range?: DateRange | null): NormalizedRange | null => {
  if (!range) return null;
  const start = new Date(range.start);
  const end = new Date(range.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  if (end.getTime() < start.getTime()) {
    return { start: end, end: start };
  }
  return { start, end };
};

const isWithinRange = (date: Date, range: NormalizedRange) => {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
};

const isApprovedStatus = (status?: string | null) => {
  const normalized = (status ?? "").toString().trim().toLowerCase();
  if (!normalized) return false;
  return [
    "approved",
    "aprovado",
    "paid",
    "pago",
    "completed",
    "complete",
    "success",
    "successful"
  ].includes(normalized);
};

// Helper to generate 00:00 to 23:00 buckets
const generateHourlyBuckets = () => {
  const buckets: Record<string, number> = {};
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ":00";
    buckets[hour] = 0;
  }
  return buckets;
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const formatMonthLabel = (date: Date) => {
  const raw = date.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const formatDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const safeDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildSeries = (salesList: RawSaleItem[], range?: NormalizedRange | null) => {
  type Aggregate = { total: number; count: number; date: number };
  const dailyMap = new Map<string, Aggregate>();
  const monthlyMap = new Map<string, Aggregate>();
  const yearlyMap = new Map<string, Aggregate>();

  const saleDates = salesList
    .map(sale => safeDate(sale.sale_date || sale.created_at))
    .filter((date): date is Date => !!date);

  salesList.forEach(sale => {
    const date = safeDate(sale.sale_date || sale.created_at);
    if (!date) return;
    const amount = Number(sale.amount ?? 0) || 0;
    const dayKey = formatDayKey(date);
    const monthKey = formatMonthKey(date);
    const yearKey = date.getFullYear().toString();

    const update = (map: Map<string, Aggregate>, key: string, sortDate: number) => {
      const current = map.get(key) ?? { total: 0, count: 0, date: sortDate };
      map.set(key, {
        total: current.total + amount,
        count: current.count + 1,
        date: Math.min(current.date, sortDate)
      });
    };

    update(dailyMap, dayKey, date.getTime());
    update(monthlyMap, monthKey, new Date(date.getFullYear(), date.getMonth(), 1).getTime());
    update(yearlyMap, yearKey, new Date(date.getFullYear(), 0, 1).getTime());
  });

  const sortedDates = [...saleDates].sort((a, b) => a.getTime() - b.getTime());
  const startDateFromSales = sortedDates.length
    ? new Date(sortedDates[0].getFullYear(), sortedDates[0].getMonth(), sortedDates[0].getDate())
    : null;
  const endDateFromSales = sortedDates.length
    ? new Date(
        sortedDates[sortedDates.length - 1].getFullYear(),
        sortedDates[sortedDates.length - 1].getMonth(),
        sortedDates[sortedDates.length - 1].getDate()
      )
    : null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const fallbackStart = new Date(todayStart);
  fallbackStart.setDate(fallbackStart.getDate() - 6);

  const rangeStart = range
    ? new Date(range.start.getFullYear(), range.start.getMonth(), range.start.getDate())
    : null;
  const rangeEnd = range
    ? new Date(range.end.getFullYear(), range.end.getMonth(), range.end.getDate())
    : null;

  const resolvedStartDate = rangeStart ?? startDateFromSales ?? fallbackStart;
  const resolvedEndDate = rangeEnd ?? endDateFromSales ?? todayStart;

  const dailyStartDate =
    rangeStart ??
    (startDateFromSales && startDateFromSales.getTime() < fallbackStart.getTime()
      ? startDateFromSales
      : fallbackStart);
  const dailyEndDate =
    rangeEnd ??
    (endDateFromSales && endDateFromSales.getTime() > todayStart.getTime()
      ? endDateFromSales
      : todayStart);

  const buildDailyPoints = () => {
    const points: Array<{
      time: string;
      faturamento: number;
      receitaLiquida: number;
      vendas: number;
      ticketMedio: number;
      chargeback: number;
      reembolso: number;
    }> = [];
    const cursor = new Date(dailyStartDate);
    while (cursor <= dailyEndDate) {
      const label = formatDayLabel(cursor);
      const data = dailyMap.get(formatDayKey(cursor));
      const total = data?.total ?? 0;
      const count = data?.count ?? 0;
      points.push({
        time: label,
        faturamento: total,
        receitaLiquida: total * 0.9,
        vendas: count,
        ticketMedio: count ? total / count : 0,
        chargeback: 0,
        reembolso: 0
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return points;
  };

  const buildMonthlyPoints = () => {
    const startMonth = new Date(resolvedStartDate.getFullYear(), resolvedStartDate.getMonth(), 1);
    const endMonth = new Date(resolvedEndDate.getFullYear(), resolvedEndDate.getMonth(), 1);
    const monthsSpanDifferentYear = startMonth.getFullYear() !== endMonth.getFullYear();
    const points: Array<{
      month: string;
      faturamento: number;
      receitaLiquida: number;
      vendas: number;
      ticketMedio: number;
      chargeback: number;
      reembolso: number;
    }> = [];
    const cursor = new Date(startMonth);
    while (cursor <= endMonth) {
      const labelBase = formatMonthLabel(cursor);
      const label = monthsSpanDifferentYear
        ? `${labelBase}/${cursor.getFullYear().toString().slice(-2)}`
        : labelBase;
      const data = monthlyMap.get(formatMonthKey(cursor));
      const total = data?.total ?? 0;
      const count = data?.count ?? 0;
      points.push({
        month: label,
        faturamento: total,
        receitaLiquida: total * 0.9,
        vendas: count,
        ticketMedio: count ? total / count : 0,
        chargeback: 0,
        reembolso: 0
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return points;
  };

  const buildYearlyPoints = () => {
    const startYear = resolvedStartDate.getFullYear();
    const endYear = resolvedEndDate.getFullYear();
    const points: Array<{
      year: string;
      faturamento: number;
      receitaLiquida: number;
      vendas: number;
      ticketMedio: number;
      chargeback: number;
      reembolso: number;
    }> = [];
    for (let year = startYear; year <= endYear; year += 1) {
      const label = year.toString();
      const data = yearlyMap.get(label);
      const total = data?.total ?? 0;
      const count = data?.count ?? 0;
      points.push({
        year: label,
        faturamento: total,
        receitaLiquida: total * 0.9,
        vendas: count,
        ticketMedio: count ? total / count : 0,
        chargeback: 0,
        reembolso: 0
      });
    }
    return points;
  };

  return {
    daily: buildDailyPoints(),
    monthly: buildMonthlyPoints(),
    yearly: buildYearlyPoints()
  };
};

// Revenue Milestones
const LEVELS = [
  { id: 'avancado', name: 'Avançado', threshold: 10000 },
  { id: 'expert', name: 'Expert', threshold: 100000 },
  { id: 'prata', name: 'Prata', threshold: 500000 }
];

export function useDashboardData(dateRange?: DateRange | null): UseDashboardDataReturn {
  // Initialize with mock data structure (safe fallbacks)
  const [salesData, setSalesData] = useState<DashboardSalesResponse>(
    mockData.revenue as unknown as DashboardSalesResponse
  );
  const [financeData, setFinanceData] = useState<DashboardFinanceResponse>({
    availableBalance: mockData.account.availableBalance,
    pendingBalance: mockData.account.pendingBalance,
    paymentMethods: mockData.paymentMethods as unknown as DashboardFinanceResponse["paymentMethods"]
  });
  const [healthData, setHealthData] = useState<DashboardHealthResponse>({
    healthScore: mockData.account.healthScore,
    healthDetails: mockData.account.healthDetails
  });
  const [journeyData, setJourneyData] = useState<DashboardJourneyResponse>({
    user: { ...(mockData.user as unknown as DashboardJourneyResponse["user"]), levelName: "Iniciante" },
    levels: (mockData.levels as unknown[]).map((l: unknown) => {
      const lvl = l as { id: string; name: string; threshold: number; color: string };
      return { ...lvl, unlocked: false };
    })
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔁 [useDashboardData] Fetching dashboard data...');
      
      const [sales, finance, health, journey] = await Promise.all([
        getDashboardSales().catch(err => {
          console.error("Failed to fetch sales", err);
          return [] as RawSaleItem[]; // Return empty array on error
        }),
        getDashboardFinance().catch(err => {
          console.error("Failed to fetch finance", err);
          return null;
        }),
        getDashboardAccountHealth().catch(err => {
          console.error("Failed to fetch health", err);
          return null;
        }),
        getDashboardAccountJourney().catch(err => {
          console.error("Failed to fetch journey", err);
          return null;
        })
      ]);

      console.log("✅ [useDashboardData] Raw API Responses:", { sales, finance, health, journey });

      // --- Transform Sales Data ---
      const normalizedRange = normalizeRange(dateRange);
      const salesList = Array.isArray(sales) ? sales : [];
      const approvedSales = salesList.filter(sale => isApprovedStatus(sale.status));
      const filteredSales = normalizedRange
        ? approvedSales.filter(sale => {
            const saleDate = safeDate(sale.sale_date || sale.created_at);
            if (!saleDate) return false;
            return isWithinRange(saleDate, normalizedRange);
          })
        : approvedSales;

      const grossRevenue = filteredSales.reduce(
        (acc, item) => acc + (parseFloat(item.amount) || 0),
        0
      );

      // Mock growth for now (or calculate if enough history)
      const growthPercentage = 20.3;
      const { daily, monthly, yearly } = buildSeries(filteredSales, normalizedRange);

      // Transform for charts (Daily/Monthly/Yearly)
      setSalesData(prev => ({
        ...prev,
        grossRevenue,
        growthPercentage,
        daily,
        monthly,
        yearly
      }));

      // --- Transform Finance Data ---
      if (finance) {
        // Calculate Balances 
        const calcAvailable = Number(finance.total_available ?? 0);
        const calcPending = Number(finance.total_pending ?? 0);

        // --- Calculate Payment Methods from SALES (as requested) ---
        const salesList = filteredSales;
        
        const methodMap: Record<string, string> = {
          'credit_card': 'credit_card', 
          'pix': 'pix',
          'boleto': 'boleto'
        };

        const methodStats: Record<string, { totalValue: number, count: number, dataPoints: Record<string, number> }> = {
          'credit_card': { totalValue: 0, count: 0, dataPoints: generateHourlyBuckets() },
          'pix': { totalValue: 0, count: 0, dataPoints: generateHourlyBuckets() },
          'boleto': { totalValue: 0, count: 0, dataPoints: generateHourlyBuckets() }
        };

        let totalCount = 0;

        salesList.forEach(sale => {
          const methodId = methodMap[sale.payment_method] || 'outros';
          if (methodStats[methodId]) {
            const amount = parseFloat(sale.amount) || 0;
            methodStats[methodId].totalValue += amount;
            methodStats[methodId].count += 1;
            totalCount += 1;

            if (sale.created_at) {
              const date = new Date(sale.created_at);
              const hourKey = `${date.getHours().toString().padStart(2, '0')}:00`;
              if (methodStats[methodId].dataPoints[hourKey] !== undefined) {
                 methodStats[methodId].dataPoints[hourKey] += amount;
              }
            }
          }
        });

        const realPaymentMethods = (mockData.paymentMethods as unknown[]).map((baseMethod: unknown) => {
          const methodObj = baseMethod as { id: string, data: { time: string, value: number }[] };
          const id = methodObj.id;
          const stats = methodStats[id] || { totalValue: 0, count: 0, dataPoints: generateHourlyBuckets() };
          
          let percentage = 0;
          if (totalCount > 0) {
            percentage = parseFloat(((stats.count / totalCount) * 100).toFixed(1));
          }

          const sortedTimes = Object.keys(stats.dataPoints).sort();
          const chartData = sortedTimes.map(time => ({
            time,
            value: stats.dataPoints[time]
          }));

          return {
            ...methodObj,
            percentage,
            data: chartData
          };
        });

        setFinanceData(prev => ({
          ...prev,
          availableBalance: calcAvailable, 
          pendingBalance: calcPending,
          paymentMethods: realPaymentMethods as unknown as DashboardFinanceResponse["paymentMethods"]
        }));
      }

      // --- Transform Health Data ---
      if (health) {
        setHealthData({
          healthScore: health.score,
          healthDetails: [
            { label: "Chargeback", percentage: health.chargebacks },
            { label: "MED", percentage: health.med },
            { label: "Reembolso", percentage: health.reimbursement }
          ]
        });
      }

      // --- Transform Journey Data ---
      if (journey) {
        const totalSales = journey.total_sales_amount || 0;
        const resolveLevel = (value: number) => {
          if (value < 10000) {
            return { id: "iniciante", name: "Iniciante", next: LEVELS[0] };
          }
          if (value < 100000) {
            return { id: LEVELS[0].id, name: LEVELS[0].name, next: LEVELS[1] };
          }
          if (value < 500000) {
            return { id: LEVELS[1].id, name: LEVELS[1].name, next: LEVELS[2] };
          }
          return { id: LEVELS[2].id, name: LEVELS[2].name, next: null };
        };
        const resolvedLevel = resolveLevel(totalSales);
        
        // Calculate Level based on Revenue Rules
        let nextLevel = LEVELS[0]; // Default to first level
        
        // Find current level logic: highest threshold passed
        // If sales < 10k: current is null (Iniciante), next is Avançado (10k)
        // If sales > 10k: current is Avançado, next is Expert
        // If sales > 100k: current is Expert, next is Prata
        
        for (let i = 0; i < LEVELS.length; i++) {
          if (totalSales >= LEVELS[i].threshold) {
             nextLevel = LEVELS[i + 1] || null; // Null if max level reached
          } else {
             // First level we have NOT passed is the next level
             nextLevel = LEVELS[i];
             break;
          }
        }

        let progress = 0;
        if (nextLevel) {
           // Calculate progress relative to the NEXT threshold
           // Simple percentage: (Total / Target) * 100
           // Clamp at 100 if something weird happens
           progress = Math.min((totalSales / nextLevel.threshold) * 100, 100);
           
           // If we want range-based progress (e.g. 0% of THAT level to next):
           // const prevThreshold = 0;
           // progress = ((totalSales - prevThreshold) / (nextLevel.threshold - prevThreshold)) * 100;
           // But 'Total Sales' usually implies cumulative from 0. The UI shows "R$ 150 / 10k".
           // So simple division is correct for the UI context.
        } else {
           // Max level
           progress = 100;
        }

        // Calculate unlocked status for each level
        const processedLevels = (mockData.levels as unknown[]).map((level: unknown) => {
          const lvl = level as { id: string; name: string; threshold: number; color: string };
          return {
            ...lvl,
            unlocked: totalSales >= lvl.threshold
          };
        });

        setJourneyData(prev => ({
          ...prev,
          user: {
            ...prev.user,
            level: resolvedLevel.id,
            levelName: resolvedLevel.name,
            nextLevel: resolvedLevel.next?.name || "Max Level",
            progress: Number.isFinite(journey.progress_percentage)
              ? parseFloat(journey.progress_percentage.toFixed(1))
              : parseFloat(progress.toFixed(1))
          },
          levels: processedLevels
        }));
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      console.error('❌ [useDashboardData] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    salesData,
    financeData,
    healthData,
    journeyData,
    isLoading,
    error,
    refetch: fetchData
  };
}

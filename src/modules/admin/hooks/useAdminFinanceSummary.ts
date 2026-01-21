import { useState, useEffect, useCallback } from 'react';
import { adminFinanceApi } from '@/modules/admin/requests';
import type { AdminFinanceSummary } from '@/modules/admin/types';

interface UseAdminFinanceSummaryParams {
  startDate?: string;
  endDate?: string;
}

export function useAdminFinanceSummary(params?: UseAdminFinanceSummaryParams) {
  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminFinanceApi.getSummary(params);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching finance summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch finance summary');
    } finally {
      setIsLoading(false);
    }
  }, [params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refetch: fetchSummary,
  };
}

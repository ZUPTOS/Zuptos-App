import { useState, useEffect, useCallback } from 'react';
import { adminFinanceApi } from '@/modules/admin/requests';
import type { AdminFinanceListParams, AdminFinanceListResponse } from '@/modules/admin/types';

export function useAdminFinanceList(params?: AdminFinanceListParams) {
  const [data, setData] = useState<AdminFinanceListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFinances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminFinanceApi.listFinances(params);
      setData(response);
    } catch (err) {
      console.error('Error fetching finance list:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch finance list');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchFinances();
  }, [fetchFinances]);

  return {
    finances: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    isLoading,
    error,
    refetch: fetchFinances,
  };
}

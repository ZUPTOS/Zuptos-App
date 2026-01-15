import { useState, useCallback } from 'react';
import { financesApi } from '@/lib/api';
import type { CreateWithdrawRequest } from '@/lib/api-types';

interface UseWithdrawHistoryReturn {
  withdrawals: unknown[];
  isLoading: boolean;
  error: string | null;
  fetchWithdrawHistory: (params?: { page?: number; limit?: number }) => Promise<void>;
  createWithdraw: (data: CreateWithdrawRequest) => Promise<unknown>;
  cancelWithdraw: (id: string) => Promise<void>;
}

export function useWithdrawHistory(): UseWithdrawHistoryReturn {
  const [withdrawals, setWithdrawals] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawHistory = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useWithdrawHistory] Fetching withdraw history...', params);
      const data = await financesApi.getWithdrawHistory(params);
      console.log('✅ [useWithdrawHistory] Withdraw history received:', data);
      
      setWithdrawals(data.withdrawals ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar histórico de saques';
      console.error('❌ [useWithdrawHistory] Error:', err);
      setError(errorMessage);
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWithdraw = useCallback(async (data: CreateWithdrawRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useWithdrawHistory] Creating withdraw request...', data);
      const result = await financesApi.createWithdraw(data);
      console.log('✅ [useWithdrawHistory] Withdraw created:', result);
      
      // Refetch history after creating
      await fetchWithdrawHistory();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar solicitação de saque';
      console.error('❌ [useWithdrawHistory] Create error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithdrawHistory]);

  const cancelWithdraw = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🔁 [useWithdrawHistory] Cancelling withdraw ${id}...`);
      await financesApi.cancelWithdraw(id);
      console.log('✅ [useWithdrawHistory] Withdraw cancelled');
      
      // Refetch history after cancelling
      await fetchWithdrawHistory();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar saque';
      console.error('❌ [useWithdrawHistory] Cancel error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithdrawHistory]);

  return {
    withdrawals,
    isLoading,
    error,
    fetchWithdrawHistory,
    createWithdraw,
    cancelWithdraw,
  };
}

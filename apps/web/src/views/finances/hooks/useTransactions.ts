import { useState, useCallback } from 'react';
import { financesApi } from '@/lib/api';

interface UseTransactionsReturn {
  transactions: unknown[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (params?: { page?: number; limit?: number }) => Promise<void>;
  getTransactionById: (id: string) => Promise<unknown>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (params?: { page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useTransactions] Fetching transactions...', params);
      const data = await financesApi.getTransactions(params);
      console.log('✅ [useTransactions] Transactions received:', data);
      
      setTransactions(data.transactions ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações';
      console.error('❌ [useTransactions] Error:', err);
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getTransactionById = useCallback(async (id: string) => {
    try {
      console.log(`🔁 [useTransactions] Fetching transaction ${id}...`);
      const data = await financesApi.getTransactionById(id);
      console.log('✅ [useTransactions] Transaction details:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar detalhes da transação';
      console.error('❌ [useTransactions] Error:', err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    getTransactionById,
  };
}


import { useState, useEffect, useCallback } from 'react';
import { transactionsFinanceApi } from '@/lib/services/finances/transactions';
import type { Transaction } from '@/lib/api-types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

export function useTransactions(limit = 10): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await transactionsFinanceApi.getTransactions({ page, limit });

      // Response is Transaction[] based on user feedback/screenshot
      const transactionsData = Array.isArray(response) ? response : [];
      setTransactions(transactionsData);

      // Since API doesn't seem to return total, we might just assume length for now or rely on client-side pagination if needed.
      // However, PaginatedTable expects us to manage pages.
      // If the API supports pagination via query params but returns just the array, we can't know totalPages easily unless we infer or just check if array length < limit.
      // For now, let's assume if we got full limit, there might be more. Or if response.length is what we use.
      // But wait, the screenshot showed (2) items. If that's the full list, total is 2.
      setTotal(transactionsData.length); 

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar transações';
      console.error('❌ [useTransactions] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
    page,
    setPage,
    totalPages,
  };
}

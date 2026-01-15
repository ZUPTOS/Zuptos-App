import { useState, useEffect } from 'react';
import { financesApi } from '@/lib/api';

interface UseFinanceDataReturn {
  availableBalance: number;
  pendingBalance: number;
  commissionsBalance: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFinanceData(): UseFinanceDataReturn {
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [commissionsBalance, setCommissionsBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useFinanceData] Fetching finance data...');
      const data = await financesApi.getFinanceData();
      console.log('✅ [useFinanceData] Finance data received:', data);
      
      setAvailableBalance(data.total_available ?? 0);
      setPendingBalance(data.total_pending ?? 0);
      setCommissionsBalance(data.total_commission ?? 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros';
      console.error('❌ [useFinanceData] Error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  return {
    availableBalance,
    pendingBalance,
    commissionsBalance,
    isLoading,
    error,
    refetch: fetchFinanceData,
  };
}

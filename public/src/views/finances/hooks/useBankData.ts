import { useState, useEffect } from 'react';
import { financesApi } from '@/lib/api';
import type { BankDataResponse } from '@/lib/api-types';

interface BankInfo {
  bank?: string;
  accountType?: string;
  pixKey?: string;
  bankCode?: string;
  bankName?: string;
  bank_institution?: string;
  account_type?: string;
  account_key?: string;
}

interface UseBankDataReturn {
  bankInfo: BankInfo | null;
  hasBankAccount: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateBankData: (data: Partial<BankDataResponse>) => Promise<void>;
}

export function useBankData(): UseBankDataReturn {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useBankData] Fetching bank data...');
      const data = await financesApi.getBankData();
      console.log('✅ [useBankData] Bank data received:', data);
      
      // Check for valid bank data (either old format or new format)
      // New format: bank_institution, account_key (value), account_type
      // Old format: bank_name, pix_key, account_type
      const hasData = !!(
        data && (
          (data.bank_institution && data.account_key) || 
          (data.bank_name && (data.pix_key || data.account_key))
        )
      );

      if (data && hasData) {
        setHasBankAccount(true);
        setBankInfo({
          // Display format: "077 - Banco Inter" or just "NuBank"
          bank: data.bank_institution || (data.bank_name ? `${data.bank_code || ''} - ${data.bank_name}` : undefined),
          
          // Type of account: "CPF", "RANDOM_KEY", etc.
          accountType: data.account_type,
          
          // The actual Pix key value
          pixKey: data.account_key || data.pix_key, 
          
          // Raw fields for flexibility
          bankCode: data.bank_code,
          bankName: data.bank_name,
          bank_institution: data.bank_institution,
          account_type: data.account_type,
          account_key: data.account_key,
        });
      } else {
        setHasBankAccount(false);
        setBankInfo(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados bancários';
      console.error('❌ [useBankData] Error:', err);
      setError(errorMessage);
      setHasBankAccount(false);
      setBankInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBankData = async (data: Partial<BankDataResponse>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔁 [useBankData] Updating bank data...');
      await financesApi.updateBankData(data);
      console.log('✅ [useBankData] Bank data updated successfully');
      
      // Refetch data after update
      await fetchBankData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar dados bancários';
      console.error('❌ [useBankData] Update error:', err);
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchBankData();
  }, []);

  return {
    bankInfo,
    hasBankAccount,
    isLoading,
    error,
    refetch: fetchBankData,
    updateBankData,
  };
}

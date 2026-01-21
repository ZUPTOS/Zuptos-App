// Admin Finance Types
export interface AdminFinanceSummary {
  totalTransacted: number;
  grossRevenue: number;
  netRevenue: number;
  transactionFeeRevenue: {
    gross: number;
    net: number;
  };
  withdrawalFeeRevenue: {
    gross: number;
    net: number;
  };
  availableBalance: number;
  period?: {
    start: string;
    end: string;
  };
}

export interface AdminFinanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  type: 'transaction' | 'withdrawal';
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
  created_at: string;
  updated_at?: string;
  description?: string;
  payment_method?: string;
  transaction_id?: string;
}

export interface AdminFinanceListParams {
  page?: number;
  limit?: number;
  userId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'transaction' | 'withdrawal';
  status?: string;
}

export interface AdminFinanceListResponse {
  data: AdminFinanceRecord[];
  total: number;
  page: number;
  limit: number;
}

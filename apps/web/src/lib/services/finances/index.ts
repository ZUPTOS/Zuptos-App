import { baseFinanceApi } from "./base";
import { bankFinanceApi } from "./bank";
import { transactionsFinanceApi } from "./transactions";
import { withdrawFinanceApi } from "./withdraw";

export { baseFinanceApi, bankFinanceApi, transactionsFinanceApi, withdrawFinanceApi };

// Consolidated API object for convenience
export const financesApi = {
  getFinanceData: baseFinanceApi.getFinanceData,
  getBankData: bankFinanceApi.getBankData,
  updateBankData: bankFinanceApi.updateBankData,
  getTransactions: transactionsFinanceApi.getTransactions,
  getTransactionById: transactionsFinanceApi.getTransactionById,
  getWithdrawHistory: withdrawFinanceApi.getWithdrawHistory,
  createWithdraw: withdrawFinanceApi.createWithdraw,
  cancelWithdraw: withdrawFinanceApi.cancelWithdraw,
};

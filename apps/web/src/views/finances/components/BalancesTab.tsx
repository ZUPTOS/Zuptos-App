'use client';

import { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { useBankData } from '../hooks/useBankData';
import { formatCurrency } from '@/lib/utils/currency';
import { X, Landmark } from 'lucide-react';
import { AccountTypePix } from '@/lib/api-types';
import { WithdrawModal } from './WithdrawModal';

const balanceCardDescription = "Este é o valor do seu saldo disponível mais o saldo pendente da reserva financeira.";

const mockBankData = {
  bank: "077 - Banco Inter S.A.",
  accountType: "Conta PJ",
  pixKey: "xxxxxxxxxxxxxxx"
};

// Skeleton Component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);

export default function BalancesTab() {
  const { availableBalance, pendingBalance, commissionsBalance, isLoading: isLoadingFinance } = useFinanceData();
  const { bankInfo, hasBankAccount, isLoading: isLoadingBank, updateBankData, refetch } = useBankData();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  
  // Form states
  const [bankInstitution, setBankInstitution] = useState('');
  const [accountKey, setAccountKey] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLoading = isLoadingFinance || isLoadingBank;

  const handleSubmitBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!bankInstitution || !accountKey || !pixKey) {
      setSubmitError('Todos os campos são obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await updateBankData({
        bank_institution: bankInstitution,
        account_key: pixKey, // Value (e.g. 123...)
        account_type: accountKey, // Type (e.g. CPF)
      });
      
      // Reset form and close modal
      setBankInstitution('');
      setAccountKey('');
      setPixKey('');
      setShowAccountForm(false);
      
      // Refetch bank data to update UI
      await refetch();
    } catch (error) {
      console.error('Error submitting bank account:', error);
      setSubmitError(error instanceof Error ? error.message : 'Erro ao cadastrar conta bancária');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeAccountForm = () => {
    setShowAccountForm(false);
    setBankInstitution('');
    setAccountKey('');
    setPixKey('');
    setSubmitError(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 lg:gap-4 xl:grid-cols-[508px_521px] xl:gap-[10px] 2xl:grid-cols-[608px_621px] 2xl:justify-center 2xl:gap-[10px]">
        {/* Saldo Disponível */}
        <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-4 sm:p-5 min-h-[180px] md:min-h-[200px] lg:h-[245px]">
          <p className="text-sm sm:text-fs-title font-semibold text-primary">Saldo Disponível</p>
          <div className="mt-2 text-2xl sm:text-fs-display font-semibold text-foreground">
            {isLoading ? (
              <Skeleton className="h-8 sm:h-10 w-40 sm:w-48" />
            ) : (
              formatCurrency(availableBalance)
            )}
          </div>
          <p className="mt-3 text-xs sm:text-fs-stat text-muted-foreground">
            {balanceCardDescription}
          </p>
        </div>

        {/* Conta Bancária Principal */}
        <div className="flex h-full w-full flex-col justify-center gap-4 rounded-[16px] border border-muted bg-card/70 p-4 sm:p-5 min-h-[180px] md:min-h-[200px] lg:h-[245px]">
          <p className="text-sm sm:text-fs-title font-semibold text-primary">Conta Bancária Principal</p>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-full" />
                <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-full" />
                <Skeleton className="h-5 sm:h-6 w-48 sm:w-64" />
              </div>
              <Skeleton className="h-[44px] sm:h-[49px] w-full sm:w-[231px] rounded-[10px]" />
            </div>
          ) : hasBankAccount ? (
              <div className="flex flex-col gap-4 sm:gap-6">
              <div className="space-y-3">
                {/* Bank Info Row */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Landmark className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="text-sm sm:text-lg font-bold text-white truncate">
                      {bankInfo?.bank || bankInfo?.bank_institution || mockBankData.bank}
                    </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                      {bankInfo?.accountType === 'RANDOM_KEY' ? 'Chave Aleatória' : (bankInfo?.accountType || mockBankData.accountType)}
                    </span>
                  </div>
                </div>

                {/* Pix Key Row */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center flex-shrink-0">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rotate-45 bg-gray-400" /> 
                  </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 min-w-0">
                    <span>Chave PIX:</span>
                      <span className="text-white truncate">
                      {bankInfo?.pixKey || bankInfo?.account_key || mockBankData.pixKey}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(true)}
                  className="flex h-[44px] sm:h-[48px] w-full sm:w-[200px] items-center justify-center gap-2 rounded-lg bg-[#6C27D7] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#5b21b6] touch-manipulation"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <span className="text-xs font-bold">$</span>
                </div>
                Solicitar saque
              </button>
            </div>
          ) : (
                <div className="space-y-4 text-xs sm:text-fs-stat text-foreground">
                  <p className="text-xs sm:text-fs-stat text-muted-foreground">
                Nenhuma conta bancária cadastrada. Configure uma conta para realizar saques.
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAccountForm(true)}
                      className="inline-flex h-[44px] sm:h-[49px] w-full sm:w-[231px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 text-sm font-semibold text-white hover:brightness-110 touch-manipulation"
                >
                  Adicionar conta bancária
                </button>

                    {/* Bank Account Form - Responsive Modal */}
                {showAccountForm && (
                  <>
                    <div 
                          className="fixed inset-0 z-40 bg-black/50" 
                      onClick={closeAccountForm}
                    />
                    <div 
                          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] rounded-2xl bg-[#1a1a1a] p-4 sm:p-6 shadow-2xl transition-all duration-300 ease-out max-h-[90vh] overflow-y-auto ${
                        showAccountForm 
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-white">
                          Configurar conta bancária
                        </h2>
                        <button
                          type="button"
                          onClick={closeAccountForm}
                          className="text-gray-400 transition-colors hover:text-white"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <form onSubmit={handleSubmitBankAccount} className="space-y-6">
                        {submitError && (
                          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {submitError}
                          </div>
                        )}

                        {/* Informações do titular */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white">
                            Informações do titular
                          </h3>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                              Instituição bancária
                            </label>
                            <input
                              type="text"
                              value={bankInstitution}
                              onChange={(e) => setBankInstitution(e.target.value)}
                              placeholder="Selecione o banco"
                              className="w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              required
                            />
                          </div>
                        </div>

                        {/* Chave pix */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-white">
                            Chave pix
                          </h3>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                              Tipo de chave PIX
                            </label>
                            <select
                              value={accountKey}
                              onChange={(e) => setAccountKey(e.target.value)}
                              className="w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 appearance-none"
                              required
                            >
                              <option value="" disabled>Selecione o tipo de chave PIX</option>
                              {Object.values(AccountTypePix).map((type) => (
                                <option key={type} value={type}>
                                  {type === 'RANDOM_KEY' ? 'Chave Aleatória' : type}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm text-gray-300">
                              Chave PIX
                            </label>
                            <input
                              type="text"
                              value={pixKey}
                              onChange={(e) => setPixKey(e.target.value)}
                              placeholder="Chave PIX"
                              className="w-full rounded-lg border border-gray-700 bg-[#0a0a0a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              required
                            />
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={closeAccountForm}
                            className="flex-1 rounded-lg border border-gray-700 bg-transparent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                            disabled={isSubmitting}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Salvando...' : 'Adicionar conta'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saldo Pendente */}
        <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
          <p className="text-fs-title font-semibold text-foreground">Saldo pendente</p>
          <div className="mt-2 text-fs-display font-semibold text-foreground">
            {isLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              formatCurrency(pendingBalance)
            )}
          </div>
        </div>

        {/* Comissões a Receber */}
        <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
          <div className="flex items-center justify-between">
            <p className="text-fs-title font-semibold text-foreground">Comissões a receber</p>
          </div>
          <div className="mt-2 text-fs-display font-semibold text-foreground">
            {isLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              formatCurrency(commissionsBalance)
            )}
          </div>
        </div>
      </div>
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableBalance={availableBalance}
        bankInfo={bankInfo}
        onSuccess={() => {
          refetch(); // Refetch finance data to update balance
        }}
      />
    </>
  );
}

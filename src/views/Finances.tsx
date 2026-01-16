'use client';

import { useState } from 'react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import BalancesTab from './finances/components/BalancesTab';
import TransactionsTab from './finances/components/TransactionsTab';
import WithdrawHistoryTab from './finances/components/WithdrawHistoryTab';
import FeesTab from './finances/components/FeesTab';

const tabs = [
  { id: 'saldos', label: 'Saldos' },
  { id: 'transacoes', label: 'Transações' },
  { id: 'saques', label: 'Histórico de saques' },
  { id: 'taxas', label: 'Taxas' },
];

export default function Finances() {
  const [activeTab, setActiveTab] = useState<string>('saldos');

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Finanças">
      <div className="min-h-full py-6">
        <div className="mx-auto 2xl:justify-center 2xl:w-[1250px] flex w-full flex-col gap-6 xl:justify-center xl:w-[1000px]">
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-6 border-b border-muted/30 pb-1 text-base font-semibold">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-2 transition-colors ${
                    isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-card-foreground'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 h-[3px] w-full rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'saldos' && <BalancesTab />}
          {activeTab === 'transacoes' && <TransactionsTab />}
          {activeTab === 'saques' && <WithdrawHistoryTab />}
          {activeTab === 'taxas' && <FeesTab />}
        </div>
      </div>
    </DashboardLayout>
  );
}

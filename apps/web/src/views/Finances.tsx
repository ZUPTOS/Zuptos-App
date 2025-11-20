'use client';

import { useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { Banknote, X } from "lucide-react";

const tabs = [
  { id: "saldos", label: "Saldos" },
  { id: "transacoes", label: "Transações" },
  { id: "saques", label: "Histórico de saques" },
  { id: "taxas", label: "Taxas" }
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const balanceCards = [
  {
    id: "disponivel",
    title: "Saldo Disponível",
    description: "Este é o valor do seu saldo disponível mais o saldo pendente da reserva financeira.",
    value: 8759.98
  },
  {
    id: "pendente",
    title: "Saldo pendente",
    value: 8759.98
  },
  {
    id: "conta",
    title: "Conta Bancária Principal",
    bank: "077 - Banco Inter S.A.",
    accountType: "Conta PJ",
    pixKey: "xxxxxxxxxxxxxxx"
  },
  {
    id: "comissoes",
    title: "Comissões a receber",
    value: 8759.98
  }
];

export default function Finances() {
  const [activeTab, setActiveTab] = useState<string>("saldos");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Finanças">
      <div className="min-h-full py-6">
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 md:px-6">

          <div className="flex flex-wrap items-center gap-6 border-b border-muted/30 pb-1 text-base font-semibold">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-2 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-card-foreground"
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

          {activeTab === "saldos" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[708px_721px] lg:justify-between lg:gap-[10px]">
              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[245px]">
                <p className="text-[24px] font-semibold text-primary">Saldo Disponível</p>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[0].value)}
                </p>
                <p className="mt-3 text-[19px] text-muted-foreground">
                  {balanceCards[0].description}
                </p>
              </div>

              <div className="flex h-full w-full flex-col justify-center gap-4 rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[245px]">
                <p className="text-[24px] font-semibold text-primary">Conta Bancária Principal</p>
                {hasBankAccount ? (
                  <>
                    <div className="space-y-2 text-[19px] text-foreground">
                      <div className="flex items-center gap-2 font-semibold">
                        <Image src="/images/ICON-4.svg" alt="" width={28} height={28} className="h-7 w-7" />
                        {balanceCards[2].bank} <span className="text-muted-foreground"> {balanceCards[2].accountType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Image src="/images/pix.svg" alt="Ícone Pix" width={30} height={30} className="h-[30px] w-[30px]" />
                        Chave PIX: {balanceCards[2].pixKey}
                      </div>
                    </div>
                    <div className="relative flex">
                      <button
                        type="button"
                        onClick={() => setIsWithdrawOpen(true)}
                        className="inline-flex h-[49px] w-[231px] items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      >
                        Solicitar saque
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 text-[19px] text-foreground">
                    <p className="text-[19px] text-muted-foreground">
                      Nenhuma conta bancária cadastrada. Configure uma conta para realizar saques.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAccountForm(true)}
                      className="inline-flex h-[49px] w-[231px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      Adicionar conta bancária
                    </button>
                  </div>
                )}
              </div>

              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
                <p className="text-[24px] font-semibold text-foreground">Saldo pendente</p>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[1].value)}
                </p>
              </div>

              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
                <div className="flex items-center justify-between">
                  <p className="text-[24px] font-semibold text-foreground">Comissões a receber</p>
                  <Banknote className="h-5 w-5 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-2 text-[34px] font-semibold text-foreground">
                  {formatCurrency(balanceCards[3].value)}
                </p>
              </div>
            </div>
          )}

          {activeTab !== "saldos" && (
            <div className="rounded-[16px] border border-dashed border-muted/60 bg-card/40 p-6 text-center text-muted-foreground">
              <p className="text-base font-semibold text-card-foreground">Em breve</p>
              <p className="text-sm">Conteúdo da aba {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
      {isWithdrawOpen && hasBankAccount && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setIsWithdrawOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 h-[538px] w-[501px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between border-b border-muted px-5 py-4">
              <p className="text-[23px] font-semibold text-foreground">Solicitar saque</p>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(false)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar modal de saque"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="text-[24px] font-semibold text-foreground">Quanto você quer sacar?</p>
                <input
                  type="text"
                  className="mt-3 h-[49px] w-[447px] rounded-[10px] border border-muted bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex h-[42px] w-[447px] items-center justify-between rounded-[10px] bg-gradient-to-r from-[#2b2b32] via-[#30303a] to-[#2b2b32] px-4 text-[19px] font-semibold text-foreground">
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span>{formatCurrency(balanceCards[0].value)}</span>
              </div>
              <div className="w-[447px] space-y-3 text-[19px] text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Chave pix:</span>
                  <span>------</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valor a sacar:</span>
                  <span>------</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Taxas</span>
                  <span>------</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valor a receber:</span>
                  <span>------</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-2 inline-flex h-[49px] w-[447px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Solicitar
              </button>
            </div>
          </div>
        </>
      )}

      {showAccountForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setShowAccountForm(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 h-[534px] w-[443px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-muted pb-4">
              <p className="text-[24px] font-semibold text-foreground">Configurar conta bancária</p>
              <button
                type="button"
                onClick={() => setShowAccountForm(false)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar configuração de conta"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-8 pt-2 text-[12px]">
              <div className="space-y-2">
                <p className="mb-5 text-[22px] font-semibold text-muted-foreground">Informações do titular</p>
                <label className="flex w-full flex-col gap-3 text-[12px] text-muted-foreground">
                  <span className="text-left">Instituição bancária</span>
                  <select className="h-11 w-full rounded-[10px] border border-muted bg-card px-3 text-left text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <option value="">Selecione o banco</option>
                    <option>Banco Inter</option>
                    <option>Caixa</option>
                    <option>Bradesco</option>
                  </select>
                </label>
              </div>
              <div className="flex space-y-2 items-start flex-col">
                <p className="mb-5 text-[22px] font-semibold text-muted-foreground">Chave pix</p>
                <label className="flex w-full flex-col gap-3 text-[12px] text-muted-foreground">
                  <span className="text-left">Tipo de chave PIX</span>
                  <select className="h-11 w-full rounded-[10px] border border-muted bg-card px-3 text-left text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <option value="">Selecione o tipo de chave PIX</option>
                    <option>CPF/CNPJ</option>
                    <option>E-mail</option>
                    <option>Telefone</option>
                    <option>Chave aleatória</option>
                  </select>
                </label>
                <label className="flex w-full flex-col gap-3 text-[12px] text-muted-foreground">
                  <span className="text-left">Chave PIX</span>
                  <input
                    type="text"
                    className="h-11 w-full rounded-[10px] border border-muted bg-card px-3 text-left text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    placeholder="Chave PIX"
                  />
                </label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAccountForm(false)}
                  className="rounded-[10px] border border-muted bg-card px-4 py-[9px] text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasBankAccount(true);
                    setShowAccountForm(false);
                  }}
                  className="h-[35px] w-[140px] rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-[12px] font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Adicionar conta
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

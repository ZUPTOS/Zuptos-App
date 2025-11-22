'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Calendar,
  Eye,
  Filter,
  Search,
  Upload,
  X
} from "lucide-react";

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

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  date: string;
  time: string;
  balanceAfter: number;
  category: "Venda" | "Estorno" | "MED" | "Chargeback";
  type: "entrada" | "saida";
};

const transactionTabs = [
  { id: "todas", label: "Todas" },
  { id: "entrada", label: "Entradas" },
  { id: "saida", label: "Saídas" }
];

const baseTransactions: Omit<Transaction, "id" | "date" | "time">[] = [
  { title: "Produto 1", subtitle: "Curso", value: 497, balanceAfter: 497, category: "Venda", type: "entrada" },
  { title: "Produto 1", subtitle: "Curso", value: 497, balanceAfter: 0, category: "Estorno", type: "saida" },
  { title: "Produto 2", subtitle: "Mentoria", value: 1297, balanceAfter: 2530, category: "Venda", type: "entrada" },
  { title: "Produto 3", subtitle: "Assinatura", value: 197, balanceAfter: 2333, category: "MED", type: "saida" },
  { title: "Produto 2", subtitle: "Mentoria", value: 1297, balanceAfter: 3630, category: "Venda", type: "entrada" },
  { title: "Produto 1", subtitle: "Curso", value: 497, balanceAfter: 1203, category: "Chargeback", type: "saida" },
  { title: "Produto 4", subtitle: "E-book", value: 97, balanceAfter: 1700, category: "Venda", type: "entrada" },
  { title: "Produto 5", subtitle: "Workshop", value: 297, balanceAfter: 1403, category: "Chargeback", type: "saida" },
  { title: "Produto 2", subtitle: "Mentoria", value: 1297, balanceAfter: 1700, category: "MED", type: "saida" },
  { title: "Produto 6", subtitle: "Licença", value: 697, balanceAfter: 2397, category: "Venda", type: "entrada" }
];

const transactionsMock: Transaction[] = Array.from({ length: 96 }, (_, index) => {
  const base = baseTransactions[index % baseTransactions.length];
  const day = String(((index % 30) + 1)).padStart(2, "0");
  const month = String(6 - Math.floor(index / 30)).padStart(2, "0"); // months decreasing to vary data
  const hour = String(9 + (index % 10)).padStart(2, "0");
  const minute = String(5 + (index % 50)).padStart(2, "0");

  return {
    ...base,
    id: `#TX${String(index + 1).padStart(4, "0")}`,
    date: `${day}/${month}/2025`,
    time: `às ${hour}:${minute}`,
    balanceAfter: base.balanceAfter + (index % 5) * 17 // small variation to avoid identical rows
  };
});

export default function Finances() {
  const [activeTab, setActiveTab] = useState<string>("saldos");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const itemsPerPage = 7;

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredTransactions = transactionsMock.filter(transaction => {
    const matchesFilter =
      transactionFilter === "todas" ? true : transaction.type === transactionFilter;
    const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateRange
      ? (() => {
          const txDate = parseDate(transaction.date);
          return txDate >= dateRange.start && txDate <= dateRange.end;
        })()
      : true;

    return matchesFilter && matchesSearch && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const headerHeight = 52;
  const rowHeight = 85;
  const tableHeight = Math.min(647, headerHeight + rowHeight * Math.max(1, paginatedTransactions.length));

  const paginationItems = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, 2, 3, totalPages - 2, totalPages - 1, totalPages]);
    if (currentPage > 3 && currentPage < totalPages - 2) {
      pages.add(currentPage);
    }

    const sortedPages = Array.from(pages).sort((a, b) => a - b);
    const output: Array<number | string> = [];

    for (let i = 0; i < sortedPages.length; i += 1) {
      const page = sortedPages[i];
      const prevPage = sortedPages[i - 1];
      if (prevPage && page - prevPage > 1) {
        output.push("...");
      }
      output.push(page);
    }

    return output;
  })();

  useEffect(() => {
    setCurrentPage(1);
  }, [transactionFilter, searchTerm]);

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

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
                        className="inline-flex h-[49px] w-[231px] items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-white"
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
                      className="inline-flex h-[49px] w-[231px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 text-sm font-semibold text-white"
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

          {activeTab === "transacoes" && (
            <div className="mx-auto flex w-full max-w-[1280px] flex-col items-stretch gap-4">
              <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {transactionTabs.map(tab => {
                    const isTransactionTabActive = transactionFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTransactionFilter(tab.id)}
                        className={`inline-flex h-[54px] min-w-[96px] items-center justify-center rounded-[10px] px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          isTransactionTabActive
                            ? "bg-card text-foreground"
                            : "bg-card/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-[54px] w-full items-center gap-2 rounded-[10px] border border-muted bg-card px-3 text-sm text-foreground md:w-[227px]">
                    <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                      placeholder="Buscar por código"
                      className="h-full w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="Filtrar transações"
                    onClick={() => setIsFilterOpen(true)}
                    className="flex h-[54px] w-[49px] items-center justify-center rounded-[10px] border border-muted bg-card/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Filter className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Visualizar"
                    className="flex h-[54px] w-[49px] items-center justify-center rounded-[10px] border border-muted bg-card/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Upload de transações"
                    className="flex h-[54px] w-[49px] items-center justify-center rounded-[10px] border border-muted bg-card/70 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div
                className="flex w-[1280px] justify-center overflow-hidden rounded-[16px] border border-muted bg-card/70"
                style={{ height: `${tableHeight}px` }}
              >
                <table className="min-w-[1280px] w-[1280px] border-separate border-spacing-0 text-[15px]">
                  <thead className="bg-card/60 text-[15px] uppercase text-muted-foreground">
                    <tr className="h-[52px]">
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        ID
                      </th>
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        Descrição
                      </th>
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        Valor
                      </th>
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        Data
                      </th>
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        Saldo após lançamento
                      </th>
                      <th scope="col" className="px-5 py-3 text-center font-semibold">
                        Categoria
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                          Nenhuma transação encontrada.
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.map(transaction => (
                        <tr
                          key={transaction.id + transaction.date + transaction.time}
                          className="h-[85px] border-t border-muted/60 transition-colors hover:bg-muted/10"
                        >
                          <td className="px-5 py-4 text-[15px] font-semibold text-foreground text-center">{transaction.id}</td>
                          <td className="px-5 py-4 text-[15px] text-foreground">
                            <div className="flex flex-col items-center space-y-1 text-center">
                              <p className="font-semibold leading-tight">{transaction.title}</p>
                              <p className="text-[15px] text-muted-foreground">{transaction.subtitle}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[15px] font-semibold text-foreground text-center">
                            {formatCurrency(transaction.value)}
                          </td>
                          <td className="px-5 py-4 text-[15px] text-foreground">
                            <div className="flex flex-col items-center leading-tight text-center">
                              <span className="font-semibold">{transaction.date}</span>
                              <span className="text-[15px] text-muted-foreground">{transaction.time}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[15px] text-foreground">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-semibold">{formatCurrency(transaction.balanceAfter)}</span>
                              {transaction.type === "entrada" ? (
                                <ArrowDown className="h-4 w-4 text-emerald-400" aria-label="Entrada" />
                              ) : (
                                <ArrowUp className="h-4 w-4 text-red-400" aria-label="Saída" />
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[15px] text-center">
                            <span
                              className={`inline-flex min-w-[96px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                                transaction.category === "Venda"
                                  ? "bg-emerald-500/15 text-emerald-200"
                                  : transaction.category === "Estorno"
                                    ? "bg-red-500/15 text-red-200"
                                    : transaction.category === "MED"
                                      ? "bg-red-500/15 text-red-200"
                                      : "bg-rose-500/15 text-rose-200"
                              }`}
                            >
                              {transaction.category}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-muted px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mr-2 text-lg leading-none">‹</span>
                  Anterior
                </button>

                <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  {paginationItems.map((item, index) =>
                    typeof item === "string" ? (
                      <span key={`${item}-${index}`} className="px-2 text-muted-foreground">
                        {item}
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`h-8 min-w-[32px] rounded-[8px] px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          currentPage === item
                            ? "bg-primary text-white"
                            : "bg-card/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-muted px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próximo
                  <span className="ml-2 text-lg leading-none">›</span>
                </button>
              </div>
            </div>
          )}

          {activeTab !== "saldos" && activeTab !== "transacoes" && (
            <div className="rounded-[16px] border border-dashed border-muted/60 bg-card/40 p-6 text-center text-muted-foreground">
              <p className="text-base font-semibold text-card-foreground">Em breve</p>
              <p className="text-sm">Conteúdo da aba {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento.</p>
            </div>
          )}
        </div>
      </div>
      {isFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            role="button"
            tabIndex={0}
            aria-label="Fechar modal de filtro (overlay)"
            onClick={() => setIsFilterOpen(false)}
            onKeyDown={event => handleOverlayKeyDown(event, () => setIsFilterOpen(false))}
          />
          <div className="fixed right-0 top-0 z-50 h-screen w-[443px] border-l border-muted bg-card px-6 pb-10 pt-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-[28px] font-semibold text-foreground">Filtrar</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar modal de filtro"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-6 text-[15px] text-foreground">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Data</p>
                <DateFilter
                  onDateChange={(start, end) => {
                    setDateRange({ start, end });
                  }}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Categoria</p>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  {["Venda", "Comissão", "Saque", "Chargeback"].map(option => (
                    <label
                      key={option}
                      className="flex h-11 items-center gap-3 rounded-[10px] px-1 text-[15px]"
                    >
                      <input
                        type="checkbox"
                        className="relative h-[26px] w-[26px] appearance-none rounded border border-muted bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-muted/60 pt-4">
                <p className="text-sm font-semibold text-foreground">Tipo de transação</p>
                <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                  {["Entrada", "Saída"].map(option => (
                    <label
                      key={option}
                      className="flex h-11 items-center gap-3 rounded-[10px] px-1 text-[15px]"
                    >
                      <input
                        type="checkbox"
                        className="relative h-[26px] w-[26px] appearance-none rounded border border-muted bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-[14px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <button
                  type="button"
                  className="inline-flex h-[43px] w-[175px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-sm font-semibold text-white transition-colors hover:brightness-110"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Adicionar filtro
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {isWithdrawOpen && hasBankAccount && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            role="button"
            tabIndex={0}
            aria-label="Fechar overlay do saque"
            onClick={() => setIsWithdrawOpen(false)}
            onKeyDown={event => handleOverlayKeyDown(event, () => setIsWithdrawOpen(false))}
          />
          <div className="fixed left-1/2 top-1/2 z-50 h-[538px] w-[501px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card">
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
              <div
                className="flex h-[42px] w-[447px] items-center justify-between rounded-[10px] px-4 text-[19px] font-semibold text-foreground"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--card)) 0%, hsl(var(--muted)) 50%, hsl(var(--card)) 100%)"
                }}
              >
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
                className="mt-2 inline-flex h-[49px] w-[447px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-sm font-semibold text-white"
              >
                Solicitar
              </button>
            </div>
          </div>
        </>
      )}

      {showAccountForm && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            role="button"
            tabIndex={0}
            aria-label="Fechar modal de conta bancária (overlay)"
            onClick={() => setShowAccountForm(false)}
            onKeyDown={event => handleOverlayKeyDown(event, () => setShowAccountForm(false))}
          />
          <div className="fixed left-1/2 top-1/2 z-50 h-[534px] w-[443px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card p-6">
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
                  className="h-[35px] w-[140px] rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-[12px] font-semibold text-white"
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

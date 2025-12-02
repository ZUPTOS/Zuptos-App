'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import DateFilter from "@/components/DateFilter";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  Eye,
  Filter,
  Search,
  Tag,
  Upload,
  X
} from "lucide-react";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  useEffect(() => {
    const updateRows = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width >= 1900) {
        setRowsPerPage(6);
      } else if (width >= 1600) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(4);
      }
    };
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

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

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  const transactionColumns: Column<Transaction>[] = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        width: "11%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3 text-center text-fs-body font-semibold text-foreground whitespace-nowrap",
        render: transaction => transaction.id
      },
      {
        id: "descricao",
        header: "Descrição",
        width: "23%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3",
        render: transaction => (
          <div className="flex flex-col items-center space-y-1 text-center leading-tight">
            <p className="font-semibold truncate w-full max-w-[180px]">{transaction.title}</p>
            <p className="text-fs-body text-muted-foreground truncate w-full max-w-[180px]">
              {transaction.subtitle}
            </p>
          </div>
        )
      },
      {
        id: "valor",
        header: "Valor",
        width: "14%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3 text-center text-fs-body font-semibold text-foreground whitespace-nowrap",
        render: transaction => formatCurrency(transaction.value)
      },
      {
        id: "data",
        header: "Data",
        width: "14%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3 text-fs-body text-foreground",
        render: transaction => (
          <div className="flex flex-col items-center leading-tight text-center">
            <span className="font-semibold">{transaction.date}</span>
            <span className="text-fs-body text-muted-foreground">{transaction.time}</span>
          </div>
        )
      },
      {
        id: "saldo",
        header: "Saldo após lançamento",
        width: "20%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3 text-fs-body text-foreground",
        render: transaction => (
          <div className="flex items-center justify-center gap-2 leading-tight">
            <span className="font-semibold">{formatCurrency(transaction.balanceAfter)}</span>
            {transaction.type === "entrada" ? (
              <ArrowDown className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Entrada" />
            ) : (
              <ArrowUp className="h-4 w-4 shrink-0 text-red-400" aria-label="Saída" />
            )}
          </div>
        )
      },
      {
        id: "categoria",
        header: "Categoria",
        width: "18%",
        headerClassName: "text-center",
        cellClassName: "px-3 py-3 text-center",
        render: transaction => (
          <span
            className={`inline-flex min-w-[72px] items-center justify-center rounded-full px-2 py-[6px] text-[10px] font-semibold leading-tight ${
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
        )
      }
    ],
    []
  );

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Finanças">
      <div className="min-h-full py-6">
        <div className="mx-auto 2xl:justify-center 2xl:w-[1250px] flex w-full flex-col gap-6 xl:justify-center xl:w-[1000px]">
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
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[608px_621px] 2xl:justify-center 2xl:gap-[10px] xl:grid-cols-[508px_521px] xl:gap-[10px]">
              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 2xl:h-[245px]">
                <p className="text-fs-title font-semibold text-primary">Saldo Disponível</p>
                <p className="mt-2 text-fs-display font-semibold text-foreground">
                  {formatCurrency(balanceCards[0].value ?? 0)}
                </p>
                <p className="mt-3 text-fs-stat text-muted-foreground">
                  {balanceCards[0].description}
                </p>
              </div>

              <div className="flex h-full w-full flex-col justify-center gap-4 rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[245px]">
                <p className="text-fs-title font-semibold text-primary">Conta Bancária Principal</p>
                {hasBankAccount ? (
                  <>
                    <div className="space-y-2 text-fs-stat text-foreground">
                      <div className="flex items-center gap-2 font-semibold">
                        <Image src="/images/ICON-4.svg" alt="" width={18} height={18} className="h-6 w-6" />
                        {balanceCards[2].bank} <span className="text-muted-foreground"> {balanceCards[2].accountType}</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Image src="/images/pix2.svg" alt="Ícone Pix" width={32} height={32} className="h-[26px] w-[26px]" />
                          Chave PIX: {balanceCards[2].pixKey}
                        </span>
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
                  <div className="space-y-4 text-fs-stat text-foreground">
                    <p className="text-fs-stat text-muted-foreground">
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
                <p className="text-fs-title font-semibold text-foreground">Saldo pendente</p>
                <p className="mt-2 text-fs-display font-semibold text-foreground">
                  {formatCurrency(balanceCards[1].value ?? 0)}
                </p>
              </div>

              <div className="flex h-full w-full flex-col justify-center rounded-[16px] border border-muted bg-card/70 p-5 lg:h-[146px]">
                <div className="flex items-center justify-between">
                  <p className="text-fs-title font-semibold text-foreground">Comissões a receber</p>
                </div>
                <p className="mt-2 text-fs-display font-semibold text-foreground">
                  {formatCurrency(balanceCards[3].value ?? 0)}
                </p>
              </div>
            </div>
          )}

          {activeTab === "transacoes" && (
            <div
              className="mx-auto flex w-full flex-col items-stretch gap-4"
              style={{ maxWidth: "var(--fin-table-width)" }}
            >
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

              <PaginatedTable<Transaction>
                data={filteredTransactions}
                columns={transactionColumns}
                rowKey={transaction => transaction.id + transaction.date + transaction.time}
                rowsPerPage={rowsPerPage}
                emptyMessage="Nenhuma transação encontrada."
                tableContainerClassName="flex w-full justify-center overflow-hidden rounded-[16px] border border-muted bg-card/70"
                tableClassName="text-fs-body"
                headerRowClassName="bg-card/60 text-fs-body uppercase text-muted-foreground h-[46px]"
                paginationContainerClassName="mx-auto flex w-full max-w-[1280px] flex-col gap-2 md:flex-row md:items-center md:justify-between"
                onRowClick={setSelectedTransaction}
                wrapperClassName="w-full"
              />
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
              <h2 className="text-fs-title font-semibold text-foreground">Filtrar</h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar modal de filtro"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-6 text-fs-body text-foreground">
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
                      className="flex h-11 items-center gap-3 rounded-[10px] px-1 text-fs-body"
                    >
                      <input
                        type="checkbox"
                        className="relative h-[26px] w-[26px] appearance-none rounded border border-muted bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-fs-caption [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
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
                      className="flex h-11 items-center gap-3 rounded-[10px] px-1 text-fs-body"
                    >
                      <input
                        type="checkbox"
                        className="relative h-[26px] w-[26px] appearance-none rounded border border-muted bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[7px] [&::before]:top-[3px] [&::before]:hidden [&::before]:text-fs-caption [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white"
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
      {selectedTransaction && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            role="button"
            tabIndex={0}
            aria-label="Fechar modal de detalhes (overlay)"
            onClick={() => setSelectedTransaction(null)}
            onKeyDown={event => handleOverlayKeyDown(event, () => setSelectedTransaction(null))}
          />
          <div className="fixed right-0 top-0 z-50 h-screen w-[501px] border-l border-muted bg-card px-7 pb-10 pt-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <h2 className="text-fs-display font-semibold text-foreground">Detalhes</h2>
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar modal de detalhes"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="space-y-4 text-fs-body text-foreground">
              <div className="flex items-center gap-3 rounded-[12px] border border-muted/60 px-4 py-3">
                <div className="h-[56px] w-[56px] rounded-[8px] bg-muted/30" aria-hidden />
                <div className="space-y-1">
                  <p className="text-fs-section font-semibold leading-tight">{selectedTransaction.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-foreground">
                <Tag className="h-5 w-5 text-foreground" aria-hidden />
                <span className="text-fs-body font-semibold">Order bump(s)</span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-[6px] border border-muted/60 px-2 text-sm text-muted-foreground">
                  1
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-[12px] border border-muted/60 px-4 py-3">
                <div className="h-[56px] w-[56px] rounded-[8px] bg-muted/30" aria-hidden />
                <div className="space-y-1">
                  <p className="text-fs-section font-semibold leading-tight">{selectedTransaction.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.subtitle}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 items-start gap-y-3 text-sm text-foreground">
                  <span className="text-muted-foreground">Categoria</span>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedTransaction.category === "Venda"
                        ? "bg-emerald-500/15 text-emerald-200"
                        : selectedTransaction.category === "Estorno"
                          ? "bg-red-500/15 text-red-200"
                          : selectedTransaction.category === "MED"
                            ? "bg-red-500/15 text-red-200"
                            : "bg-rose-500/15 text-rose-200"
                    }`}
                  >
                    {selectedTransaction.category}
                  </span>

                  <span className="text-muted-foreground">Código da venda</span>
                  <span className="font-semibold text-left">{selectedTransaction.id}</span>

                  <span className="text-muted-foreground">Descrição</span>
                  <span className="font-semibold text-left">Venda coprodução</span>

                  <span className="text-muted-foreground">Data da venda</span>
                  <span className="font-semibold text-left">
                    {selectedTransaction.date} às {selectedTransaction.time.replace("às ", "")}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t border-muted/60 pt-4">
                <div className="grid grid-cols-2 items-start gap-y-3 text-sm text-foreground">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-left">
                    {selectedTransaction.type === "entrada" ? "Entrada" : "Saída"}
                    {selectedTransaction.type === "entrada" ? (
                      <ArrowDown className="h-4 w-4 text-emerald-400" aria-hidden />
                    ) : (
                      <ArrowUp className="h-4 w-4 text-red-400" aria-hidden />
                    )}
                  </span>

                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-semibold text-left">{formatCurrency(selectedTransaction.value)}</span>

                  <span className="text-muted-foreground">Taxas (4.9% + R$ 0,75)</span>
                  <span className="font-semibold text-left text-red-200">
                    -{formatCurrency(selectedTransaction.value * 0.049 + 0.75)}
                  </span>

                  <span className="text-muted-foreground">Comissão do coprodutor</span>
                  <span className="font-semibold text-left text-red-200">
                    -{formatCurrency(selectedTransaction.value * 0.07)}
                  </span>

                  <span className="text-muted-foreground">Minha comissão</span>
                  <span className="font-semibold text-left text-emerald-200">
                    {formatCurrency(
                      selectedTransaction.value -
                        (selectedTransaction.value * 0.049 + 0.75) -
                        selectedTransaction.value * 0.07
                    )}
                  </span>
                </div>
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
          <div className="fixed left-1/2 top-1/2 z-50 h-[500px] w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card">
            <div className="flex items-start justify-between border-b border-muted px-5 py-4">
              <p className="text-fs-lead font-semibold text-foreground">Solicitar saque</p>
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
                <p className="text-fs-title font-semibold text-foreground">Quanto você quer sacar?</p>
                <input
                  type="text"
                  className="mt-3 h-[49px] w-full max-w-[420px] rounded-[10px] border border-muted bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  placeholder="R$ 0,00"
                />
              </div>
              <div
                className="flex h-[42px] w-full max-w-[420px] items-center justify-between rounded-[10px] px-4 text-fs-stat font-semibold text-foreground"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--card)) 0%, hsl(var(--muted)) 50%, hsl(var(--card)) 100%)"
                }}
              >
                <span className="text-muted-foreground">Saldo disponível:</span>
                <span>{formatCurrency(balanceCards[0].value ?? 0)}</span>
              </div>
              <div className="w-full max-w-[420px] space-y-3 text-fs-stat text-muted-foreground">
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
                className="mt-2 inline-flex h-[44px] w-full max-w-[360px] items-center justify-center rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-sm font-semibold text-white"
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
          <div className="fixed left-1/2 top-1/2 z-50 h-[500px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-muted bg-card p-5">
            <div className="flex items-center justify-between border-b border-muted pb-4">
              <p className="text-fs-title font-semibold text-foreground">Configurar conta bancária</p>
              <button
                type="button"
                onClick={() => setShowAccountForm(false)}
                className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Fechar configuração de conta"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-6 pt-2 text-[12px]">
              <div className="space-y-2">
                <p className="mb-5 text-fs-title font-semibold text-muted-foreground">Informações do titular</p>
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
                <p className="mb-5 text-fs-title font-semibold text-muted-foreground">Chave pix</p>
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

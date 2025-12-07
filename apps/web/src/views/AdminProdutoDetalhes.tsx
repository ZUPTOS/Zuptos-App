'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Banknote,
  BarChart2,
  CalendarClock,
  CircleDollarSign,
  Download,
  CreditCard,
  ExternalLink,
  FileText,
  File,
  QrCode,
  Receipt,
  RotateCcw,
  Tag,
  UserRound,
  Upload,
  X,
  XCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type ProductStatus = 'Aprovado' | 'Em produção' | 'Reprovado' | 'Pendente' | 'Em atualização';
type OfferStatus = 'Ativo' | 'Inativo';

const statusStyles: Record<ProductStatus, string> = {
  Aprovado: 'bg-emerald-500/15 text-emerald-400',
  'Em produção': 'bg-sky-500/15 text-sky-300',
  Reprovado: 'bg-rose-500/15 text-rose-400',
  Pendente: 'bg-lime-500/15 text-lime-300',
  'Em atualização': 'bg-teal-500/15 text-teal-300'
};

const offerStatusStyles: Record<OfferStatus, string> = {
  Ativo: 'bg-emerald-700/30 text-emerald-300',
  Inativo: 'bg-rose-700/30 text-rose-300'
};

const productDetail = {
  id: '#0969860',
  name: 'Nome',
  producer: 'Produtor 01',
  producerEmail: 'E-mail',
  status: 'Aprovado' as ProductStatus,
  description:
    "orem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
  salesPage: 'www.site.com'
};

const producerDetail = {
  id: '#0969860',
  name: 'Nome',
  document: 'XXXXXXXXXXXX',
  documentStatus: 'Aprovado' as ProductStatus,
  email: 'teste@gmail.com',
  emailVerified: true,
  phoneVerified: false
};

const deliverable = {
  currentFile: 'nome do arquivo'
};

const offers = [
  {
    id: '827109846863',
    name: 'Oferta 01',
    price: 'R$00,00',
    checkout: 'www.site.com',
    upsell: 'www.site.com',
    thankyou: 'www.site.com',
    status: 'Ativo' as OfferStatus,
    paymentMethods: ['credit', 'pix', 'boleto'] as const
  },
  {
    id: '827109846864',
    name: 'Oferta 02',
    price: 'R$00,00',
    checkout: 'www.site.com',
    upsell: 'www.site.com',
    thankyou: 'www.site.com',
    status: 'Inativo' as OfferStatus,
    paymentMethods: ['credit', 'pix', 'boleto'] as const
  }
];

const tabs = [
  { id: 'produtor', label: 'Produtor', icon: UserRound },
  { id: 'ofertas', label: 'Ofertas', icon: Tag },
  { id: 'estatisticas', label: 'Estatísticas', icon: BarChart2 },
  { id: 'entregavel', label: 'Entregável', icon: FileText }
] as const;

const verificationBadge = (verified: boolean) =>
  verified
    ? 'inline-flex items-center rounded-md bg-emerald-700/30 px-3 py-1 text-sm font-semibold text-emerald-400'
    : 'inline-flex items-center rounded-md bg-rose-700/40 px-3 py-1 text-sm font-semibold text-rose-300';

type StatItem = {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
};

const stats: StatItem[] = [
  { id: 'revenue', label: 'Faturamento', value: 'R$00,00', icon: CircleDollarSign },
  { id: 'sales', label: 'Vendas', value: '00', icon: Receipt },
  { id: 'created', label: 'Data de criação', value: 'dd/mm/aaaa', helper: 'às 18:45', icon: CalendarClock },
  { id: 'refund', label: 'Taxa de reembolso', value: '00,00%', icon: RotateCcw },
  { id: 'chargeback', label: 'Taxa de chargeback', value: '00,00%', icon: XCircle }
] as const;

export default function AdminProdutoDetalhes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('produtor');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [productStatus, setProductStatus] = useState<ProductStatus>(productDetail.status);
  const [pendingStatus, setPendingStatus] = useState<ProductStatus>(productDetail.status);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);

  const historyItems = [
    { name: 'Nome do arquivo', date: 'dd/mm/aaaa', time: '00h00' },
    { name: 'Nome do arquivo', date: 'dd/mm/aaaa', time: '00h00' },
    { name: 'Nome do arquivo', date: 'dd/mm/aaaa', time: '00h00' },
    { name: 'Nome do arquivo', date: 'dd/mm/aaaa', time: '00h00' }
  ];

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 lg:px-8">
          <button
            type="button"
            onClick={() => router.push('/admin/produtos')}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Produtos
          </button>

          <div className="rounded-[8px] bg-card">
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <p className="text-sm font-semibold text-muted-foreground">Dados do produto</p>
              <span className="text-xs font-medium text-muted-foreground">
                ID: <span className="text-foreground">{productDetail.id}</span>
              </span>
            </div>

            <div className="space-y-4 px-6 py-4 rounded-[10px]">
              <div className="grid gap-6 border-foreground/10 pb-3 md:grid-cols-3">
                <div className="space-y-3">
                  <span className="text-sm text-muted-foreground">Nome do produto</span>
                  <p className="text-xl font-semibold text-foreground">{productDetail.name}</p>
                </div>
                <div className="space-y-3">
                  <span className="text-sm text-muted-foreground">Produtor</span>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-foreground">{productDetail.producer}</p>
                    <span className="text-xs uppercase text-muted-foreground">{productDetail.producerEmail}</span>
                  </div>
                </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-[12px] font-semibold ${statusStyles[productStatus]}`}
                      >
                        {productStatus}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-[7px] border border-foreground/15 bg-muted/20 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                        aria-label="Editar status"
                        onClick={() => {
                          setPendingStatus(productStatus);
                          if (productStatus !== 'Reprovado') setRejectionReason('');
                          setIsStatusModalOpen(true);
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Descrição</span>
                <p className="text-lg leading-relaxed text-foreground">{productDetail.description}</p>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Página de vendas</span>
                <p className="text-lg font-semibold text-foreground">{productDetail.salesPage}</p>
              </div>
            </div>

            <div className="grid gap-2 h-[130px] grid-cols-2 bg-background md:grid-cols-4">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex rounded-[10px] h-[135px] w-full flex-col bg-card mt-2 items-center justify-center gap-3 px-3 text-sm font-semibold transition ${
                      isActive
                        ? 'border border-primary/50 text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-[10px] border ${
                        isActive
                          ? 'border-primary/60 text-primary'
                          : 'border-foreground/15 bg-foreground/5 text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'produtor' && (
            <div className="rounded-[7px]  bg-card">
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <p className="text-lg font-semibold text-foreground">Produtor</p>
                <span className="text-sm font-medium text-muted-foreground">
                  ID: <span className="text-foreground">{producerDetail.id}</span>
                </span>
              </div>

              <div className="space-y-8 px-6 py-8">
                <div className="grid gap-6 pb-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Nome do produtor</span>
                    <p className="text-2xl font-semibold text-foreground">{producerDetail.name}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">CPF/CNPJ</span>
                    <p className="text-xl font-semibold text-muted-foreground">{producerDetail.document}</p>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <span className="text-sm text-muted-foreground">Status do documento</span>
                    <span className={`flex justify-center w-full max-w-[90px] items-center rounded-[10px] px-3 py-1 text-xs font-semibold ${statusStyles[producerDetail.documentStatus]}`}>
                      {producerDetail.documentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground">Verificação</p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-foreground">
                      <span>E-mail: {producerDetail.email}</span>
                      <span className={verificationBadge(producerDetail.emailVerified)}>
                        {producerDetail.emailVerified ? 'Verificado' : 'Não Verificado'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-2xl font-semibold text-foreground">
                      <span>Telefone:</span>
                      <span className={verificationBadge(producerDetail.phoneVerified)}>
                        {producerDetail.phoneVerified ? 'Verificado' : 'Não Verificado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ofertas' && (
            <div className="rounded-[7px] border border-foreground/10 bg-card">
              <div className="border-b border-foreground/10 px-6 py-4">
                <p className="text-lg font-semibold text-foreground">Ofertas</p>
              </div>

              <div className="space-y-6 px-6 py-6">
                {offers.map(offer => (
                  <div key={offer.id} className="rounded-[10px] border border-foreground/10 bg-card/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] dark:border-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-foreground/10 pb-4">
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-foreground">{offer.name}</p>
                        <span className="text-xs uppercase text-muted-foreground">ID: {offer.id}</span>
                      </div>
                      <span className={`inline-flex items-center rounded-[10px] px-3 py-1 text-xs font-semibold ${offerStatusStyles[offer.status]}`}>
                        {offer.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-start md:gap-10">
                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Preço</span>
                        <p className="text-2xl font-semibold text-foreground">{offer.price}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Métodos de pagamento</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {offer.paymentMethods.map(method => {
                            const iconClass = 'h-4 w-4';
                            if (method === 'credit') {
                              return (
                                <span key={`${offer.id}-credit`} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-foreground">
                                  <CreditCard className={iconClass} aria-hidden />
                                </span>
                              );
                            }
                            if (method === 'pix') {
                              return (
                                <span key={`${offer.id}-pix`} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-foreground">
                                  <QrCode className={iconClass} aria-hidden />
                                </span>
                              );
                            }
                            return (
                              <span key={`${offer.id}-boleto`} className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-foreground">
                                <Banknote className={iconClass} aria-hidden />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Checkout</span>
                        <p className="text-lg font-semibold text-foreground">{offer.checkout}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Upsell</span>
                        <p className="text-lg font-semibold text-foreground">{offer.upsell}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Página de obrigado</span>
                        <p className="text-lg font-semibold text-foreground">{offer.thankyou}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'estatisticas' && (
            <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
              <div className="border-b border-foreground/10 px-6 py-4">
                <p className="text-lg font-semibold text-foreground">Estatísticas</p>
              </div>
              <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
                {stats.map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.id} className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-foreground/10 bg-card/60 p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.35)] dark:border-white/10">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/5 text-foreground">
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold text-foreground">{stat.value}</p>
                        {stat.helper && <span className="text-[11px] uppercase text-muted-foreground">{stat.helper}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'entregavel' && (
            <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
              <div className="border-b border-foreground/10 px-6 py-4">
                <p className="text-lg font-semibold text-foreground">Entregável</p>
              </div>
              <div className="space-y-4 px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-foreground/10 bg-card/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/5 text-foreground">
                      <File className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="text-lg font-semibold text-foreground">Arquivo atual: {deliverable.currentFile}</p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-foreground/15 bg-card text-foreground transition hover:border-primary/40 hover:text-primary"
                    aria-label="Baixar entregável"
                  >
                    <Upload className="h-5 w-5" aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex w-fit items-center rounded-[7px] border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-foreground/25 hover:bg-muted/20"
                >
                  Ver histórico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isHistoryOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            role="button"
            tabIndex={-1}
            aria-label="Fechar histórico"
            onClick={() => setIsHistoryOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-10">
            <div className="w-full max-w-[420px] rounded-[10px] border border-foreground/15 bg-card px-5 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3">
                <p className="text-lg font-semibold text-foreground">Histórico</p>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-muted-foreground transition hover:text-foreground"
                  aria-label="Fechar modal de histórico"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {historyItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-[10px] px-1 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-foreground/10 text-foreground">
                        <File className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.date} <span className="text-[11px] text-muted-foreground/70">{item.time}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-[8px] p-2 text-muted-foreground transition hover:text-primary"
                      aria-label={`Baixar ${item.name}`}
                    >
                      <Download className="h-5 w-5" aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {isStatusModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70"
            role="button"
            tabIndex={-1}
            aria-label="Fechar modal de status"
            onClick={() => setIsStatusModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-[480px] rounded-[12px] border border-foreground/15 bg-card px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between pb-4">
                <p className="text-xl font-semibold text-foreground">Alterar status do produto</p>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="rounded-full p-1 text-muted-foreground transition hover:text-foreground"
                  aria-label="Fechar modal de status"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsStatusSelectOpen(prev => !prev)}
                    className="flex w-full items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-3 py-3 text-sm text-foreground transition focus:border-primary/50 focus:outline-none"
                  >
                    <span>{pendingStatus}</span>
                    <span className="text-muted-foreground">▼</span>
                  </button>
                  {isStatusSelectOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-2 rounded-[10px] border border-foreground/15 bg-card shadow-lg">
                      {Object.keys(statusStyles).map(status => (
                        <button
                          key={status}
                          type="button"
                          className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-muted/20 ${
                            pendingStatus === status ? 'text-primary' : 'text-foreground'
                          }`}
                          onClick={() => {
                            const next = status as ProductStatus;
                            setPendingStatus(next);
                            if (next !== 'Reprovado') setRejectionReason('');
                            setIsStatusSelectOpen(false);
                          }}
                        >
                          <span>{status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {pendingStatus === 'Reprovado' && (
                  <label className="block text-sm text-muted-foreground">
                    <span className="sr-only">Motivo da recusa</span>
                    <textarea
                      value={rejectionReason}
                      onChange={event => setRejectionReason(event.target.value)}
                      placeholder="Inserir motivo da recusa"
                      className="mt-1 w-full rounded-[10px] border border-foreground/15 bg-card px-3 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                      rows={3}
                    />
                  </label>
                )}
              </div>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  className="w-full rounded-[10px] border border-foreground/20 bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setIsStatusModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="w-full rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                  onClick={() => {
                    if (pendingStatus === 'Reprovado' && !rejectionReason.trim()) return;
                    setProductStatus(pendingStatus);
                    setIsStatusModalOpen(false);
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

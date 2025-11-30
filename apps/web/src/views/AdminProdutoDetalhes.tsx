'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Banknote,
  BarChart2,
  CalendarClock,
  Check,
  CircleDollarSign,
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

const stats = [
  { id: 'revenue', label: 'Faturamento', value: 'R$00,00', icon: CircleDollarSign },
  { id: 'sales', label: 'Vendas', value: '00', icon: Receipt },
  { id: 'created', label: 'Data de criação', value: 'dd/mm/aaaa', helper: 'às 18:45', icon: CalendarClock },
  { id: 'refund', label: 'Taxa de reembolso', value: '00,00%', icon: RotateCcw },
  { id: 'chargeback', label: 'Taxa de chargeback', value: '00,00%', icon: XCircle }
] as const;

export default function AdminProdutoDetalhes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('produtor');

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

          <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
            <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
              <p className="text-sm font-semibold text-muted-foreground">Dados do produto</p>
              <span className="text-xs font-medium text-muted-foreground">
                ID: <span className="text-foreground">{productDetail.id}</span>
              </span>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-6 border-b border-foreground/10 pb-6 md:grid-cols-3">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Nome do produto</span>
                  <p className="text-xl font-semibold text-foreground">{productDetail.name}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Produtor</span>
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-foreground">{productDetail.producer}</p>
                    <span className="text-xs uppercase text-muted-foreground">{productDetail.producerEmail}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-lg text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${statusStyles[productDetail.status]}`}>
                      {productDetail.status}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-foreground/15 bg-muted/20 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      aria-label="Editar status"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
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

            <div className="grid grid-cols-2 divide-x divide-foreground/10 border-t border-foreground/10 md:grid-cols-4">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex h-[88px] w-full flex-col items-center justify-center gap-3 px-3 text-sm font-semibold transition ${
                      isActive
                        ? 'border-l border-r border-primary/50 bg-primary/10 text-primary first:border-l-0 last:border-r-0'
                        : 'bg-card text-muted-foreground hover:bg-muted/20'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full border ${
                        isActive
                          ? 'border-primary/60 bg-primary/10 text-primary'
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
            <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
              <div className="flex items-center justify-between border-b border-foreground/10 px-6 py-4">
                <p className="text-lg font-semibold text-foreground">Produtor</p>
                <span className="text-sm font-medium text-muted-foreground">
                  ID: <span className="text-foreground">{producerDetail.id}</span>
                </span>
              </div>

              <div className="space-y-8 px-6 py-8">
                <div className="grid gap-6 border-b border-foreground/10 pb-8 md:grid-cols-3">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Nome do produtor</span>
                    <p className="text-2xl font-semibold text-foreground">{producerDetail.name}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">CPF/CNPJ</span>
                    <p className="text-xl font-semibold text-muted-foreground">{producerDetail.document}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Status do documento</span>
                    <span className={`inline-flex items-center rounded-[10px] px-3 py-1 text-xs font-semibold ${statusStyles[producerDetail.documentStatus]}`}>
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
            <div className="rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b]">
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
                  className="inline-flex w-fit items-center rounded-[10px] border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-foreground/25 hover:bg-muted/20"
                >
                  Ver histórico
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

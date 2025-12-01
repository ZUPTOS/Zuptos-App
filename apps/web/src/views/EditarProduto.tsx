'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const tabs = [
  "Área de membros",
  "Entregável",
  "Ofertas",
  "Checkouts",
  "Configurações",
  "Pixels de rastreamento",
  "Upsell, downsell e mais",
  "Cupons",
  "Coprodução",
] as const;

const files = [
  { name: "Arquivo x", link: "https://www.site.com", size: "353.49kb", status: "Ativo" },
  { name: "Arquivo y", link: "https://www.site.com", size: "-", status: "Ativo" },
];

const offers = [
  { name: "BÁSICO", checkout: "Checkout 1", type: "Preço único", price: "R$ 497,00", access: "www.link.com", status: "Ativo" },
  { name: "BÁSICO", checkout: "Checkout 2", type: "Preço único", price: "R$ 497,00", access: "www.link.com", status: "Inativo" },
] as const;

const checkouts = [
  { name: "Checkout 1", payment: "Preço único", offers: "TODAS" }
] as const;

const trackingPixels = [
  { name: "META", id: "688693e", platform: "Facebook", status: "Ativo" }
] as const;

const upsellItems = [
  { name: "META", type: "Upsell", offer: "Oferta 01", value: "R$00,00", script: "<script>" }
] as const;

const coupons = [
  { name: "CUPOM 10", discount: "R$ 00,00", code: "ZUPTOS10", status: "Ativo" },
  { name: "CUPOM 10", discount: "10%", code: "ZUPTOS10", status: "Inativo" },
] as const;

const coproductions = [
  { name: "BÁSICO", start: "dd/mm/aaaa", commission: "0%", duration: "Vitalícia", status: "Aprovado" },
] as const;

export default function EditarProdutoView() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Entregável");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [showPixelFormModal, setShowPixelFormModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCoproductionModal, setShowCoproductionModal] = useState(false);
  const [showCoproductionDetailModal, setShowCoproductionDetailModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableTab, setDeliverableTab] = useState<"arquivo" | "link">("arquivo");
  const [pixelType, setPixelType] = useState<"padrao" | "api">("padrao");
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [offerType, setOfferType] = useState<"preco_unico" | "assinatura">("preco_unico");
  const router = useRouter();

  const headerCard = useMemo(
    () => (
      <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-[10px] bg-foreground/10">
            <Image
              src="/images/produto.png"
              alt="Produto 01"
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Produto 01</p>
            <span className="text-xs font-semibold text-emerald-400">Ativo</span>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">R$ 350,34 faturados</p>
          <p>6 vendas realizadas</p>
        </div>
      </div>
    ),
    []
  );

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl gap-6">
          <nav className="w-52 shrink-0">
            <ul className="space-y-2 text-sm">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`w-full px-2 py-2 text-left transition ${
                        isActive
                          ? "text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex-1 space-y-6">
            {headerCard}

            {activeTab === "Entregável" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Entregável</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar arquivo"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowDeliverableModal(true)}
                    >
                      Adicionar arquivo
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/70 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Entregável</span>
                    <span>Tamanho</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {files.map(file => (
                      <div key={file.name} className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">Arquivo x</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <a
                              href={file.link}
                              className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                            >
                              {file.link.replace("https://", "")}
                            </a>
                            <button
                              type="button"
                              className="h-8 w-8 rounded-[6px] border border-foreground/15 bg-card text-sm text-foreground transition hover:border-foreground/30"
                              aria-label="Baixar"
                            >
                              📎
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">{file.size}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden />
                          <span className="font-medium text-foreground">{file.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Ofertas" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowOfferModal(true)}
                    >
                      Adicionar oferta
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-6 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Checkout</span>
                    <span>Tipo</span>
                    <span>Valor</span>
                    <span>Acesso</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {offers.map(offer => (
                      <div key={`${offer.name}-${offer.checkout}`} className="grid grid-cols-6 items-center gap-4 px-4 py-4 text-sm text-foreground">
                        <span className="font-semibold uppercase">{offer.name}</span>
                        <span className="font-semibold">{offer.checkout}</span>
                        <span className="text-muted-foreground">{offer.type}</span>
                        <span className="font-semibold">{offer.price}</span>
                        <div className="flex items-center">
                          <button
                            type="button"
                            className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                          >
                            {offer.access}
                          </button>
                        </div>
                        <div className="flex items-center justify-start">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                              offer.status === "Ativo"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-muted/40 text-muted-foreground"
                            }`}
                          >
                            {offer.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Checkouts" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Checkouts</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                    >
                      Adicionar Checkout
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Pagamento</span>
                    <span>Ofertas</span>
                    <span className="text-right">Ação</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {checkouts.map(checkout => (
                      <div
                        key={checkout.name}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold">{checkout.name}</span>
                        <span className="text-muted-foreground">{checkout.payment}</span>
                        <span className="text-muted-foreground">{checkout.offers}</span>
                        <div className="flex justify-end">
                          <button
                            className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                            onClick={() => router.push('/editar-produto/checkouts')}
                            type="button"
                          >
                            EDITAR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Configurações" && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Configurações</h2>

                <div className="space-y-6 rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
                  <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                    <div className="flex items-center justify-center rounded-[12px] border border-foreground/10 bg-card/70 p-3">
                      <Image
                        src="/images/produto.png"
                        alt="Produto"
                        width={160}
                        height={160}
                        className="h-[160px] w-[160px] object-cover rounded-[10px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span className="text-foreground">Nome do produto</span>
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Nome do produto"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span className="text-foreground">Descrição breve</span>
                        <textarea
                          className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Descrição do produto"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">E-mail</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Insira o e-mail"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Telefone</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Insira o e-mail"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Categoria</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Selecione a categoria"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Formato</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Curso"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Idioma</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Português"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Moeda base</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Real"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Página de vendas</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="www.site.com"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Status do produto</p>
                      <p className="text-xs text-muted-foreground">Gerencie se o produto estará ou não ativo para vendas</p>
                    </div>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>

                  <div className="rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Recuperação ativa</p>
                        <p className="text-xs text-muted-foreground">
                          Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
                        </p>
                      </div>
                      <button
                        className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                        onClick={() => setShowRecoveryModal(true)}
                      >
                        Configurar
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between">
                  <button className="rounded-[8px] border border-rose-900/60 bg-rose-900/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/50">
                    Excluir produto
                  </button>
                  <button className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90">
                    Salvar alterações
                  </button>
                </div>
              </>
            )}

            {activeTab === "Pixels de rastreamento" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Pixel de rastreamento</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowPixelModal(true)}
                    >
                      Adicionar Pixel
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>ID</span>
                    <span>Plataforma</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {trackingPixels.map(pixel => (
                      <div
                        key={`${pixel.name}-${pixel.id}`}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{pixel.name}</span>
                        <span className="text-muted-foreground">{pixel.id}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">{pixel.platform}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                            {pixel.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Upsell, downsell e mais" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Upsell, downsell e mais</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowUpsellModal(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-5 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Tipo</span>
                    <span>Oferta</span>
                    <span>Valor</span>
                    <span className="text-right">Script</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {upsellItems.map(item => (
                      <div
                        key={`${item.name}-${item.offer}`}
                        className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{item.name}</span>
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="text-muted-foreground">{item.offer}</span>
                        <span className="font-semibold">{item.value}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-[6px] text-[11px] font-semibold text-muted-foreground">
                            {item.script}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Cupons" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Cupom</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowCouponModal(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Desconto</span>
                    <span>Código</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {coupons.map(coupon => (
                      <div
                        key={`${coupon.name}-${coupon.code}-${coupon.discount}`}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{coupon.name}</span>
                        <span className="font-semibold">{coupon.discount}</span>
                        <span className="text-muted-foreground">{coupon.code}</span>
                        <div className="flex justify-end">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                              coupon.status === "Ativo"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            {coupon.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Coprodução" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Coprodução</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowCoproductionModal(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-5 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Início</span>
                    <span>Comissão</span>
                    <span>Duração</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {coproductions.map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setShowCoproductionDetailModal(true)}
                        className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-left text-sm text-foreground transition hover:bg-card/60"
                      >
                        <span className="font-semibold uppercase">{item.name}</span>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground">{item.start}</p>
                          <p className="text-[11px] uppercase tracking-wide">00h00</p>
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground">{item.commission}</p>
                          <p className="text-[11px]">Vendas produtor</p>
                        </div>
                        <span className="font-semibold">{item.duration}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                            {item.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOfferModal(false)}
            aria-label="Fechar modal"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Criar oferta</h2>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-6 pb-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Selecione o tipo de oferta</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferType("preco_unico")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      offerType === "preco_unico"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Preço único
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferType("assinatura")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      offerType === "assinatura"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Assinatura
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>Status da oferta</span>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="space-y-2 text-sm text-muted-foreground">
                    <span>Nome da oferta</span>
                    <input
                      className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Digite um nome"
                    />
                  </label>
                </div>
              </div>

              {offerType === "preco_unico" && (
                <div className="space-y-2">
                  <label className="space-y-2 text-sm text-muted-foreground">
                    <span>Checkout</span>
                    <input
                      className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Selecione um checkout"
                    />
                  </label>
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Oferta gratuita</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <input
                    className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                </div>
              )}

              {offerType === "assinatura" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Planos de assinatura</p>
                    <p className="text-xs text-muted-foreground">
                      Você pode criar uma oferta com um ou mais planos. Essas opções estarão disponíveis para o comprador no Checkout.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Defina a frequência da assinatura que deseja adicionar</p>
                    <div className="flex items-center gap-2">
                      <input
                        className="h-11 flex-1 rounded-[10px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Anual"
                      />
                      <button className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-foreground/20 bg-card text-foreground">
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                    <p className="text-sm font-semibold text-foreground">Plano anual</p>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                      Definir como padrão
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Título"
                      />
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Tag em destaque"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço normal"
                        />
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço promocional"
                        />
                      </div>
                      <div className="rounded-[8px] border border-foreground/15 bg-card px-3 py-3 text-xs text-muted-foreground">
                        <p className="text-sm font-semibold text-foreground">Pré-visualização do seu comprador:</p>
                        <div className="mt-2 rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-foreground">
                          <p className="font-semibold">Plano Anual</p>
                          <p>Anual - R$ 0,00</p>
                        </div>
                      </div>
                      <p className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-center text-[11px] text-muted-foreground">
                        Por conta da frequência, o limite de parcelamento é de 12x.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Preço diferente na primeira cobrança</span>
                        <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                          <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                        </button>
                      </div>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="R$ 0,00"
                      />

                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Número fixo de cobranças</span>
                        <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                          <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="h-10 w-20 rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="00"
                        />
                        <span className="text-sm text-muted-foreground">cobranças</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button className="w-1/2 min-w-[140px] rounded-[8px] bg-rose-900/40 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/60">
                        Excluir plano
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">Order Bumps</p>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete as informações para adicionar produtos complementares ao seu plano de assinatura durante o processo de pagamento.
                </p>

                <div className="space-y-3 rounded-[10px] border border-foreground/15 bg-card/70 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Produto"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Oferta"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Título"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Tag em destaque"
                    />
                  </div>
                  <label className="space-y-2 text-xs text-muted-foreground">
                    <span>Descrição do order bump (opcional)</span>
                    <textarea
                      className="min-h-[70px] rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Digite um nome"
                    />
                  </label>
                  <button
                    type="button"
                    className="w-full rounded-[8px] bg-muted px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                  >
                    Adicionar Order Bump
                  </button>
                </div>

                      <div className="space-y-3 rounded-[10px] border border-dashed border-primary/70 p-4">
                      {[1, 2].map(idx => (
                        <div key={idx} className="space-y-3 rounded-[10px] border border-foreground/15 bg-card p-4">
                          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                            <span className="text-base">0{idx}</span>
                            <div className="flex items-center gap-2">
                              <button className="rounded-[6px] border border-foreground/20 bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-foreground/40">
                                Editar
                              </button>
                              <button className="rounded-[6px] border border-foreground/20 bg-card px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-300/60">
                                Excluir
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3 rounded-[10px] border border-foreground/10 bg-card/70 p-3">
                            <div className="flex items-start gap-4">
                              <div className="overflow-hidden rounded-[10px] bg-foreground/10">
                                <Image
                                  src="/images/produto.png"
                                  alt="Order bump"
                                  width={120}
                                  height={120}
                                  className="h-[120px] w-[120px] object-cover"
                                />
                              </div>
                              <div className="space-y-2 pt-2">
                                <p className="text-lg font-semibold text-foreground">Order Bump 0{idx}</p>
                                <p className="text-lg font-semibold text-foreground">R$ 97,00</p>
                              </div>
                            </div>
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-foreground">Título</p>
                                <div className="inline-flex rounded-full bg-emerald-700/25 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                                  NOVIDADE
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-snug">
                                Lorem Ipsum é simplesmente uma simulação de texto da indústria tipográfica e de impressos, e vem sendo utilizado
                                desde o século XVI,
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Back Redirect</p>
                    <p className="text-xs text-muted-foreground">
                      Redirecione o comprador para URL cadastrada automaticamente ao sair do checkout.
                    </p>
                  </div>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
                <input
                  className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Insira o link"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ir para outra página após aprovado</p>
                    <p className="text-xs text-muted-foreground">
                      Você pode redirecionar o comprador para uma página de upsell ou de obrigado personalizada.
                    </p>
                  </div>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
                <input
                  className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Insira o link"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                >
                  Adicionar oferta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRecoveryModal(false)}
            aria-label="Fechar modal de recuperação"
          />
          <div className="relative h-full w-full max-w-[500px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Configurar Recuperação Ativa</h2>
                <p className="text-sm text-muted-foreground">
                  Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-6 pb-10">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Preferências</p>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas de preço único</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione um produto para ser ofertado de forma gratuita para seu cliente no momento do cancelamento de um produto de preço
                    único.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Produto
                    </button>
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Oferta
                    </button>
                  </div>
                </div>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas recorrentes</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma porcentagem que será aplicada como desconto no momento do cancelamento dos seus planos recorrentes.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="20"
                    />
                    <span className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-foreground/20 bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPixelModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPixelModal(false)}
            aria-label="Fechar modal pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Cadastrar pixel</h2>
              <button
                type="button"
                onClick={() => setShowPixelModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-foreground">Selecione a plataforma que deseja cadastrar.</p>

              <div className="space-y-3">
                {[
                  { name: "Google Ads", icon: "/images/google-ads.png" },
                  { name: "Facebook", icon: "/images/facebook.png" },
                  { name: "TikTok", icon: "/images/tiktok.png" },
                ].map(platform => (
                  <label
                    key={platform.name}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-foreground/15 bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:border-foreground/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-foreground/10">
                        <Image src={platform.icon} alt={platform.name} width={32} height={32} className="object-contain" />
                      </div>
                      <span className="text-base text-foreground">{platform.name}</span>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground/25" />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowPixelModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => {
                    setShowPixelModal(false);
                    setShowPixelFormModal(true);
                  }}
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPixelFormModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPixelFormModal(false)}
            aria-label="Fechar modal formulário pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Cadastrar Pixel</h2>
                <p className="text-sm text-muted-foreground">Preencha as informações.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPixelFormModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Tipo</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPixelType("padrao")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      pixelType === "padrao"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPixelType("api")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      pixelType === "api"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    API
                  </button>
                </div>
              </div>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              {pixelType === "api" && (
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Token acesso API conversões</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              )}

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Pixel Id</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Status</span>
                <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                  <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                </button>
                <span className="text-muted-foreground">Ativo</span>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-foreground">Configure eventos do pixel</p>
                <p className="text-xs text-muted-foreground">Registro e otimização de conversões.</p>
                {[
                  "Adicionar um item ao carrinho (AddToCart)",
                  "Iniciar finalização da compra (InitiateCheckout)",
                  "Adicionar dados de pagamento (AddPaymentInfo)",
                  "Compra (Purchase)",
                ].map(label => (
                  <div key={label} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{label}</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowPixelFormModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowPixelFormModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpsellModal(false)}
            aria-label="Fechar modal estratégia"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Criar estratégia</h2>
                <p className="text-sm text-muted-foreground">Crie upsell, cross sell ou downsell para aumentar seu ticket médio.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpsellModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Nome</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Tipo de estratégia</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Upsell"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
              </div>

              <label className="space-y-1 text-sm text-muted-foreground">
                <span className="text-foreground">Selecione o produto</span>
                <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                  <input
                    className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Selecione um produto"
                  />
                  <span className="text-lg text-muted-foreground">▾</span>
                </div>
              </label>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Caso o cliente aceite a oferta</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Se recusar</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCouponModal(false)}
            aria-label="Fechar modal cupom"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Novo Desconto</h2>
                <p className="text-sm text-muted-foreground">
                  Configure um cupom de desconto e aumente as conversões da sua loja, capte novos compradores e incentive a conclusão da compra.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Código de Cupom</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Selecione um produto"
                />
              </label>

              <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Regras para aplicação de cupom</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "valor"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("valor")}
                  >
                    Valor em R$
                  </button>
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "percent"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("percent")}
                  >
                    Porcentagem
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="dd/mm/aaaa"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Não vence
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Não tem limites
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ativo</span>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowCouponModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowCouponModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoproductionModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCoproductionModal(false)}
            aria-label="Fechar modal coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Convite de coprodução</h2>
              <button
                type="button"
                onClick={() => setShowCoproductionModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Nome"
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">E-mail</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="E-mail"
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Porcentagem de comissão</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="10%"
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Duração do contrato</p>
                <div className="flex flex-col gap-2 text-sm text-foreground">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Vitalício
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Período determinado
                    <input
                      className="h-10 w-16 rounded-[8px] border border-foreground/15 bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="0"
                    />
                    <span>mês(es)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Preferências</p>
                {[
                  "Compartilhar os dados do comprador com o coprodutor",
                  "Estender comissões: Order Bumps, Upsells e downsell",
                  "Dividir responsabilidades de emissão de notas fiscais",
                ].map(label => (
                  <div key={label} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{label}</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowCoproductionModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowCoproductionModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoproductionDetailModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCoproductionDetailModal(false)}
            aria-label="Fechar detalhes coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Coprodutor 1</h2>
              <button
                type="button"
                onClick={() => setShowCoproductionDetailModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="space-y-2 text-sm text-muted-foreground">
                {[
                  { label: "Nome do convidado", value: "-" },
                  { label: "E-mail", value: "-" },
                  { label: "Porcentagem de comissão", value: "0%" },
                  { label: "Início", value: "dd/mm/aaaa" },
                  { label: "Duração do contrato", value: "vitalício" },
                ].map(field => (
                  <div key={field.label} className="flex items-center justify-between">
                    <span className="text-foreground">{field.label}</span>
                    <span className="text-muted-foreground">{field.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Preferências</p>
                {[
                  "Compartilhar os dados do comprador com o coprodutor",
                  "Estender comissões: Order Bumps, Upsells e downsell",
                  "Dividir responsabilidades de emissão de notas fiscais",
                ].map(label => (
                  <div key={label} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{label}</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Status:</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                    Aprovado
                  </span>
                  <button className="rounded-[8px] border border-rose-900/40 bg-rose-900/20 px-3 py-2 text-xs font-semibold text-rose-200">
                    Solicitar cancelamento
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowCoproductionDetailModal(false)}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliverableModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeliverableModal(false)}
            aria-label="Fechar modal entregável"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {deliverableTab === "arquivo" ? "Adicionar entregável" : "Link de acesso"}
              </h2>
              <button
                type="button"
                onClick={() => setShowDeliverableModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-5 pb-10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverableTab("arquivo")}
                  className={`h-11 rounded-[10px] border px-3 text-sm font-semibold ${
                    deliverableTab === "arquivo"
                      ? "border-foreground/20 bg-[#d9d9d9] text-black"
                      : "border-foreground/10 bg-card text-muted-foreground"
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverableTab("link")}
                  className={`h-11 rounded-[10px] border px-3 text-sm font-semibold ${
                    deliverableTab === "link"
                      ? "border-foreground/20 bg-[#d9d9d9] text-black"
                      : "border-foreground/10 bg-card text-muted-foreground"
                  }`}
                >
                  Link
                </button>
              </div>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome de exibição</span>
                <input
                  className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              {deliverableTab === "arquivo" && (
                <div className="rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/10" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="text-sm text-foreground">Selecione um arquivo ou arraste e solte aqui</p>
                      <p>JPG, PNG, PDF ou ZIP, não superior a 50 MB</p>
                    </div>
                    <button className="ml-auto rounded-[8px] border border-foreground/20 px-3 py-2 text-xs font-semibold text-foreground">
                      Selecionar
                    </button>
                  </div>
                </div>
              )}

              {deliverableTab === "link" && (
                <label className="space-y-3 text-sm text-muted-foreground">
                  <span className="text-foreground">Link de acesso</span>
                  <input
                    className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Inserir link"
                  />
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowDeliverableModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowDeliverableModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

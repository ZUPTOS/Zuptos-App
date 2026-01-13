'use client';

import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import type { ProductStrategy } from "@/lib/api";
import PaginatedTable from "@/components/PaginatedTable";
import { useUpsell } from "./hooks/useUpsell";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function UpsellTab({ productId, token, withLoading }: Props) {
  const {
    strategies,
    strategiesLoading,
    strategiesError,
    showUpsellModal,
    savingStrategy,
    offers,
    offersLoading,
    editingStrategy,
    deleteTarget,
    deletingStrategy,
    copiedStrategyId,
    strategyForm,
    setStrategyForm,
    setShowUpsellModal,
    setDeleteTarget,
    openCreateStrategy,
    openEditStrategy,
    closeUpsellModal,
    handleCopyScript,
    handleCreateStrategy,
    handleDeleteStrategy,
    resolveOfferId,
    offerNameById,
    offerById,
    formatOfferPrice,
    toText,
  } = useUpsell({ productId, token, withLoading });

  return (
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
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
            onClick={openCreateStrategy}
          >
            Adicionar
          </button>
        </div>
      </div>

      <PaginatedTable<ProductStrategy>
        data={strategies}
        rowsPerPage={6}
        rowKey={item => item.id ?? `${item.type}-${item.offer}`}
        isLoading={strategiesLoading}
        emptyMessage={strategiesError || "Nenhuma estratégia cadastrada."}
        wrapperClassName="space-y-3"
        tableContainerClassName="rounded-[12px] border border-foreground/10 bg-card/80"
        headerRowClassName="text-foreground"
        tableClassName="text-left"
        columns={[
          {
            id: "nome",
            header: "Nome",
            render: item => <span className="font-semibold uppercase">{item.name || item.type || "Estratégia"}</span>,
          },
          {
            id: "tipo",
            header: "Tipo",
            render: item => <span className="text-muted-foreground">{item.type ?? "-"}</span>,
          },
          {
            id: "oferta",
            header: "Oferta",
            render: item => {
              const offerLabel = resolveOfferId(item);
              const resolvedName = offerNameById(offerLabel);
              return <span className="text-muted-foreground">{resolvedName ?? offerLabel ?? "-"}</span>;
            },
          },
          {
            id: "valor",
            header: "Valor",
            render: item => {
              const offerId = resolveOfferId(item);
              const offer = offerById(offerId);
              const raw = item as unknown as Record<string, unknown>;
              const rawValue =
                offer?.offer_price ??
                (offer as { offerPrice?: number | string } | undefined)?.offerPrice ??
                item.value ??
                raw.offer_price ??
                raw.offerPrice ??
                raw.price ??
                raw.value;
              const value =
                typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : undefined;
              const formattedValue = formatOfferPrice(value);
              return (
                <span className="font-semibold">
                  {offer?.free ? "Gratuito" : formattedValue ?? "-"}
                </span>
              );
            },
          },
          {
            id: "script",
            header: "Script",
            render: item => {
              const raw = item as unknown as Record<string, unknown>;
              const scriptUrl =
                toText(item.action_successful_url) ??
                toText(item.action_unsuccessful_url) ??
                toText(item.script) ??
                toText(raw.action_successful_url) ??
                toText(raw.action_unsuccessful_url) ??
                toText(raw.script);
              const scriptLabel =
                scriptUrl && scriptUrl !== "-"
                  ? scriptUrl.replace(/^https?:\/\//, "").slice(0, 22)
                  : "-";
              const strategyKey = item.id ?? scriptUrl ?? "script";
              return (
                <div className="relative w-full max-w-[180px]">
                  <button
                    type="button"
                    className="w-full truncate rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-foreground/30 hover:text-foreground disabled:opacity-60"
                    disabled={!scriptUrl || scriptUrl === "-"}
                    onClick={() => handleCopyScript(scriptUrl, strategyKey)}
                    title={scriptUrl && scriptUrl !== "-" ? "Copiar link" : "Sem link"}
                  >
                    {scriptLabel}
                  </button>
                  {copiedStrategyId === strategyKey && (
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-emerald-400">
                      Link copiado
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            id: "acoes",
            header: "",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: item => (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                  onClick={() => openEditStrategy(item)}
                  aria-label="Editar estratégia"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-rose-500/30 bg-rose-500/10 text-rose-200 transition hover:border-rose-500/60"
                  onClick={() => setDeleteTarget(item)}
                  aria-label="Excluir estratégia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

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
                    value={strategyForm.name}
                    onChange={event => setStrategyForm(current => ({ ...current, name: event.target.value }))}
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Tipo de estratégia</span>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={strategyForm.type}
                      onChange={event =>
                        setStrategyForm(current => ({ ...current, type: event.target.value }))
                      }
                    >
                      <option value="">Selecione</option>
                      <option value="upsell">Upsell</option>
                      <option value="downsell">Downsell</option>
                      <option value="cross_sell">Cross Sell</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </label>
              </div>

              <label className="space-y-1 text-sm text-muted-foreground">
                <span className="text-foreground">Selecione a oferta</span>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                    value={strategyForm.productId}
                    onChange={event =>
                      setStrategyForm(current => ({ ...current, productId: event.target.value }))
                    }
                    disabled={offersLoading || offers.length === 0}
                  >
                    <option value="">
                      {offersLoading
                        ? "Carregando ofertas..."
                        : offers.length === 0
                          ? "Sem oferta cadastrada"
                          : "Selecione uma oferta"}
                    </option>
                    {offers.map(offer => (
                      <option key={offer.id ?? offer.name} value={offer.id}>
                        {offer.name ?? offer.id}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </label>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Caso o cliente aceite a oferta</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={strategyForm.acceptAction}
                      onChange={event =>
                        setStrategyForm(current => ({ ...current, acceptAction: event.target.value }))
                      }
                    >
                      <option value="">Nova oferta</option>
                      <option value="redirect">Redirecionar</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                    value={strategyForm.acceptUrl}
                    onChange={event =>
                      setStrategyForm(current => ({ ...current, acceptUrl: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Se recusar</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={strategyForm.rejectAction}
                      onChange={event =>
                        setStrategyForm(current => ({ ...current, rejectAction: event.target.value }))
                      }
                    >
                      <option value="">Nova oferta</option>
                      <option value="redirect">Redirecionar</option>
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                    value={strategyForm.rejectUrl}
                    onChange={event =>
                      setStrategyForm(current => ({ ...current, rejectUrl: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={closeUpsellModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={handleCreateStrategy}
                  disabled={savingStrategy || !strategyForm.type || !strategyForm.productId}
                >
                  {savingStrategy ? "Salvando..." : editingStrategy ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
            aria-label="Fechar confirmação"
          />
          <div className="relative w-full max-w-sm rounded-[12px] border border-foreground/10 bg-card p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-foreground">Excluir estratégia</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Deseja excluir a estratégia <span className="font-semibold text-foreground">{deleteTarget.name || "sem nome"}</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500/90 disabled:opacity-60"
                onClick={handleDeleteStrategy}
                disabled={deletingStrategy}
              >
                {deletingStrategy ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

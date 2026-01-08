'use client';

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import { productApi } from "@/lib/api";
import type { CreateProductStrategyRequest, Product, ProductStrategy } from "@/lib/api";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function UpsellTab({ productId, token, withLoading }: Props) {
  const [strategies, setStrategies] = useState<ProductStrategy[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [strategiesError, setStrategiesError] = useState<string | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [savingStrategy, setSavingStrategy] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<ProductStrategy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductStrategy | null>(null);
  const [deletingStrategy, setDeletingStrategy] = useState(false);
  const [strategyForm, setStrategyForm] = useState({
    name: "",
    type: "",
    productId: "",
    acceptAction: "",
    acceptUrl: "",
    rejectAction: "",
    rejectUrl: "",
  });

  const resetStrategyForm = useCallback(() => {
    setStrategyForm({
      name: "",
      type: "",
      productId: "",
      acceptAction: "",
      acceptUrl: "",
      rejectAction: "",
      rejectUrl: "",
    });
    setEditingStrategy(null);
  }, []);

  const openCreateStrategy = useCallback(() => {
    resetStrategyForm();
    setShowUpsellModal(true);
  }, [resetStrategyForm]);

  const openEditStrategy = useCallback(
    (strategy: ProductStrategy) => {
      resetStrategyForm();
      setEditingStrategy(strategy);
      setStrategyForm({
        name: strategy.name ?? "",
        type: strategy.type ?? "",
        productId: strategy.offer ?? "",
        acceptAction: strategy.action_successful_type ?? "",
        acceptUrl: strategy.action_successful_url ?? "",
        rejectAction: strategy.action_unsuccessful_type ?? "",
        rejectUrl: strategy.action_unsuccessful_url ?? "",
      });
      setShowUpsellModal(true);
    },
    [resetStrategyForm]
  );

  const closeUpsellModal = useCallback(() => {
    setShowUpsellModal(false);
    resetStrategyForm();
  }, [resetStrategyForm]);

  const loadStrategies = useCallback(async () => {
    if (!productId || !token) return;
    setStrategiesLoading(true);
    setStrategiesError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductStrategy(productId, token),
        "Carregando upsells"
      );
      console.log("Estratégias data:", data);
      setStrategies(data);
    } catch (error) {
      console.error("Erro ao carregar upsells:", error);
      setStrategiesError("Não foi possível carregar as estratégias agora.");
    } finally {
      setStrategiesLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void loadStrategies();
  }, [loadStrategies]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!showUpsellModal || !token) return;
      setProductsLoading(true);
      try {
        const data = await withLoading(
          () => productApi.listProducts({ page: 1, limit: 50 }, token),
          "Carregando produtos"
        );
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar produtos para estratégia:", error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    void loadProducts();
  }, [showUpsellModal, token, withLoading]);

  const handleCreateStrategy = useCallback(async () => {
    if (!productId || !token) return;
    if (!strategyForm.type || !strategyForm.productId) return;

    const payload: CreateProductStrategyRequest = {
      name: strategyForm.name.trim() || undefined,
      type: strategyForm.type,
      offer_id: strategyForm.productId,
      action_successful_type: strategyForm.acceptAction || "welcome",
      action_unsuccessful_type: strategyForm.rejectAction || "goodbye",
      action_successful_url: strategyForm.acceptUrl || undefined,
      action_unsuccessful_url: strategyForm.rejectUrl || undefined,
    };

    setSavingStrategy(true);
    try {
      if (editingStrategy?.id) {
        await withLoading(
          () => productApi.updateProductStrategy(productId, editingStrategy.id!, payload, token),
          "Atualizando estratégia"
        );
      } else {
        await withLoading(() => productApi.createProductStrategy(productId, payload, token), "Criando estratégia");
      }
      closeUpsellModal();
      await loadStrategies();
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
    } finally {
      setSavingStrategy(false);
    }
  }, [productId, token, strategyForm, withLoading, loadStrategies, editingStrategy, closeUpsellModal]);

  const handleDeleteStrategy = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingStrategy(true);
    try {
      await productApi.deleteProductStrategy(productId, deleteTarget.id, token);
      setDeleteTarget(null);
      await loadStrategies();
    } catch (error) {
      console.error("Erro ao excluir estratégia:", error);
    } finally {
      setDeletingStrategy(false);
    }
  }, [productId, token, deleteTarget, loadStrategies]);

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
        emptyMessage={strategiesLoading ? "Carregando..." : strategiesError || "Nenhuma estratégia cadastrada."}
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
            render: item => <span className="text-muted-foreground">{item.offer ?? "-"}</span>,
          },
          {
            id: "valor",
            header: "Valor",
            render: item => (
              <span className="font-semibold">
                {item.value !== undefined && item.value !== null ? item.value : "-"}
              </span>
            ),
          },
          {
            id: "script",
            header: "Script",
            render: item => (
              <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-[6px] text-[11px] font-semibold text-muted-foreground">
                {item.script ?? "-"}
              </span>
            ),
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
                <span className="text-foreground">Selecione o produto</span>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-[8px] border border-foreground/15 bg-card px-3 pr-9 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                    value={strategyForm.productId}
                    onChange={event =>
                      setStrategyForm(current => ({ ...current, productId: event.target.value }))
                    }
                    disabled={productsLoading || products.length === 0}
                  >
                    <option value="">
                      {productsLoading ? "Carregando produtos..." : "Selecione um produto"}
                    </option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name}
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

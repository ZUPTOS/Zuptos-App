'use client';

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { Coproducer, CreateCoproducerRequest } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function CoproducaoTab({ productId, token, withLoading }: Props) {
  const [coproducers, setCoproducers] = useState<Coproducer[]>([]);
  const [coproducersLoading, setCoproducersLoading] = useState(false);
  const [coproducersError, setCoproducersError] = useState<string | null>(null);
  const [selectedCoproducer, setSelectedCoproducer] = useState<Coproducer | null>(null);
  const [showCoproductionModal, setShowCoproductionModal] = useState(false);
  const [showCoproductionDetailModal, setShowCoproductionDetailModal] = useState(false);
  const [coproducerSaving, setCoproducerSaving] = useState(false);
  const [coproducerFormError, setCoproducerFormError] = useState<string | null>(null);
  const [coproducerForm, setCoproducerForm] = useState({
    name: "",
    email: "",
    commission: "",
    durationMonths: "",
    lifetime: false,
    shareSalesDetails: false,
    extendProductStrategies: false,
    splitInvoice: false,
  });

  useEffect(() => {
    const loadCoproducers = async () => {
      if (!productId || !token) return;
      setCoproducersLoading(true);
      setCoproducersError(null);
      try {
        const data = await withLoading(
          () => productApi.getCoproducersByProductId(productId, token),
          "Carregando coprodutores"
        );
        setCoproducers(data);
      } catch (error) {
        console.error("Erro ao carregar coprodutores:", error);
        setCoproducersError("Não foi possível carregar os coprodutores agora.");
      } finally {
        setCoproducersLoading(false);
      }
    };
    void loadCoproducers();
  }, [productId, token, withLoading]);

  const handleCreateCoproducer = async () => {
    if (!productId || !token) return;
    setCoproducerFormError(null);

    const commissionValue = Number(coproducerForm.commission);
    if (Number.isNaN(commissionValue)) {
      setCoproducerFormError("Informe uma comissão válida.");
      return;
    }

    const payload: CreateCoproducerRequest = {
      name: coproducerForm.name.trim(),
      email: coproducerForm.email.trim(),
      duration_months: coproducerForm.lifetime ? 0 : Number(coproducerForm.durationMonths || 0),
      revenue_share_percentage: commissionValue,
      share_sales_details: Boolean(coproducerForm.shareSalesDetails),
      extend_product_strategies: Boolean(coproducerForm.extendProductStrategies),
      split_invoice: Boolean(coproducerForm.splitInvoice),
    };

    setCoproducerSaving(true);
    try {
      console.log("[coproducer] Enviando criação:", payload);
      const response = await withLoading(
        () => productApi.createCoproducer(productId, payload, token),
        "Criando coprodutor"
      );
      console.log("[coproducer] Resposta do servidor:", response);
      const refreshed = await productApi.getCoproducersByProductId(productId, token);
      setCoproducers(refreshed);
      setCoproducerForm({
        name: "",
        email: "",
        commission: "",
        durationMonths: "",
        lifetime: false,
        shareSalesDetails: false,
        extendProductStrategies: false,
        splitInvoice: false,
      });
      setShowCoproductionModal(false);
    } catch (error) {
      console.error("Erro ao criar coprodutor:", error);
      setCoproducerFormError("Não foi possível criar o coprodutor.");
    } finally {
      setCoproducerSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Coprodução</h2>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Buscar coprodutor"
              disabled
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
          {coproducersLoading &&
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-5 items-center gap-4 px-4 py-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <div className="flex justify-end">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          {!coproducersLoading && coproducersError && (
            <div className="px-4 py-4 text-sm text-rose-300">{coproducersError}</div>
          )}
          {!coproducersLoading && !coproducersError && coproducers.length === 0 && (
            <div className="px-4 py-4 text-sm text-muted-foreground">Nenhum coprodutor encontrado.</div>
          )}
          {!coproducersLoading &&
            !coproducersError &&
            coproducers.map(item => {
              const name = item.name || item.email || "—";
              const startDate = item.start_at || item.start || item.created_at || "";
              const commissionValue =
                item.commission ?? item.commission_percentage ?? (typeof item.status === "number" ? item.status : undefined);
              const commission =
                commissionValue !== undefined
                  ? typeof commissionValue === "number"
                    ? `${commissionValue}%`
                    : String(commissionValue)
                  : "—";
              const duration = item.duration || "—";
              const status = item.status || "—";
              return (
                <button
                  key={item.id ?? `${name}-${status}`}
                  type="button"
                  onClick={() => {
                    setSelectedCoproducer(item);
                    setShowCoproductionDetailModal(true);
                  }}
                  className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-left text-sm text-foreground transition hover:bg-card/60"
                >
                  <span className="font-semibold uppercase">{name}</span>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "—"}
                    </p>
                    <p className="text-[11px] uppercase tracking-wide"> </p>
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">{commission}</p>
                    <p className="text-[11px]">Vendas produtor</p>
                  </div>
                  <span className="font-semibold">{duration}</span>
                  <div className="flex justify-end">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                      {status}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

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
                  value={coproducerForm.name}
                  onChange={event => setCoproducerForm(prev => ({ ...prev, name: event.target.value }))}
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">E-mail</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="E-mail"
                  value={coproducerForm.email}
                  onChange={event => setCoproducerForm(prev => ({ ...prev, email: event.target.value }))}
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Porcentagem de comissão</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="10%"
                  value={coproducerForm.commission}
                  onChange={event => setCoproducerForm(prev => ({ ...prev, commission: event.target.value }))}
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Duração do contrato</p>
                <div className="flex flex-col gap-2 text-sm text-foreground">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-foreground/30 bg-card"
                      checked={coproducerForm.lifetime}
                      onChange={event => setCoproducerForm(prev => ({ ...prev, lifetime: event.target.checked }))}
                    />
                    Vitalício
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-foreground/30 bg-card"
                      checked={!coproducerForm.lifetime}
                      onChange={event => setCoproducerForm(prev => ({ ...prev, lifetime: !event.target.checked }))}
                    />
                    Período determinado
                    <input
                      className="h-10 w-16 rounded-[8px] border border-foreground/15 bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="0"
                      value={coproducerForm.durationMonths}
                      onChange={event => setCoproducerForm(prev => ({ ...prev, durationMonths: event.target.value }))}
                      disabled={coproducerForm.lifetime}
                    />
                    <span>mês(es)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Preferências</p>
                {[
                  {
                    key: "shareSalesDetails",
                    label: "Compartilhar os dados do comprador com o coprodutor",
                    value: coproducerForm.shareSalesDetails,
                  },
                  {
                    key: "extendProductStrategies",
                    label: "Estender comissões: Order Bumps, Upsells e downsell",
                    value: coproducerForm.extendProductStrategies,
                  },
                  {
                    key: "splitInvoice",
                    label: "Dividir responsabilidades de emissão de notas fiscais",
                    value: coproducerForm.splitInvoice,
                  },
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{field.label}</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        field.value ? "bg-primary/70" : "bg-muted"
                      }`}
                      onClick={() =>
                        setCoproducerForm(prev => ({
                          ...prev,
                          [field.key]:
                            field.key === "shareSalesDetails"
                              ? !prev.shareSalesDetails
                              : field.key === "extendProductStrategies"
                                ? !prev.extendProductStrategies
                                : !prev.splitInvoice,
                        }))
                      }
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${
                          field.value ? "left-[calc(100%-18px)]" : "left-[6px]"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {coproducerFormError && (
                <div className="rounded-[8px] border border-rose-900/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
                  {coproducerFormError}
                </div>
              )}

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
                  onClick={() => void handleCreateCoproducer()}
                  disabled={
                    coproducerSaving ||
                    !coproducerForm.name.trim() ||
                    !coproducerForm.email.trim() ||
                    !coproducerForm.commission
                  }
                >
                  {coproducerSaving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoproductionDetailModal && selectedCoproducer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSelectedCoproducer(null);
              setShowCoproductionDetailModal(false);
            }}
            aria-label="Fechar detalhes coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {selectedCoproducer.name || selectedCoproducer.email || "Coprodutor"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedCoproducer(null);
                  setShowCoproductionDetailModal(false);
                }}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Nome</span>
                  <span className="text-muted-foreground">
                    {selectedCoproducer.name || selectedCoproducer.email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">E-mail</span>
                  <span className="text-muted-foreground">{selectedCoproducer.email || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Porcentagem de comissão</span>
                  <span className="text-muted-foreground">
                    {selectedCoproducer.commission_percentage !== undefined
                      ? `${selectedCoproducer.commission_percentage}%`
                      : selectedCoproducer.commission ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Início</span>
                  <span className="text-muted-foreground">
                    {selectedCoproducer.start_at || selectedCoproducer.start || selectedCoproducer.created_at || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Duração</span>
                  <span className="text-muted-foreground">{selectedCoproducer.duration || "—"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Status:</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                    {selectedCoproducer.status || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => {
                    setSelectedCoproducer(null);
                    setShowCoproductionDetailModal(false);
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

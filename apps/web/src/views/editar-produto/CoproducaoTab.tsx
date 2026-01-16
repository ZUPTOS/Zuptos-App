'use client';

import { Pencil, Search, Trash2 } from "lucide-react";
import type { Coproducer } from "@/lib/api";
import PaginatedTable from "@/shared/components/PaginatedTable";
import { useCoproducers } from "./hooks/useCoproducers";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function CoproducaoTab({ productId, token, withLoading }: Props) {
  const {
    coproducers,
    coproducersLoading,
    coproducersError,
    selectedCoproducer,
    showCoproductionModal,
    showCoproductionDetailModal,
    coproducerSaving,
    coproducerFormError,
    editingCoproducer,
    deleteTarget,
    deletingCoproducer,
    coproducerForm,
    setCoproducerForm,
    setDeleteTarget,
    openCreateCoproducer,
    closeCoproductionModal,
    openEditCoproducer,
    handleSaveCoproducer,
    handleDeleteCoproducer,
    openDetailModal,
    closeDetailModal,
  } = useCoproducers({ productId, token, withLoading });

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
            onClick={openCreateCoproducer}
          >
            Adicionar
          </button>
        </div>
      </div>

      <PaginatedTable<Coproducer>
        data={coproducers}
        rowsPerPage={6}
        rowKey={item => item.id ?? item.email ?? item.name ?? Math.random().toString()}
        isLoading={coproducersLoading}
        emptyMessage={coproducersError || "Nenhum coprodutor encontrado."}
        wrapperClassName="space-y-3"
        tableContainerClassName="rounded-[12px] border border-foreground/10 bg-card/80"
        headerRowClassName="text-foreground"
        tableClassName="text-left"
        onRowClick={openDetailModal}
        columns={[
          {
            id: "nome",
            header: "Nome",
            render: item => (
              <span className="font-semibold uppercase">{item.name || item.email || "—"}</span>
            ),
          },
          {
            id: "email",
            header: "E-mail",
            render: item => <span className="text-muted-foreground">{item.email || "—"}</span>,
          },
          {
            id: "comissao",
            header: "Comissão",
            render: item => {
              const commissionValue =
                item.revenue_share_percentage ??
                item.commission_percentage ??
                (typeof item.commission === "number" ? item.commission : Number(item.commission));
              return (
                <span className="font-semibold text-foreground">
                  {Number.isNaN(commissionValue) || commissionValue === undefined ? "—" : `${commissionValue}%`}
                </span>
              );
            },
          },
          {
            id: "duracao",
            header: "Duração",
            render: item => {
              if (item.duration_months === 0) return <span className="font-semibold">Vitalício</span>;
              if (item.duration_months) return <span className="font-semibold">{item.duration_months} mês(es)</span>;
              return <span className="font-semibold">{item.duration || "—"}</span>;
            },
          },
          {
            id: "status",
            header: "Status",
            render: item => (
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                {item.status || "—"}
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
                  onClick={event => {
                    event.stopPropagation();
                    openEditCoproducer(item);
                  }}
                  aria-label="Editar coprodutor"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-rose-500/30 bg-rose-500/10 text-rose-200 transition hover:border-rose-500/60"
                  onClick={event => {
                    event.stopPropagation();
                    setDeleteTarget(item);
                  }}
                  aria-label="Excluir coprodutor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {showCoproductionModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closeCoproductionModal}
            aria-label="Fechar modal coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {editingCoproducer ? "Atualizar coprodutor" : "Convite de coprodução"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  closeCoproductionModal();
                }}
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
                  onClick={closeCoproductionModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => void handleSaveCoproducer()}
                  disabled={
                    coproducerSaving ||
                    !coproducerForm.name.trim() ||
                    !coproducerForm.email.trim() ||
                    !coproducerForm.commission
                  }
                >
                  {coproducerSaving ? "Salvando..." : editingCoproducer ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[12px] border border-foreground/10 bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-foreground">Excluir coprodutor?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja excluir este coprodutor? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingCoproducer}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,71,87,0.35)] transition hover:bg-rose-500/90"
                onClick={handleDeleteCoproducer}
                disabled={deletingCoproducer}
              >
                {deletingCoproducer ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCoproductionDetailModal && selectedCoproducer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closeDetailModal}
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
                  closeDetailModal();
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
                  onClick={closeDetailModal}
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

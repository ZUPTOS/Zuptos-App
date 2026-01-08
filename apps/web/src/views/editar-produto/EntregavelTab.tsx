'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductDeliverable } from "@/lib/api";
import { notify } from "@/components/ui/notification-toast";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const formatSize = (size?: number) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function EntregavelTab({ productId, token, withLoading }: Props) {
  const [deliverables, setDeliverables] = useState<ProductDeliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableTab, setDeliverableTab] = useState<"arquivo" | "link">("arquivo");
  const [deliverableName, setDeliverableName] = useState("");
  const [deliverableContent, setDeliverableContent] = useState("");
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableFormError, setDeliverableFormError] = useState<string | null>(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<ProductDeliverable | null>(null);
  const [loadingDeliverable, setLoadingDeliverable] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDeliverable | null>(null);
  const [deletingDeliverable, setDeletingDeliverable] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(editingDeliverable);

  const load = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getDeliverablesByProductId(productId, token),
        "Carregando entregáveis"
      );
      console.log("Entregáveis carregados:", data);
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as { data?: ProductDeliverable[] } | null)?.data)
          ? (data as { data: ProductDeliverable[] }).data
          : [];
      setDeliverables(list);
    } catch (err) {
      console.error("Erro ao carregar entregáveis:", err);
      setError("Não foi possível carregar os entregáveis agora.");
    } finally {
      setLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const resetDeliverableForm = useCallback(() => {
    setDeliverableName("");
    setDeliverableContent("");
    setDeliverableFile(null);
    setDeliverableFormError(null);
    setDeliverableTab("arquivo");
    setEditingDeliverable(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openCreateDeliverable = useCallback(() => {
    resetDeliverableForm();
    setShowDeliverableModal(true);
  }, [resetDeliverableForm]);

  const openEditDeliverable = useCallback(
    async (deliverableId: string) => {
      if (!productId || !token) return;
      setLoadingDeliverable(true);
      setDeliverableFormError(null);
      try {
        const data = await withLoading(
          () => productApi.getDeliverableById(productId, deliverableId, token),
          "Carregando entregável"
        );
        console.log("Entregável carregado:", data);
        setEditingDeliverable(data);
        setDeliverableTab((data.type ?? "file").toLowerCase() === "link" ? "link" : "arquivo");
        setDeliverableName("");
        setDeliverableContent("");
        setDeliverableFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setShowDeliverableModal(true);
      } catch (err) {
        console.error("Erro ao carregar entregável:", err);
        setDeliverableFormError("Não foi possível carregar o entregável selecionado.");
      } finally {
        setLoadingDeliverable(false);
      }
    },
    [productId, token, withLoading]
  );

  const closeDeliverableModal = useCallback(() => {
    setShowDeliverableModal(false);
    resetDeliverableForm();
  }, [resetDeliverableForm]);

  const handleCreateDeliverable = async () => {
    if (!productId || !token) return;
    const trimmedName = deliverableName.trim() || "Entregável";
    const trimmedContent = deliverableContent.trim();

    if (deliverableTab === "link" && !trimmedContent) {
      setDeliverableFormError("Preencha o link do entregável.");
      return;
    }

    if (deliverableTab === "arquivo" && !deliverableFile) {
      setDeliverableFormError("Selecione um arquivo para enviar.");
      return;
    }

    const payload =
      deliverableTab === "link"
        ? {
            name: trimmedName,
            type: "link",
            status: "active",
            content: trimmedContent,
          }
        : {
            name: trimmedName,
            type: "file",
            status: "active",
            size: deliverableFile?.size,
            content: trimmedContent || undefined,
          };

    setSavingDeliverable(true);
    setDeliverableFormError(null);
    try {
      console.log("[productApi] Enviando criação de entregável:", payload);
      const response = await productApi.createDeliverable(productId, payload, token);
      console.log("[productApi] Resposta do servidor (entregável):", response);
      if (deliverableTab === "arquivo" && deliverableFile) {
        try {
          await productApi.uploadDeliverableFile(productId, response.id, deliverableFile, token);
        } catch (uploadError) {
          console.error("Erro ao enviar arquivo do entregável:", uploadError);
        }
      }
      setRefreshKey(prev => prev + 1);
      closeDeliverableModal();
    } catch (err) {
      console.error("Erro ao criar entregável:", err);
      setDeliverableFormError("Não foi possível salvar o entregável.");
    } finally {
      setSavingDeliverable(false);
    }
  };

  const handleUpdateDeliverable = async () => {
    if (!productId || !token || !editingDeliverable) return;
    const trimmedName = deliverableName.trim();
    const trimmedContent = deliverableContent.trim();
    const nextType = deliverableTab === "link" ? "link" : "file";
    const currentType = (editingDeliverable.type ?? "").toLowerCase();

    if (nextType === "link" && !trimmedContent && !editingDeliverable.content) {
      setDeliverableFormError("Preencha o link do entregável.");
      return;
    }

    if (nextType === "file" && !deliverableFile && currentType !== "file") {
      setDeliverableFormError("Selecione um arquivo para enviar.");
      return;
    }

    const payload = {
      name: trimmedName || editingDeliverable.name || "Entregável",
      type: nextType,
      status: editingDeliverable.status ?? "active",
      content: trimmedContent || editingDeliverable.content || undefined,
      size: deliverableFile?.size ?? editingDeliverable.size,
    };

    setSavingDeliverable(true);
    setDeliverableFormError(null);
    try {
      console.log("[productApi] Enviando atualização de entregável:", payload);
      const response = await productApi.updateDeliverable(
        productId,
        editingDeliverable.id,
        payload,
        token
      );
      console.log("[productApi] Resposta do servidor (entregável):", response);
      if (deliverableTab === "arquivo" && deliverableFile) {
        try {
          await productApi.uploadDeliverableFile(productId, editingDeliverable.id, deliverableFile, token);
        } catch (uploadError) {
          console.error("Erro ao enviar arquivo do entregável:", uploadError);
        }
      }
      notify.success("Entregável atualizado");
      setRefreshKey(prev => prev + 1);
      closeDeliverableModal();
    } catch (err) {
      console.error("Erro ao atualizar entregável:", err);
      setDeliverableFormError("Não foi possível atualizar o entregável.");
    } finally {
      setSavingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingDeliverable(true);
    try {
      await productApi.deleteDeliverable(productId, deleteTarget.id, token);
      notify.success("Entregável deletado");
      setRefreshKey(prev => prev + 1);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao excluir entregável:", err);
    } finally {
      setDeletingDeliverable(false);
    }
  };

  return (
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
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
            onClick={openCreateDeliverable}
          >
            Adicionar arquivo
          </button>
        </div>
      </div>

        <PaginatedTable
          data={deliverables}
          rowsPerPage={6}
          rowKey={item => item.id ?? item.name ?? Math.random().toString()}
          isLoading={loading}
          emptyMessage={error || "Nenhum entregável cadastrado."}
          wrapperClassName="space-y-3"
          tableContainerClassName="rounded-[10px] border border-foreground/10 bg-card"
          headerRowClassName="bg-card/60"
          tableClassName="text-left"
          columns={[
            {
              id: "nome",
              header: "Nome",
              render: item => {
                const raw = item as unknown as Record<string, unknown>;
                const name =
                  item.name ??
                  (typeof raw.title === "string" ? raw.title : undefined) ??
                  (typeof raw.display_name === "string" ? raw.display_name : undefined) ??
                  (typeof raw.filename === "string" ? raw.filename : undefined);
                return <p className="text-sm font-medium capitalize">{name || "Entregável"}</p>;
              },
            },
            {
              id: "conteudo",
              header: "Entregável",
              render: item => {
                if (!item.content) return <span className="text-sm text-muted-foreground">-</span>;
                const typeValue = item.type ? item.type.toLowerCase() : "";
                const label = typeValue === "Link" ? "Link" : "Download";
                return (
                  <div className="flex items-center">
                    <a
                      href={item.content}
                      className="truncate rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/30"
                      target="_blank"
                      rel="noreferrer"
                      onClick={event => event.stopPropagation()}
                    >
                      {label}
                    </a>
                  </div>
                );
              },
            },
            {
              id: "tamanho",
              header: "Tamanho",
              render: item => <span className="text-sm text-muted-foreground">{formatSize(item.size)}</span>,
            },
            {
              id: "status",
              header: "Status",
              render: item => {
                const isActive = (item.status ?? "active").toLowerCase() === "active";
                return (
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/50"}`} aria-hidden />
                    <span className="font-medium text-foreground">{isActive ? "Ativo" : item.status ?? "-"}</span>
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
                    onClick={event => {
                      event.stopPropagation();
                      if (item.id) {
                        void openEditDeliverable(item.id);
                      }
                    }}
                    aria-label="Editar entregável"
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
                    aria-label="Excluir entregável"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />

      {showDeliverableModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closeDeliverableModal}
            aria-label="Fechar modal entregável"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {isEditing ? "Atualizar entregável" : deliverableTab === "arquivo" ? "Adicionar entregável" : "Link de acesso"}
              </h2>
              <button
                type="button"
                onClick={closeDeliverableModal}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-5 pb-10">
              {loadingDeliverable && (
                <p className="rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                  Carregando dados do entregável...
                </p>
              )}
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
                  placeholder={editingDeliverable?.name ?? "Digite um nome"}
                  value={deliverableName}
                  onChange={event => setDeliverableName(event.target.value)}
                />
              </label>

              {deliverableTab === "arquivo" && (
                <div className="rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/10" />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="text-sm text-foreground">Selecione um arquivo ou arraste e solte aqui</p>
                      <p>JPG, PNG, PDF ou ZIP, não superior a 50 MB</p>
                      {isEditing && editingDeliverable?.name && (
                        <p className="text-[11px] text-muted-foreground">Arquivo atual: {editingDeliverable.name}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ml-auto rounded-[8px] border border-foreground/20 px-3 py-2 text-xs font-semibold text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Selecionar
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={event => {
                        const file = event.target.files?.[0];
                        setDeliverableFile(file ?? null);
                        if (file && !deliverableName.trim()) {
                          setDeliverableName(file.name);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {deliverableTab === "link" && (
                <label className="space-y-3 text-sm text-muted-foreground">
                  <span className="text-foreground">Link de acesso</span>
                  <input
                    className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder={editingDeliverable?.content ?? "Inserir link"}
                    value={deliverableContent}
                    onChange={event => setDeliverableContent(event.target.value)}
                  />
                </label>
              )}

              {deliverableFormError && <p className="text-sm text-rose-300">{deliverableFormError}</p>}

              <div className="flex items-center justify-end gap-3 pt-4">
                {!isEditing && (
                  <button
                    type="button"
                    className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                    onClick={closeDeliverableModal}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={isEditing ? handleUpdateDeliverable : handleCreateDeliverable}
                  disabled={savingDeliverable}
                >
                  {savingDeliverable ? "Salvando..." : isEditing ? "Atualizar entregável" : "Adicionar"}
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
            <h3 className="text-lg font-semibold text-foreground">Excluir entregável</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Deseja excluir o entregável <span className="font-semibold text-foreground">{deleteTarget.name || "sem nome"}</span>?
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
                onClick={handleDeleteDeliverable}
                disabled={deletingDeliverable}
              >
                {deletingDeliverable ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

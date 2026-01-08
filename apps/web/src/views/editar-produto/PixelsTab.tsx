'use client';

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pencil, Search, Trash2 } from "lucide-react";
import { productApi, ProviderTrackingName, TrackingStatus, TrackingType } from "@/lib/api";
import type { CreateProductTrackingRequest, ProductPlan } from "@/lib/api";
import ToggleActive from "@/components/ToggleActive";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const defaultEvents = {
  add_to_cart: true,
  initiate_checkout: true,
  add_payment_info: true,
  purchase: true,
};

export function PixelsTab({ productId, token, withLoading }: Props) {
  const [trackings, setTrackings] = useState<ProductPlan[]>([]);
  const [trackingsLoading, setTrackingsLoading] = useState(false);
  const [trackingsError, setTrackingsError] = useState<string | null>(null);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [pixelsRefreshKey, setPixelsRefreshKey] = useState(0);
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [editingTracking, setEditingTracking] = useState<ProductPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductPlan | null>(null);
  const [deletingTracking, setDeletingTracking] = useState(false);
  const [trackingStep, setTrackingStep] = useState<"platform" | "form">("platform");
  const [trackingPlatform, setTrackingPlatform] = useState<ProviderTrackingName | null>(null);

  const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.DEFAULT);
  const [trackingName, setTrackingName] = useState("");
  const [trackingPixelId, setTrackingPixelId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(TrackingStatus.ACTIVE);
  const [trackingEvents, setTrackingEvents] = useState(defaultEvents);

  const resolvePlatform = useCallback((pixel: ProductPlan): ProviderTrackingName | null => {
    const raw = (pixel.provider_tracking_name ?? pixel.platform ?? "").toString().toLowerCase();
    if (!raw) return null;
    if (raw.includes("google")) return ProviderTrackingName.GOOGLE;
    if (raw.includes("face")) return ProviderTrackingName.FACEBOOK;
    if (raw.includes("tiktok")) return ProviderTrackingName.TIKTOK;
    return null;
  }, []);

  const platformAssets: Record<ProviderTrackingName, { label: string; src: string }> = {
    [ProviderTrackingName.GOOGLE]: { label: "Google Ads", src: "/images/editar-produtos/pixel/googleAds.png" },
    [ProviderTrackingName.FACEBOOK]: { label: "Facebook", src: "/images/editar-produtos/pixel/facebook.png" },
    [ProviderTrackingName.TIKTOK]: { label: "TikTok", src: "/images/editar-produtos/pixel/tiktok.png" },
  };

  const resetForm = useCallback(() => {
    setTrackingStep("platform");
    setTrackingPlatform(null);
    setTrackingType(TrackingType.DEFAULT);
    setTrackingName("");
    setTrackingPixelId("");
    setTrackingToken("");
    setTrackingStatus(TrackingStatus.ACTIVE);
    setTrackingEvents(defaultEvents);
    setEditingTracking(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    resetForm();
    setShowPixelModal(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setShowPixelModal(false);
    resetForm();
  }, [resetForm]);

  const loadTrackings = useCallback(async () => {
    if (!productId || !token) return;
    setTrackingsLoading(true);
    setTrackingsError(null);
    try {
      const data = await withLoading(
        () => productApi.getPlansByProductId(productId, token),
        "Carregando pixels"
      );
      setTrackings(data);
      console.log("data", data)
    } catch (error) {
      console.error("Erro ao carregar pixels:", error);
      setTrackingsError("Não foi possível carregar os pixels agora.");
    } finally {
      setTrackingsLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void loadTrackings();
  }, [loadTrackings, pixelsRefreshKey]);

  const handleSaveTracking = useCallback(async () => {
    if (!productId || !token) return;
    if (!trackingPlatform) return;
    if (!trackingName.trim() || !trackingPixelId.trim()) return;
    if (trackingType === TrackingType.API && !trackingToken.trim()) return;

    const payload: CreateProductTrackingRequest = {
      name: trackingName.trim(),
      type: trackingType,
      status: trackingStatus,
      provider_tracking_name: trackingPlatform,
      provider_tracking_id: trackingPixelId.trim(),
      token_api_connection: trackingType === TrackingType.API ? trackingToken.trim() : undefined,
      add_to_cart: trackingEvents.add_to_cart,
      initiate_checkout: trackingEvents.initiate_checkout,
      add_payment_info: trackingEvents.add_payment_info,
      purchase: trackingEvents.purchase,
    };

    setTrackingSaving(true);
    try {
      if (editingTracking?.id) {
        await withLoading(
          () => productApi.updateTracking(productId, editingTracking.id, payload, token),
          "Atualizando pixel"
        );
      } else {
        await withLoading(() => productApi.createPlan(productId, payload, token), "Criando pixel");
      }
      setPixelsRefreshKey(prev => prev + 1);
      resetForm();
      setShowPixelModal(false);
    } catch (error) {
      console.error("Erro ao salvar pixel:", error);
    } finally {
      setTrackingSaving(false);
    }
  }, [
    productId,
    token,
    trackingPlatform,
    editingTracking,
    trackingName,
    trackingPixelId,
    trackingType,
    trackingToken,
    trackingStatus,
    trackingEvents,
    withLoading,
    resetForm,
  ]);

  const openEditTracking = useCallback((tracking: ProductPlan) => {
    const platform = resolvePlatform(tracking) ?? ProviderTrackingName.GOOGLE;
    setTrackingPlatform(platform);
    setTrackingStep("form");
    setTrackingType(
      (tracking.type ?? "").toString().toLowerCase() === TrackingType.API
        ? TrackingType.API
        : TrackingType.DEFAULT
    );
    setTrackingStatus(
      (tracking.status ?? "").toString().toLowerCase() === TrackingStatus.INACTIVE
        ? TrackingStatus.INACTIVE
        : TrackingStatus.ACTIVE
    );
    setTrackingName(tracking.name ?? "");
    setTrackingPixelId(tracking.provider_tracking_id ?? tracking.pixel_id ?? "");
    setTrackingToken(tracking.token_api_connection ?? "");
    setTrackingEvents({
      add_to_cart: tracking.add_to_cart ?? defaultEvents.add_to_cart,
      initiate_checkout: tracking.initiate_checkout ?? defaultEvents.initiate_checkout,
      add_payment_info: tracking.add_payment_info ?? defaultEvents.add_payment_info,
      purchase: tracking.purchase ?? defaultEvents.purchase,
    });
    setEditingTracking(tracking);
    setShowPixelModal(true);
  }, [resolvePlatform]);

  const handleDeleteTracking = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingTracking(true);
    try {
      await withLoading(
        () => productApi.deleteTracking(productId, deleteTarget.id, token),
        "Excluindo pixel"
      );
      setDeleteTarget(null);
      setPixelsRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao excluir pixel:", error);
    } finally {
      setDeletingTracking(false);
    }
  }, [productId, token, deleteTarget, withLoading]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pixels de rastreamento</h2>
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
            onClick={handleOpenModal}
          >
            Adicionar
          </button>
        </div>
      </div>

      <PaginatedTable<ProductPlan>
        data={trackings}
        rowsPerPage={6}
        rowKey={item => item.id ?? item.provider_tracking_id ?? Math.random().toString()}
        isLoading={trackingsLoading}
        emptyMessage={trackingsError || "Nenhum pixel cadastrado."}
        wrapperClassName="space-y-3"
        tableContainerClassName="rounded-[12px] border border-foreground/10 bg-card/80"
        headerRowClassName="text-foreground"
        tableClassName="text-left"
        columns={[
          {
            id: "nome",
            header: "Nome",
            render: item => <span className="font-semibold uppercase">{item.name || "PIXEL"}</span>,
          },
          {
            id: "id",
            header: "ID",
            render: item => (
              <span className="text-muted-foreground">
                {item.provider_tracking_id ?? item.pixel_id ?? item.id ?? "-"}
              </span>
            ),
          },
          {
            id: "plataforma",
            header: "Plataforma",
            render: item => {
              const platform = resolvePlatform(item);
              if (!platform) return <span className="text-muted-foreground">-</span>;
              const asset = platformAssets[platform];
              return (
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-black/40">
                    <Image src={asset.src} alt={asset.label} width={22} height={22} />
                  </div>
                  <span className="text-sm text-muted-foreground">{asset.label}</span>
                </div>
              );
            },
          },
          {
            id: "status",
            header: "Status",
            headerClassName: "text-right",
            cellClassName: "text-right",
            render: item => {
              const isActive =
                (item.status ?? TrackingStatus.ACTIVE).toString().toLowerCase() === TrackingStatus.ACTIVE;
              return (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                    isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </span>
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
                    openEditTracking(item);
                  }}
                  aria-label="Editar pixel"
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
                  aria-label="Excluir pixel"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {showPixelModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
            aria-label="Fechar modal pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {editingTracking ? "Atualizar Pixel" : "Cadastrar Pixel"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {trackingStep === "platform"
                    ? "Selecione a plataforma que deseja cadastrar."
                    : "Preencha as informações."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              {trackingStep === "platform" ? (
                <>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setTrackingPlatform(ProviderTrackingName.GOOGLE)}
                      className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left transition ${
                        trackingPlatform === ProviderTrackingName.GOOGLE
                          ? "border-primary/60 bg-primary/10"
                          : "border-foreground/10 bg-card"
                      }`}
                      aria-pressed={trackingPlatform === ProviderTrackingName.GOOGLE}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-black/40">
                          <Image
                            src="/images/editar-produtos/pixel/googleAds.png"
                            alt="Google Ads"
                            width={28}
                            height={28}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Google Ads</span>
                      </div>
                      <span
                        className={`h-5 w-5 rounded-full border ${
                          trackingPlatform === ProviderTrackingName.GOOGLE
                            ? "border-primary/60 bg-primary"
                            : "border-foreground/30"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrackingPlatform(ProviderTrackingName.FACEBOOK)}
                      className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left transition ${
                        trackingPlatform === ProviderTrackingName.FACEBOOK
                          ? "border-primary/60 bg-primary/10"
                          : "border-foreground/10 bg-card"
                      }`}
                      aria-pressed={trackingPlatform === ProviderTrackingName.FACEBOOK}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-black/40">
                          <Image
                            src="/images/editar-produtos/pixel/facebook.png"
                            alt="Facebook"
                            width={28}
                            height={28}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Facebook</span>
                      </div>
                      <span
                        className={`h-5 w-5 rounded-full border ${
                          trackingPlatform === ProviderTrackingName.FACEBOOK
                            ? "border-primary/60 bg-primary"
                            : "border-foreground/30"
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrackingPlatform(ProviderTrackingName.TIKTOK)}
                      className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left transition ${
                        trackingPlatform === ProviderTrackingName.TIKTOK
                          ? "border-primary/60 bg-primary/10"
                          : "border-foreground/10 bg-card"
                      }`}
                      aria-pressed={trackingPlatform === ProviderTrackingName.TIKTOK}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-black/40">
                          <Image
                            src="/images/editar-produtos/pixel/tiktok.png"
                            alt="TikTok"
                            width={28}
                            height={28}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">TikTok</span>
                      </div>
                      <span
                        className={`h-5 w-5 rounded-full border ${
                          trackingPlatform === ProviderTrackingName.TIKTOK
                            ? "border-primary/60 bg-primary"
                            : "border-foreground/30"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => setTrackingStep("form")}
                      disabled={!trackingPlatform}
                    >
                      Prosseguir
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {trackingPlatform && (
                    <div className="flex items-center justify-between rounded-[10px] border border-foreground/10 bg-card px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-black/40">
                          <Image
                            src={platformAssets[trackingPlatform].src}
                            alt={platformAssets[trackingPlatform].label}
                            width={22}
                            height={22}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {platformAssets[trackingPlatform].label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTrackingStep("platform")}
                        className="text-xs font-semibold text-primary"
                      >
                        Alterar
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Tipo</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTrackingType(TrackingType.DEFAULT)}
                        className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                          trackingType === TrackingType.DEFAULT
                            ? "border-foreground/20 bg-[#d9d9d9] text-black"
                            : "border-foreground/10 bg-card text-muted-foreground"
                        }`}
                      >
                        Padrão
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrackingType(TrackingType.API)}
                        className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                          trackingType === TrackingType.API
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
                      value={trackingName}
                      onChange={event => setTrackingName(event.target.value)}
                    />
                  </label>

                  <label className="space-y-2 text-sm text-muted-foreground">
                    <span className="text-foreground">Pixel Id</span>
                    <input
                      className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Digite um nome"
                      value={trackingPixelId}
                      onChange={event => setTrackingPixelId(event.target.value)}
                    />
                  </label>

                  {trackingType === TrackingType.API && (
                    <label className="space-y-2 text-sm text-muted-foreground">
                      <span className="text-foreground">Token API</span>
                      <input
                        className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Digite o token"
                        value={trackingToken}
                        onChange={event => setTrackingToken(event.target.value)}
                      />
                    </label>
                  )}

                  <div className="flex items-center justify-between pt-2 text-sm font-semibold text-foreground">
                    <span>Status</span>
                    <div className="flex items-center gap-2">
                      <ToggleActive
                        checked={trackingStatus === TrackingStatus.ACTIVE}
                        onCheckedChange={checked =>
                          setTrackingStatus(checked ? TrackingStatus.ACTIVE : TrackingStatus.INACTIVE)
                        }
                        aria-label="Alternar status do pixel"
                      />
                      <span className="text-xs text-muted-foreground">
                        {trackingStatus === TrackingStatus.ACTIVE ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Configure eventos do pixel</p>
                      <p className="text-xs text-muted-foreground">Registro e otimização de conversões.</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                      <span>Adicionar um item ao carrinho (AddToCart)</span>
                      <ToggleActive
                        checked={trackingEvents.add_to_cart}
                        onCheckedChange={checked => setTrackingEvents(prev => ({ ...prev, add_to_cart: checked }))}
                        aria-label="Alternar evento AddToCart"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                      <span>Iniciar finalização da compra (InitiateCheckout)</span>
                      <ToggleActive
                        checked={trackingEvents.initiate_checkout}
                        onCheckedChange={checked => setTrackingEvents(prev => ({ ...prev, initiate_checkout: checked }))}
                        aria-label="Alternar evento InitiateCheckout"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                      <span>Adicionar dados de pagamento (AddPaymentinfo)</span>
                      <ToggleActive
                        checked={trackingEvents.add_payment_info}
                        onCheckedChange={checked => setTrackingEvents(prev => ({ ...prev, add_payment_info: checked }))}
                        aria-label="Alternar evento AddPaymentInfo"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                      <span>Compra (Purchase)</span>
                      <ToggleActive
                        checked={trackingEvents.purchase}
                        onCheckedChange={checked => setTrackingEvents(prev => ({ ...prev, purchase: checked }))}
                        aria-label="Alternar evento Purchase"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={handleSaveTracking}
                  disabled={
                    trackingSaving ||
                    !trackingName.trim() ||
                    !trackingPixelId.trim() ||
                    (trackingType === TrackingType.API && !trackingToken.trim())
                  }
                >
                  {trackingSaving ? "Salvando..." : editingTracking ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[12px] border border-foreground/10 bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-foreground">Excluir pixel?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja excluir este pixel? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingTracking}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,71,87,0.35)] transition hover:bg-rose-500/90"
                onClick={handleDeleteTracking}
                disabled={deletingTracking}
              >
                {deletingTracking ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

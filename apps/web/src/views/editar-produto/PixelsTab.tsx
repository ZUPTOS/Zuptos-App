'use client';

import Image from "next/image";
import { Pencil, Search, Trash2 } from "lucide-react";
import { ProviderTrackingName, TrackingStatus, TrackingType } from "@/lib/api";
import type { ProductPlan } from "@/lib/api";
import ToggleActive from "@/shared/components/ToggleActive";
import PaginatedTable from "@/shared/components/PaginatedTable";
import { usePixels } from "./hooks/usePixels";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function PixelsTab({ productId, token, withLoading }: Props) {
  const {
    trackings,
    trackingsLoading,
    trackingsError,
    showPixelModal,
    trackingSaving,
    editingTracking,
    deleteTarget,
    deletingTracking,
    trackingStep,
    trackingPlatform,
    trackingType,
    trackingName,
    trackingPixelId,
    trackingToken,
    trackingStatus,
    trackingEvents,
    resolvePlatform,
    setTrackingStep,
    setTrackingPlatform,
    setTrackingType,
    setTrackingName,
    setTrackingPixelId,
    setTrackingToken,
    setTrackingStatus,
    setTrackingEvents,
    setDeleteTarget,
    handleOpenModal,
    handleCloseModal,
    handleSaveTracking,
    openEditTracking,
    handleDeleteTracking,
  } = usePixels({ productId, token, withLoading });

  const platformAssets: Record<ProviderTrackingName, { label: string; src: string }> = {
    [ProviderTrackingName.GOOGLE]: { label: "Google Ads", src: "/images/editar-produtos/pixel/googleAds.png" },
    [ProviderTrackingName.FACEBOOK]: { label: "Facebook", src: "/images/editar-produtos/pixel/facebook.png" },
    [ProviderTrackingName.TIKTOK]: { label: "TikTok", src: "/images/editar-produtos/pixel/tiktok.png" },
  };

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

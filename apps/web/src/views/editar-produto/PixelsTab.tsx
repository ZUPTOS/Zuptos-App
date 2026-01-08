'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { CreateProductTrackingRequest, ProductPlan } from "@/lib/api";
import ToggleActive from "@/components/ToggleActive";
import { Skeleton } from "@/components/ui/skeleton";

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

  const [trackingType, setTrackingType] = useState<"default" | "api">("default");
  const [trackingName, setTrackingName] = useState("");
  const [trackingPixelId, setTrackingPixelId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<"active" | "inactive">("active");
  const [trackingEvents, setTrackingEvents] = useState(defaultEvents);

  const resetForm = useCallback(() => {
    setTrackingType("default");
    setTrackingName("");
    setTrackingPixelId("");
    setTrackingToken("");
    setTrackingStatus("active");
    setTrackingEvents(defaultEvents);
  }, []);

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

  const handleCreateTracking = useCallback(async () => {
    if (!productId || !token) return;
    if (!trackingName.trim() || !trackingPixelId.trim()) return;
    if (trackingType === "api" && !trackingToken.trim()) return;

    const payload: CreateProductTrackingRequest = {
      name: trackingName.trim(),
      type: trackingType,
      status: trackingStatus,
      provider_tracking_id: trackingPixelId.trim(),
      token_api_connection: trackingType === "api" ? trackingToken.trim() : undefined,
      add_to_cart: trackingEvents.add_to_cart,
      initiate_checkout: trackingEvents.initiate_checkout,
      add_payment_info: trackingEvents.add_payment_info,
      purchase: trackingEvents.purchase,
    };

    setTrackingSaving(true);
    try {
      await withLoading(() => productApi.createPlan(productId, payload, token), "Criando pixel");
      setPixelsRefreshKey(prev => prev + 1);
      resetForm();
      setShowPixelModal(false);
    } catch (error) {
      console.error("Erro ao criar pixel:", error);
    } finally {
      setTrackingSaving(false);
    }
  }, [
    productId,
    token,
    trackingName,
    trackingPixelId,
    trackingType,
    trackingToken,
    trackingStatus,
    trackingEvents,
    withLoading,
    resetForm,
  ]);

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
            onClick={() => setShowPixelModal(true)}
          >
            Adicionar
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
          {trackingsLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-end">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!trackingsLoading && trackingsError && (
            <div className="px-4 py-4 text-sm text-rose-300">{trackingsError}</div>
          )}
          {!trackingsLoading && !trackingsError && trackings.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum pixel cadastrado.</div>
          )}
          {!trackingsLoading &&
            !trackingsError &&
            trackings.map(pixel => {
              const typeLabel = pixel.type === "api" ? "API" : "Padrão";
              const trackingId = pixel.provider_tracking_id ?? pixel.pixel_id ?? pixel.id;
              const isActive = (pixel.status ?? "active").toLowerCase() === "active";
              return (
                <div key={pixel.id} className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground">
                  <span className="font-semibold uppercase">{pixel.name || "PIXEL"}</span>
                  <span className="text-muted-foreground">{trackingId ?? "-"}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">{typeLabel}</span>
                  <div className="flex justify-end">
                    <span className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/40 text-muted-foreground"}`}>
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {showPixelModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPixelModal(false)}
            aria-label="Fechar modal pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Cadastrar Pixel</h2>
                <p className="text-sm text-muted-foreground">Preencha as informações.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPixelModal(false)}
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
                    onClick={() => setTrackingType("default")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      trackingType === "default"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingType("api")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      trackingType === "api"
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

              {trackingType === "api" && (
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
                    checked={trackingStatus === "active"}
                    onCheckedChange={checked => setTrackingStatus(checked ? "active" : "inactive")}
                    aria-label="Alternar status do pixel"
                  />
                  <span className="text-xs text-muted-foreground">
                    {trackingStatus === "active" ? "Ativo" : "Inativo"}
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
                  onClick={() => setShowPixelModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={handleCreateTracking}
                  disabled={
                    trackingSaving ||
                    !trackingName.trim() ||
                    !trackingPixelId.trim() ||
                    (trackingType === "api" && !trackingToken.trim())
                  }
                >
                  {trackingSaving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

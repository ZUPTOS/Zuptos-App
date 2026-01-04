'use client';

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductPlan, SubscriptionPlanPayload } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function PixelsTab({ productId, token, withLoading }: Props) {
  const [plans, setPlans] = useState<ProductPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [showPixelFormModal, setShowPixelFormModal] = useState(false);
  const [selectedPixelPlatform, setSelectedPixelPlatform] = useState<string | null>(null);
  const [pixelsRefreshKey, setPixelsRefreshKey] = useState(0);
  const [planSaving, setPlanSaving] = useState(false);
  const [planForm, setPlanForm] = useState<{
    name: string;
    type: SubscriptionPlanPayload["type"];
    status: SubscriptionPlanPayload["status"];
    plan_price: string;
    normal_price: string;
    discount_price: string;
    cycles: string;
    price_first_cycle: string;
    default: boolean;
  }>({
    name: "",
    type: "monthly",
    status: "active",
    plan_price: "",
    normal_price: "",
    discount_price: "",
    cycles: "",
    price_first_cycle: "",
    default: false,
  });

  const loadPlans = useCallback(async () => {
    if (!productId || !token) return;
    setPlansLoading(true);
    setPlansError(null);
    try {
      const data = await withLoading(
        () => productApi.getPlansByProductId(productId, token),
        "Carregando pixels"
      );
      setPlans(data);
    } catch (error) {
      console.error("Erro ao carregar pixels:", error);
      setPlansError("Não foi possível carregar os pixels agora.");
    } finally {
      setPlansLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans, pixelsRefreshKey]);

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
          {plansLoading && (
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
          {!plansLoading && plansError && <div className="px-4 py-4 text-sm text-rose-300">{plansError}</div>}
          {!plansLoading && !plansError && plans.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum pixel cadastrado.</div>
          )}
          {!plansLoading &&
            !plansError &&
            plans.map(pixel => (
              <div key={pixel.id} className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground">
                <span className="font-semibold uppercase">{pixel.name || pixel.platform || "PIXEL"}</span>
                <span className="text-muted-foreground">{pixel.id}</span>
                <span className="flex items-center gap-2 text-muted-foreground">{pixel.platform ?? "-"}</span>
                <div className="flex justify-end">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                    {pixel.status ?? "Ativo"}
                  </span>
                </div>
              </div>
            ))}
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
                  { name: "Google Ads", icon: "/images/editar-produtos/pixel/googleAds.png" },
                  { name: "Facebook", icon: "/images/editar-produtos/pixel/facebook.png" },
                  { name: "TikTok", icon: "/images/editar-produtos/pixel/tiktok.png" },
                ].map(platform => {
                  const isActive = selectedPixelPlatform === platform.name;
                  return (
                    <label
                      key={platform.name}
                      className={`flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-sm text-muted-foreground transition ${
                        isActive
                          ? "border-primary/60 bg-primary/5"
                          : "border-foreground/15 bg-card/80 hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-foreground/10">
                          <Image src={platform.icon} alt={platform.name} width={32} height={32} className="object-contain" />
                        </div>
                        <span className="text-base text-foreground">{platform.name}</span>
                      </div>
                      <input
                        type="radio"
                        name="pixel-platform"
                        className="peer sr-only"
                        checked={isActive}
                        onChange={() => setSelectedPixelPlatform(platform.name)}
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isActive ? "border-primary bg-primary" : "border-foreground/25"
                        }`}
                      >
                        {isActive && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                    </label>
                  );
                })}
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
                    if (!selectedPixelPlatform) return;
                    setShowPixelModal(false);
                    setShowPixelFormModal(true);
                  }}
                  disabled={!selectedPixelPlatform}
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
                <select
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={planForm.type}
                  onChange={event =>
                    setPlanForm(prev => ({ ...prev, type: event.target.value as SubscriptionPlanPayload["type"] }))
                  }
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                  value={planForm.name}
                  onChange={event => setPlanForm(prev => ({ ...prev, name: event.target.value }))}
                />
              </label>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Preço do plano</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="ex: 19.99"
                  inputMode="decimal"
                  value={planForm.plan_price}
                  onChange={event => setPlanForm(prev => ({ ...prev, plan_price: event.target.value }))}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço normal</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 29.99"
                    inputMode="decimal"
                    value={planForm.normal_price}
                    onChange={event => setPlanForm(prev => ({ ...prev, normal_price: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço com desconto</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 9.99"
                    inputMode="decimal"
                    value={planForm.discount_price}
                    onChange={event => setPlanForm(prev => ({ ...prev, discount_price: event.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Ciclos</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 12"
                    inputMode="numeric"
                    value={planForm.cycles}
                    onChange={event => setPlanForm(prev => ({ ...prev, cycles: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço 1º ciclo</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 9.99"
                    inputMode="decimal"
                    value={planForm.price_first_cycle}
                    onChange={event => setPlanForm(prev => ({ ...prev, price_first_cycle: event.target.value }))}
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Status</span>
                <button
                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                    planForm.status === "active" ? "bg-primary/70" : "bg-muted"
                  }`}
                  type="button"
                  onClick={() =>
                    setPlanForm(prev => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                >
                  <span
                    className={`absolute h-4 w-4 rounded-full bg-white transition ${
                      planForm.status === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
                    }`}
                  />
                </button>
                <span className="text-muted-foreground capitalize">{planForm.status}</span>
              </div>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Padrão</span>
                <button
                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                    planForm.default ? "bg-primary/70" : "bg-muted"
                  }`}
                  type="button"
                  onClick={() =>
                    setPlanForm(prev => ({
                      ...prev,
                      default: !prev.default,
                    }))
                  }
                >
                  <span
                    className={`absolute h-4 w-4 rounded-full bg-white transition ${
                      planForm.default ? "left-[calc(100%-18px)]" : "left-[6px]"
                    }`}
                  />
                </button>
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
                  onClick={async () => {
                    if (!productId || !token) return;
                    if (!planForm.name.trim() || !planForm.plan_price) {
                      return;
                    }

                    const payload: SubscriptionPlanPayload = {
                      name: planForm.name.trim(),
                      type: planForm.type,
                      status: planForm.status,
                      plan_price: Number(planForm.plan_price),
                      normal_price: planForm.normal_price ? Number(planForm.normal_price) : undefined,
                      discount_price: planForm.discount_price ? Number(planForm.discount_price) : undefined,
                      cycles: planForm.cycles ? Number(planForm.cycles) : undefined,
                      price_first_cycle: planForm.price_first_cycle ? Number(planForm.price_first_cycle) : undefined,
                      default: planForm.default,
                    };

                    setPlanSaving(true);
                    try {
                      await withLoading(() => productApi.createPlan(productId, payload, token), "Criando pixel");
                      setPixelsRefreshKey(prev => prev + 1);
                      setPlanForm({
                        name: "",
                        type: "monthly",
                        status: "active",
                        plan_price: "",
                        normal_price: "",
                        discount_price: "",
                        cycles: "",
                        price_first_cycle: "",
                        default: false,
                      });
                      setShowPixelFormModal(false);
                      setSelectedPixelPlatform(null);
                    } catch (error) {
                      console.error("Erro ao criar pixel:", error);
                    } finally {
                      setPlanSaving(false);
                    }
                  }}
                  disabled={planSaving || !planForm.name.trim() || !planForm.plan_price}
                >
                  {planSaving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

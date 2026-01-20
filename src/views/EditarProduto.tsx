'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { productApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/shared/ui/skeleton";
import { CoproducaoTab } from "./editar-produto/CoproducaoTab";
import { CuponsTab } from "./editar-produto/CuponsTab";
import { UpsellTab } from "./editar-produto/UpsellTab";
import { PixelsTab } from "./editar-produto/PixelsTab";
import { ConfiguracoesTab } from "./editar-produto/ConfiguracoesTab";
import { CheckoutsTab } from "./editar-produto/CheckoutsTab";
import { OfertasTab } from "./editar-produto/OfertasTab";
import { EntregavelTab } from "./editar-produto/EntregavelTab";
import { readCache, writeCache } from "./editar-produto/hooks/tabCache";

const tabs = [
  "Entregável",
  "Ofertas",
  "Checkouts",
  "Configurações",
  "Pixels de rastreamento",
  "Upsell, downsell e mais",
  "Cupons",
  "Coprodução",
] as const;

type TabLabel = (typeof tabs)[number];

const tabSlugMap: Record<string, TabLabel> = {
  entregaveis: "Entregável",
  ofertas: "Ofertas",
  checkouts: "Checkouts",
  configuracoes: "Configurações",
  pixels: "Pixels de rastreamento",
  upsell: "Upsell, downsell e mais",
  cupons: "Cupons",
  coproducao: "Coprodução",
};

const tabToSlug: Record<TabLabel, string> = {
  Entregável: "entregaveis",
  Ofertas: "ofertas",
  Checkouts: "checkouts",
  Configurações: "configuracoes",
  "Pixels de rastreamento": "pixels",
  "Upsell, downsell e mais": "upsell",
  Cupons: "cupons",
  Coprodução: "coproducao",
};

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null || value === "") return "R$ 0,00";
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  const safe = Number.isFinite(numeric) ? numeric : 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(safe);
};

const toNumber = (value?: number | string) => {
  if (value === undefined || value === null || value === "") return 0;
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function EditarProdutoView({ initialTab }: { initialTab?: string } = {}) {
  const searchParams = useSearchParams();
  const params = useParams<{ id?: string }>();
  const productId = useMemo(() => {
    if (params?.id) return params.id;
    const fromQuery = searchParams?.get("id");
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastProductId") ?? undefined;
    }
    return undefined;
  }, [params, searchParams]);
  const { token } = useAuth();
  const { withLoading } = useLoadingOverlay();
  const productCacheKey = productId ? `product:${productId}` : null;
  const cachedProduct = productCacheKey ? readCache<Product>(productCacheKey) : undefined;
  const [product, setProduct] = useState<Product | null>(cachedProduct ?? null);
  const [productLoading, setProductLoading] = useState(!cachedProduct);
  const initialTabLabel = (initialTab && tabSlugMap[initialTab]) || "Entregável";
  const [activeTab, setActiveTab] = useState<TabLabel>(initialTabLabel);

  const router = useRouter();
  useEffect(() => {
    if (!productCacheKey) return;
    const cached = readCache<Product>(productCacheKey);
    if (cached) {
      setProduct(cached);
      setProductLoading(false);
    }
  }, [productCacheKey]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      const cached = productCacheKey ? readCache<Product>(productCacheKey) : undefined;
      if (!cached) {
        setProductLoading(true);
      }
      try {
        let data = cached
          ? await productApi.getProductById(productId, token)
          : await withLoading(
              () => productApi.getProductById(productId, token),
              "Carregando produto"
            );
        const needsTotals =
          data && (data.total_invoiced === undefined || data.total_sold === undefined);
        if (needsTotals) {
          try {
            const list = await productApi.listProducts({ page: 1, limit: 10 }, token);
            const match = list.find(item => item.id === productId);
            if (match) {
              data = {
                ...data,
                total_invoiced: match.total_invoiced ?? data.total_invoiced,
                total_sold: match.total_sold ?? data.total_sold,
              };
            }
          } catch (error) {
            console.error("Erro ao carregar totais do produto:", error);
          }
        }
        setProduct(data);
        if (productCacheKey && data) {
          writeCache(productCacheKey, data);
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setProductLoading(false);
      }
    };
    void fetchProduct();
  }, [productId, token, withLoading, productCacheKey]);

  useEffect(() => {
    if (!productId || !token) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const tasks: Promise<void>[] = [];

      if (!readCache(`deliverables:${productId}`)) {
        tasks.push(
          productApi
            .getDeliverablesByProductId(productId, token)
            .then(data => writeCache(`deliverables:${productId}`, data))
            .catch(() => undefined)
        );
      }
      if (!readCache(`offers:${productId}`)) {
        tasks.push(
          productApi
            .getOffersByProductId(productId, token)
            .then(data => writeCache(`offers:${productId}`, Array.isArray(data) ? data : []))
            .catch(() => undefined)
        );
      }
      if (!readCache(`checkouts:${productId}`)) {
        tasks.push(
          productApi
            .getCheckoutsByProductId(productId, token)
            .then(data => writeCache(`checkouts:${productId}`, data))
            .catch(() => undefined)
        );
      }
      if (!readCache(`settings:${productId}`)) {
        tasks.push(
          productApi
            .getProductSettings(productId, token)
            .then(data => writeCache(`settings:${productId}`, data))
            .catch(() => undefined)
        );
      }
      if (!readCache(`trackings:${productId}`)) {
        tasks.push(
          productApi
            .getPlansByProductId(productId, token)
            .then(data => writeCache(`trackings:${productId}`, data))
            .catch(() => undefined)
        );
      }
      if (!readCache(`strategies:${productId}`)) {
        tasks.push(
          productApi
            .getProductStrategy(productId, token)
            .then(data => writeCache(`strategies:${productId}`, Array.isArray(data) ? data : []))
            .catch(() => undefined)
        );
      }
      if (!readCache(`coupons:${productId}`)) {
        tasks.push(
          productApi
            .getProductCoupons(productId, token)
            .then(data => writeCache(`coupons:${productId}`, data))
            .catch(() => undefined)
        );
      }
      if (!readCache(`coproducers:${productId}`)) {
        tasks.push(
          productApi
            .getCoproducersByProductId(productId, token)
            .then(data => writeCache(`coproducers:${productId}`, Array.isArray(data) ? data : []))
            .catch(() => undefined)
        );
      }

      if (!cancelled && tasks.length > 0) {
        void Promise.allSettled(tasks);
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productId, token]);

  useEffect(() => {
    setActiveTab((initialTab && tabSlugMap[initialTab]) || "Entregável");
  }, [initialTab]);

  const navigateToTab = (tab: TabLabel) => {
    const slug = tabToSlug[tab] ?? tab.toLowerCase();
    if (productId) {
      router.push(`/editar-produto/${encodeURIComponent(productId)}/${slug}`);
    }
  };

  const headerCard = useMemo(() => {
    if (productLoading || !product) {
      return (
        <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-[72px] w-[72px] rounded-[10px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-4 w-28" />
            <Skeleton className="ml-auto h-3 w-20" />
          </div>
        </div>
      );
    }

    const thumb = product.image_url || "/images/produto.png";
    const name = product.name ?? "Produto";
    const rawStatus = (product as Product & { status?: string })?.status;
    const displayStatus = rawStatus && rawStatus.trim() ? rawStatus : "Ativo";
    const totalInvoicedValue =
      product.total_invoiced ??
      (product as Product & { totalInvoiced?: number | string })?.totalInvoiced ??
      0;
    const totalSoldValue =
      product.total_sold ??
      (product as Product & { totalSold?: number | string })?.totalSold ??
      0;
    return (
      <div className="flex flex-col gap-3 rounded-[10px] border border-foreground/10 bg-card/80 p-4 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-[10px] bg-foreground/10">
            <Image
              src={thumb}
              alt={name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{name}</p>
            <span className="text-xs font-semibold text-emerald-400">{displayStatus}</span>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">
            {formatCurrency(totalInvoicedValue)} faturados
          </p>
          <p>{toNumber(totalSoldValue)} vendas realizadas</p>
        </div>
      </div>
    );
  }, [product, productLoading]);

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full px-3 py-4">
        <div className="mx-auto flex w-full max-w-6xl 2xl:max-w-7xl gap-6">
          <nav className="w-52 shrink-0">
            <ul className="space-y-2 text-sm">
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => navigateToTab(tab)}
                      className={`w-full rounded-[8px] px-3 py-2 text-left transition ${
                        isActive
                          ? "border border-primary/30 bg-primary/5 text-foreground shadow-[0_0_12px_rgba(95,23,255,0.18)]"
                          : "text-muted-foreground hover:text-foreground hover:border hover:border-primary/10"
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
              <EntregavelTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Ofertas" && (
              <OfertasTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Checkouts" && (
              <CheckoutsTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Configurações" && (
              <ConfiguracoesTab
                productId={productId}
                token={token ?? undefined}
                withLoading={withLoading}
              />
            )}

            {activeTab === "Pixels de rastreamento" && (
              <PixelsTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}


            {activeTab === "Upsell, downsell e mais" && (
              <UpsellTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Cupons" && (
              <CuponsTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Coprodução" && (
              <CoproducaoTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

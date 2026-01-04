'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { productApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CoproducaoTab } from "./editar-produto/CoproducaoTab";
import { CuponsTab } from "./editar-produto/CuponsTab";
import { UpsellTab } from "./editar-produto/UpsellTab";
import { PixelsTab } from "./editar-produto/PixelsTab";
import { ConfiguracoesTab } from "./editar-produto/ConfiguracoesTab";
import { CheckoutsTab } from "./editar-produto/CheckoutsTab";
import { OfertasTab } from "./editar-produto/OfertasTab";
import { EntregavelTab } from "./editar-produto/EntregavelTab";

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
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const initialTabLabel = (initialTab && tabSlugMap[initialTab]) || "Entregável";
  const [activeTab, setActiveTab] = useState<TabLabel>(initialTabLabel);

  const router = useRouter();
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      setProductLoading(true);
      try {
        const data = await withLoading(
          () => productApi.getProductById(productId, token),
          "Carregando produto"
        );
        setProduct(data);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setProductLoading(false);
      }
    };
    void fetchProduct();
  }, [productId, token, withLoading]);

  useEffect(() => {
    setActiveTab((initialTab && tabSlugMap[initialTab]) || "Entregável");
  }, [initialTab]);

  const navigateToTab = (tab: TabLabel) => {
    setActiveTab(tab);
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
          <p className="font-semibold text-foreground">R$ 0,00 faturados</p>
          <p>0 vendas realizadas</p>
        </div>
      </div>
    );
  }, [product, productLoading]);

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full px-3 py-4">
        <div className="mx-auto flex w-full max-w-6xl gap-6">
          <nav className="w-52 shrink-0">
            <ul className="space-y-2 text-sm">
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => navigateToTab(tab)}
                      className={`w-full px-2 py-2 text-left transition ${
                        isActive
                          ? "text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                          : "text-muted-foreground hover:text-foreground"
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

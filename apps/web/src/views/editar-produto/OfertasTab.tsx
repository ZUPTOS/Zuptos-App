'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductOffer } from "@/lib/api";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
  onOpenOfferModal?: () => void;
  refreshKey?: number;
};

export function OfertasTab({ productId, token, withLoading, onOpenOfferModal, refreshKey }: Props) {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getOffersByProductId(productId, token),
        "Carregando ofertas"
      );
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar ofertas:", err);
      setError("Não foi possível carregar as ofertas agora.");
    } finally {
      setLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
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
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            onClick={onOpenOfferModal}
          >
            Adicionar oferta
          </button>
        </div>
      </div>

        <PaginatedTable<ProductOffer>
          data={offers}
          rowsPerPage={6}
          rowKey={offer => offer.id ?? offer.name ?? Math.random().toString()}
          emptyMessage={loading ? "Carregando..." : error || "Nenhuma oferta cadastrada."}
          columns={[
            {
              id: "nome",
              header: "Nome",
              render: offer => <span className="break-words font-semibold uppercase">{offer.name}</span>,
            },
            {
              id: "checkout",
              header: "Checkout",
              render: offer => {
                const checkoutObj = offer.checkout as unknown as { name?: string; id?: string } | undefined;
                const t = offer.template as unknown as { checkout?: { name?: string; id?: string }; name?: string; id?: string };
                const checkoutName =
                  checkoutObj?.name ||
                  checkoutObj?.id ||
                  t?.checkout?.name ||
                  t?.name ||
                  t?.checkout?.id ||
                  t?.id ||
                  (typeof offer.template === "string" ? offer.template : offer.checkout_id ?? "default");
                return <span className="font-semibold text-muted-foreground">{checkoutName}</span>;
              },
            },
            {
              id: "tipo",
              header: "Tipo",
              render: offer => {
                const normalizedType = offer.type?.toLowerCase();
                const typeLabel =
                  normalizedType === "subscription"
                    ? "Assinatura"
                    : normalizedType === "single_purchase" || normalizedType === "single"
                    ? "Preço único"
                    : offer.type ?? "-";
                return <span className="text-muted-foreground">{typeLabel}</span>;
              },
            },
            {
              id: "valor",
              header: "Valor",
              render: offer => {
                const formatBRL = (value: number) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
                return (
                  <span className="font-semibold">
                    {offer.free ? "Gratuito" : offer.offer_price != null ? formatBRL(Number(offer.offer_price)) : "-"}
                  </span>
                );
              },
            },
            {
              id: "acesso",
              header: "Acesso",
              render: offer => {
                const accessUrl = offer.back_redirect_url ?? offer.next_redirect_url ?? "-";
                const accessLabel =
                  accessUrl && accessUrl !== "-"
                    ? accessUrl.replace(/^https?:\/\//, "").slice(0, 24)
                    : "-";
                const handleCopyAccess = async () => {
                  if (!accessUrl || accessUrl === "-") return;
                  try {
                    await navigator.clipboard?.writeText(accessUrl);
                    console.log("[offerApi] Link de acesso copiado:", accessUrl);
                  } catch (err) {
                    console.error("Não foi possível copiar o link de acesso:", err);
                  }
                };
                return (
                  <button
                    type="button"
                    className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30 disabled:opacity-60"
                    disabled={!accessUrl || accessUrl === "-"}
                    onClick={handleCopyAccess}
                    title={accessUrl && accessUrl !== "-" ? "Copiar link de acesso" : "Sem link"}
                  >
                    {accessLabel}
                  </button>
                );
              },
            },
            {
              id: "status",
              header: "Status",
              render: offer => {
                const isActive = offer.status?.toLowerCase() === "active";
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
          ]}
        />
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { listMembersProducts } from "@/views/members/requests/members.api";
import type { MembersProduct } from "@/views/members/types/members.types";
import { SEARCH_DEBOUNCE_MS } from "../constants";
import type { ProductRow } from "../types";

const buildRows = (products: MembersProduct[], perRow = 3): ProductRow[] => {
  const rows: ProductRow[] = [];
  for (let index = 0; index < products.length; index += perRow) {
    rows.push({
      id: `row-${index}`,
      items: products.slice(index, index + perRow),
    });
  }
  return rows;
};

type UseMembersProductsParams = {
  areaId: string;
  searchValue: string;
  enabled: boolean;
};

export function useMembersProducts({ areaId, searchValue, enabled }: UseMembersProductsParams) {
  const [products, setProducts] = useState<MembersProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let isActive = true;
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await listMembersProducts(areaId, 1, searchValue);
        if (!isActive) return;
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao carregar produtos da área de membros:", error);
        if (!isActive) return;
        setProducts([]);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [areaId, enabled, searchValue]);

  const rows = useMemo(() => buildRows(products), [products]);
  const hasProducts = products.length > 0;

  return { products, setProducts, isLoading, rows, hasProducts };
}


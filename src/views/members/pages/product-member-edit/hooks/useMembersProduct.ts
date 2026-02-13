import { useEffect, useState } from "react";

import { getMembersProductById } from "@/views/members/requests/members.api";
import type { MembersProduct } from "@/views/members/types/members.types";

type Params = {
  areaId: string;
  productId: string;
};

export function useMembersProduct({ areaId, productId }: Params) {
  const [product, setProduct] = useState<MembersProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const fetchProduct = async () => {
      try {
        const response = await getMembersProductById(areaId, productId);
        if (!isActive) return;
        setProduct(response);
      } catch (error) {
        console.error("Erro ao carregar produto da área de membros:", error);
        if (!isActive) return;
        setProduct(null);
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void fetchProduct();

    return () => {
      isActive = false;
    };
  }, [areaId, productId]);

  return { product, isLoading };
}


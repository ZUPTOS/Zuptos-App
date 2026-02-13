import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import { notify } from "@/shared/ui/notification-toast";
import type { MembersProduct } from "@/views/members/types/members.types";
import type { ImportableProduct } from "../types";

type UseProductModalsParams = {
  areaId: string;
  token?: string | null;
  products: MembersProduct[];
  setProducts: React.Dispatch<React.SetStateAction<MembersProduct[]>>;
};

export function useProductModals({ areaId, token, products, setProducts }: UseProductModalsParams) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importOptions, setImportOptions] = useState<ImportableProduct[]>([]);
  const [isImportOptionsLoading, setIsImportOptionsLoading] = useState(false);
  const [importProductId, setImportProductId] = useState<string>("");

  const [layoutProduct, setLayoutProduct] = useState<MembersProduct | null>(null);
  const [removeProduct, setRemoveProduct] = useState<MembersProduct | null>(null);

  const handleImportModalOpenChange = useCallback((open: boolean) => {
    setIsImportModalOpen(open);
    if (!open) {
      setImportProductId("");
      setImportOptions([]);
    }
  }, []);

  useEffect(() => {
    if (!isImportModalOpen) return;

    let isActive = true;
    setIsImportOptionsLoading(true);

    const load = async () => {
      try {
        const response = await productApi.listProducts({ page: 1, limit: 10 }, token ?? undefined);
        if (!isActive) return;
        setImportOptions(response.map((item) => ({ id: item.id, name: item.name })));
      } catch (error) {
        console.error("Erro ao carregar produtos para importação:", error);
        if (!isActive) return;
        // fallback to the current area products so the modal isn't empty in dev
        setImportOptions(products.map((item) => ({ id: item.id, name: item.name })));
      } finally {
        if (!isActive) return;
        setIsImportOptionsLoading(false);
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [isImportModalOpen, products, token]);

  const importSelectedProduct = useCallback(() => {
    const selected = importOptions.find((item) => item.id === importProductId);
    if (!selected) return;

    setProducts((current) => {
      const exists = current.some((item) => item.id === selected.id);
      if (exists) return current;
      return [
        {
          id: selected.id,
          areaId,
          name: selected.name,
          modulesCount: 0,
        },
        ...current,
      ];
    });

    notify.success("Produto importado", "O produto foi adicionado a área de membros.");
    handleImportModalOpenChange(false);
  }, [areaId, handleImportModalOpenChange, importOptions, importProductId, setProducts]);

  const confirmRemoveProduct = useCallback(() => {
    if (!removeProduct) return;

    setProducts((current) => current.filter((item) => item.id !== removeProduct.id));
    notify.success("Produto removido", "O produto foi removido da área de membros.");
    setRemoveProduct(null);
  }, [removeProduct, setProducts]);

  return {
    importModal: {
      open: isImportModalOpen,
      onOpenChange: handleImportModalOpenChange,
      options: importOptions,
      loading: isImportOptionsLoading,
      selectedId: importProductId,
      setSelectedId: setImportProductId,
      onImport: importSelectedProduct,
      openModal: () => setIsImportModalOpen(true),
    },
    layoutModal: {
      product: layoutProduct,
      openModal: (product: MembersProduct) => setLayoutProduct(product),
      closeModal: () => setLayoutProduct(null),
    },
    removeModal: {
      product: removeProduct,
      openModal: (product: MembersProduct) => setRemoveProduct(product),
      closeModal: () => setRemoveProduct(null),
      confirmRemove: confirmRemoveProduct,
    },
  };
}


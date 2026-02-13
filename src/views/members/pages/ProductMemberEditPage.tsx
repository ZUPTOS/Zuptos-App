"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ProductHeader } from "@/views/editar-produto/components/ProductHeader";
import { ProductType, type Product } from "@/lib/api";

import { ProductMemberEditSidebar } from "./product-member-edit/components/ProductMemberEditSidebar";
import type { ProductMemberEditTab } from "./product-member-edit/constants";
import { ProductMemberModulesTab } from "./product-member-edit/tabs/ProductMemberModulesTab";
import { ProductMemberPlaceholderTab } from "./product-member-edit/tabs/ProductMemberPlaceholderTab";
import { useMembersProduct } from "./product-member-edit/hooks/useMembersProduct";

type Props = {
  areaId: string;
  productId: string;
};

const buildHeaderProduct = (product: { id: string; name: string }): Product => ({
  id: product.id,
  name: product.name,
  type: ProductType.COURSE,
  status: "Ativo",
  total_invoiced: 350.34,
  total_sold: 6,
});

export default function ProductMemberEditPage({ areaId, productId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const userName = useMemo(
    () => user?.fullName || user?.username || "Zuptos",
    [user]
  );

  const { product, isLoading } = useMembersProduct({ areaId, productId });
  const headerProduct = useMemo(() => (product ? buildHeaderProduct(product) : null), [product]);

  const [activeTab, setActiveTab] = useState<ProductMemberEditTab>("Módulos");

  const content = useMemo(() => {
    if (activeTab === "Módulos") return <ProductMemberModulesTab />;
    return <ProductMemberPlaceholderTab title={activeTab} />;
  }, [activeTab]);

  return (
    <DashboardLayout userName={userName} userLocation="RJ" pageTitle="">
      <div className="w-full px-3 py-4">
        <div className="mx-auto flex w-full max-w-6xl gap-6 2xl:max-w-7xl">
          <ProductMemberEditSidebar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 space-y-6">
            <ProductHeader product={headerProduct} loading={isLoading} />

            {!isLoading && !product ? (
              <div className="rounded-[10px] border border-dashed border-foreground/10 bg-card/40 px-6 py-10 text-sm text-muted-foreground">
                Produto não encontrado.
              </div>
            ) : (
              content
            )}

            <button
              type="button"
              className="text-sm text-muted-foreground transition hover:text-foreground"
              onClick={() => router.push(`/members/${encodeURIComponent(areaId)}`)}
            >
              Voltar para a área de membros
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


'use client';

import { useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { CheckoutEditor } from "@/views/editar-produto/CheckoutEditor";

export default function EditarCheckoutView() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const productId = useMemo(
    () => params?.id ?? searchParams?.get("id") ?? localStorage.getItem("lastProductId") ?? "",
    [params, searchParams]
  );
  const checkoutId = searchParams?.get("checkoutId") ?? undefined;

  const handleBack = () => {
    if (productId) {
      router.push(`/editar-produto/${encodeURIComponent(productId)}/checkouts`);
    } else {
      router.push("/editar-produto");
    }
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <CheckoutEditor
        productId={productId}
        checkoutId={checkoutId}
        onBack={handleBack}
        onSaved={handleBack}
      />
    </DashboardLayout>
  );
}

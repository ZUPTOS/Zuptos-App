'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoUpsellPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="upsell" />
    </Suspense>
  );
}

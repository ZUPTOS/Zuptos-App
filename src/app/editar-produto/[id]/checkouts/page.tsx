'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoCheckoutsPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="checkouts" />
    </Suspense>
  );
}

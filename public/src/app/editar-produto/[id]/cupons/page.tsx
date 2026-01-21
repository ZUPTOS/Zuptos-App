'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoCuponsPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="cupons" />
    </Suspense>
  );
}

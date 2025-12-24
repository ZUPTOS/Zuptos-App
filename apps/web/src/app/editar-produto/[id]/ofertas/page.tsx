'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoOfertasPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="ofertas" />
    </Suspense>
  );
}

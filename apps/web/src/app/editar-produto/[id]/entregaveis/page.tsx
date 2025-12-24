'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoEntregaveisPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="entregaveis" />
    </Suspense>
  );
}

'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoConfiguracoesPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="configuracoes" />
    </Suspense>
  );
}

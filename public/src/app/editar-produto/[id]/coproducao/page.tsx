'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoCoproducaoPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="coproducao" />
    </Suspense>
  );
}

'use client';

import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoPixelsPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView initialTab="pixels" />
    </Suspense>
  );
}

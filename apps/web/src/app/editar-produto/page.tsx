import { Suspense } from "react";
import EditarProdutoView from "@/views/EditarProduto";

export default function EditarProdutoPage() {
  return (
    <Suspense fallback={null}>
      <EditarProdutoView />
    </Suspense>
  );
}

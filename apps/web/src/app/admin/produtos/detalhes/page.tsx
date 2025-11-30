'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminProdutoDetalhes from "@/views/AdminProdutoDetalhes";

function AdminProdutoDetalhesPage() {
  return <AdminProdutoDetalhes />;
}

export default withAuth(AdminProdutoDetalhesPage);

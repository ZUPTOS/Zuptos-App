'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminProdutos from "@/views/AdminProdutos";

function AdminProdutosPage() {
  return <AdminProdutos />;
}

export default withAuth(AdminProdutosPage);

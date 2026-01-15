'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminProdutos from "@/admin/views/AdminProdutos";

function AdminProdutosPage() {
  return <AdminProdutos />;
}

export default withAuth(AdminProdutosPage);

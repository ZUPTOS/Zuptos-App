'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminProdutos from "@/modules/admin/views/AdminProdutos";

function AdminProdutosPage() {
  return <AdminProdutos />;
}

export default withAuth(AdminProdutosPage);

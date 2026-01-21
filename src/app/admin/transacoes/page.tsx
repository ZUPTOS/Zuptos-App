'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminTransacoes from "@/modules/admin/views/AdminTransacoes";

function AdminTransacoesPage() {
  return <AdminTransacoes />;
}

export default withAuth(AdminTransacoesPage);

'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminTransacoes from "@/admin/views/AdminTransacoes";

function AdminTransacoesPage() {
  return <AdminTransacoes />;
}

export default withAuth(AdminTransacoesPage);

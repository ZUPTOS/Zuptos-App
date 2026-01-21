'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminConfiguracoes from "@/modules/admin/views/AdminConfiguracoes";

function AdminConfiguracoesPage() {
  return <AdminConfiguracoes />;
}

export default withAuth(AdminConfiguracoesPage);

'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminUsuarioDetalhes from "@/admin/views/AdminUsuarioDetalhes";

function AdminUsuarioDetalhesPage() {
  return <AdminUsuarioDetalhes />;
}

export default withAuth(AdminUsuarioDetalhesPage);

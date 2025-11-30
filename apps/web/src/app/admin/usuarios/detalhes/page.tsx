'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminUsuarioDetalhes from "@/views/AdminUsuarioDetalhes";

function AdminUsuarioDetalhesPage() {
  return <AdminUsuarioDetalhes />;
}

export default withAuth(AdminUsuarioDetalhesPage);

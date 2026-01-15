'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminColaboradorDetalhes from "@/admin/views/AdminColaboradorDetalhes";

function AdminColaboradorDetalhesAliasPage() {
  return <AdminColaboradorDetalhes />;
}

export default withAuth(AdminColaboradorDetalhesAliasPage);

'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminColaboradorDetalhes from "@/modules/admin/views/AdminColaboradorDetalhes";

function AdminColaboradorDetalhesPage() {
  return <AdminColaboradorDetalhes />;
}

export default withAuth(AdminColaboradorDetalhesPage);

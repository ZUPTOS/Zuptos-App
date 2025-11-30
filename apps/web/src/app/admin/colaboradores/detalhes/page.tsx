'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminColaboradorDetalhes from "@/views/AdminColaboradorDetalhes";

function AdminColaboradorDetalhesPage() {
  return <AdminColaboradorDetalhes />;
}

export default withAuth(AdminColaboradorDetalhesPage);

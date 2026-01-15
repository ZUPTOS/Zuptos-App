'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDocumentoDetalhes from "@/admin/views/AdminDocumentoDetalhes";

function AdminDocumentoDetalhesPage() {
  return <AdminDocumentoDetalhes />;
}

export default withAuth(AdminDocumentoDetalhesPage);

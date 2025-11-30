'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDocumentoDetalhes from "@/views/AdminDocumentoDetalhes";

function AdminDocumentoDetalhesPage() {
  return <AdminDocumentoDetalhes />;
}

export default withAuth(AdminDocumentoDetalhesPage);

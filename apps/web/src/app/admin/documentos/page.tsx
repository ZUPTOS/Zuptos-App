'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDocumentos from "@/modules/admin/views/AdminDocumentos";

function AdminDocumentosPage() {
  return <AdminDocumentos />;
}

export default withAuth(AdminDocumentosPage);

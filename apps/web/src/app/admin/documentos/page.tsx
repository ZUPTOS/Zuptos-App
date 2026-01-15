'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDocumentos from "@/admin/views/AdminDocumentos";

function AdminDocumentosPage() {
  return <AdminDocumentos />;
}

export default withAuth(AdminDocumentosPage);

'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminPlaceholder from "@/views/AdminPlaceholder";

function AdminDocumentosPage() {
  return <AdminPlaceholder title="Documentos" description="Centralize e faça upload de documentos de verificação." />;
}

export default withAuth(AdminDocumentosPage);

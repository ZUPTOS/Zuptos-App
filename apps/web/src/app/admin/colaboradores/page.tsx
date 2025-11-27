'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminPlaceholder from "@/views/AdminPlaceholder";

function AdminColaboradoresPage() {
  return <AdminPlaceholder title="Colaboradores" description="Gerencie acessos e convites de colaboradores." />;
}

export default withAuth(AdminColaboradoresPage);

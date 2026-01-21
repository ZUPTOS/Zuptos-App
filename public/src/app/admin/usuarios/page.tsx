'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminUsuarios from "@/modules/admin/views/AdminUsuarios";

function AdminUsuariosPage() {
  return <AdminUsuarios />;
}

export default withAuth(AdminUsuariosPage);

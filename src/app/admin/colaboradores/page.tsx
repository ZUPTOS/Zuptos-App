'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminColaboradores from "@/modules/admin/views/AdminColaboradores";

function AdminColaboradoresPage() {
  return <AdminColaboradores />;
}

export default withAuth(AdminColaboradoresPage);

'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminSaques from "@/admin/views/AdminSaques";

function AdminSaquesPage() {
  return <AdminSaques />;
}

export default withAuth(AdminSaquesPage);

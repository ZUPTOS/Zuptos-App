'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDashboard from "@/modules/admin/views/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default withAuth(AdminDashboardPage);

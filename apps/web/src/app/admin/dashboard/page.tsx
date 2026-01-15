'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDashboard from "@/admin/views/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default withAuth(AdminDashboardPage);

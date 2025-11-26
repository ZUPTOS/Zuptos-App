'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminDashboard from "@/views/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default withAuth(AdminDashboardPage);

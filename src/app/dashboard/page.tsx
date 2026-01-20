'use client';

import { withAuth } from "@/lib/auth-guards";
import DashboardView from "@/views/dashboard/Dashboard";

function DashboardPage() {
  return <DashboardView />;
}

export default withAuth(DashboardPage);

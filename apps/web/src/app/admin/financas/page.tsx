'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminFinancas from "@/views/AdminFinancas";

function AdminFinancasPage() {
  return <AdminFinancas />;
}

export default withAuth(AdminFinancasPage);

'use client';

import { useSearchParams } from "next/navigation";
import { withAuth } from "@/lib/auth-guards";
import AdminSaquesDetalhes from "@/modules/admin/views/AdminSaquesDetalhes";

function AdminSaquesDetalhesPage() {
  const searchParams = useSearchParams();
  const withdrawalId = searchParams?.get("id") ?? undefined;

  return <AdminSaquesDetalhes withdrawalId={withdrawalId} />;
}

export default withAuth(AdminSaquesDetalhesPage);

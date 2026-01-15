'use client';

import { useSearchParams } from "next/navigation";
import { withAuth } from "@/lib/auth-guards";
import AdminTransacoesDetalhes from "@/admin/views/AdminTransacoesDetalhes";

function AdminTransacoesDetalhesPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams?.get("id") ?? undefined;

  return <AdminTransacoesDetalhes transactionId={transactionId} />;
}

export default withAuth(AdminTransacoesDetalhesPage);

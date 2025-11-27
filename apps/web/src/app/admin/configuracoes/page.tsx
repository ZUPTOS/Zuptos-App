'use client';

import { withAuth } from "@/lib/auth-guards";
import AdminPlaceholder from "@/views/AdminPlaceholder";

function AdminConfiguracoesPage() {
  return <AdminPlaceholder title="Configurações" description="Ajuste preferências e parâmetros globais do admin." />;
}

export default withAuth(AdminConfiguracoesPage);

/**
 * Exemplo de como implementar uma página protegida
 * 
 * Este arquivo mostra as diferentes formas de proteger uma rota
 * Escolha a que melhor se adequa ao seu caso de uso
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { withAuth } from '@/lib/auth-guards';

/**
 * OPÇÃO 1: Usar o hook useAuth diretamente
 * (Mais flexível, você controla o que mostrar)
 */
export function DashboardWithHook() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Você precisa estar autenticado para acessar esta página</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Bem-vindo ao Dashboard, {user?.fullName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Tipo de acesso: {user?.accessType}</p>
    </div>
  );
}

/**
 * OPÇÃO 2: Usar o HOC withAuth
 * (Mais simples, redirecionamento automático)
 */
function DashboardContent() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Bem-vindo ao Dashboard, {user?.fullName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Tipo de acesso: {user?.accessType}</p>
    </div>
  );
}

export const DashboardWithHOC = withAuth(DashboardContent);

/**
 * OPÇÃO 3: Middleware customizado (Próximo)
 * 
 * Isso requer usar middleware.ts no Next.js
 * que verifica autenticação antes de renderizar a página
 */

/**
 * Exemplo de uso em app/dashboard/page.tsx:
 * 
 * import { DashboardWithHOC } from '@/lib/examples';
 * 
 * export default DashboardWithHOC;
 * 
 * // OU
 * 
 * import { DashboardWithHook } from '@/lib/examples';
 * 
 * export default DashboardWithHook;
 */

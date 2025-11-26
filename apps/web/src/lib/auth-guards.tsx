'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HOC (Higher Order Component) para proteger rotas privadas
 * 
 * Uso:
 * export default withAuth(MinhaComponente);
 * 
 * Isso garantirá que apenas usuários autenticados possam acessar
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
      // Se não está carregando e não está autenticado, redirecionar para login
      if (!isLoading && !isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated, isLoading, router]);

    // Mostrar loading enquanto verifica autenticação
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    // Se não autenticado, não renderizar o componente
    if (!isAuthenticated) {
      return null;
    }

    // Se autenticado, renderizar o componente
    return <Component {...props} />;
  };
}

/**
 * Middleware customizado para verificar autenticação
 * (Pode ser usado em middleware.ts do Next.js 13+)
 */
export async function checkAuthentication() {
  const token = globalThis.window ? localStorage.getItem('authToken') : null;
  return !!token;
}

/**
 * Hook customizado para verificar se usuário tem um tipo de acesso específico
 */
export function useAccessControl(requiredAccessType?: 'purchases' | 'products') {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return { hasAccess: false, user: null };
  }

  if (requiredAccessType && user.accessType !== requiredAccessType) {
    return { hasAccess: false, user };
  }

  return { hasAccess: true, user };
}

/**
 * Exemplo de uso em um componente:
 * 
 * function MinhaComponente() {
 *   const { user } = useAuth();
 *   
 *   if (!user) return <div>Carregando...</div>;
 *   
 *   return (
 *     <div>
 *       Bem-vindo, {user.fullName}!
 *     </div>
 *   );
 * }
 * 
 * export default withAuth(MinhaComponente);
 */

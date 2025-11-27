'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type ApiError, type SignInRequest, type SignUpRequest } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  accessType: 'purchases' | 'products';
  role?: 'admin' | 'default';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInRequest, options?: { redirectTo?: string }) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'admin@zuptosadmin.com',
  password: '123456',
} as const;

const ADMIN_TOKEN = 'mock-admin-token';

const ADMIN_USER: User = {
  id: 'admin',
  email: ADMIN_CREDENTIALS.email,
  fullName: 'Administrador Zuptos',
  accessType: 'products',
  role: 'admin',
  isAdmin: true,
};

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restaurar sessão ao carregar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("⚠️ [AuthContext] Erro ao restaurar sessão:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(
    async (credentials: SignInRequest, options?: { redirectTo?: string }) => {
      console.log("🔐 [AuthContext] signIn iniciado", { email: credentials.email });
      setIsLoading(true);
      setError(null);

      try {
        const isAdminLogin =
          credentials.email === ADMIN_CREDENTIALS.email &&
          credentials.password === ADMIN_CREDENTIALS.password;

        if (isAdminLogin) {
          console.log("👑 [AuthContext] Login admin mockado");
          localStorage.setItem('authToken', ADMIN_TOKEN);
          localStorage.setItem('authUser', JSON.stringify(ADMIN_USER));
          setToken(ADMIN_TOKEN);
          setUser(ADMIN_USER);
          router.push('/admin/dashboard');
          return;
        }

        const response = await authApi.signIn(credentials);

        // A API retorna { access_token: "..." }
        if (!response.access_token) {
          throw new Error('No token received from server');
        }

        const newToken = response.access_token;
        console.log("✅ [AuthContext] Token recebido com sucesso");

        // Decodificar token para extrair informações
        const tokenPayload = JSON.parse(atob(newToken.split('.')[1]));
        const userData = {
          id: tokenPayload.sub || '',
          email: tokenPayload.username || '',
          fullName: tokenPayload.username || '',
          accessType: 'purchases' as const,
          role: 'default' as const,
          isAdmin: false,
        };

        console.log("✅ [AuthContext] Dados do usuário extraídos:", userData);

        // Salvar no localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));

        console.log("💾 [AuthContext] Token e usuário salvos no localStorage");

        setToken(newToken);
        setUser(userData);

        console.log("✅ [AuthContext] State atualizado, redirecionando para dashboard");
        // Redirecionar para o dashboard
        const redirectTo = options?.redirectTo ?? '/dashboard';
        router.push(redirectTo);
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError?.status === 403) {
          console.warn("❌ [AuthContext] Credenciais inválidas fornecidas");
          setError("Email ou senha inválidos. Tente novamente.");
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
        console.error("❌ [AuthContext] Erro no signIn:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const signUp = useCallback(
    async (data: SignUpRequest) => {
      console.log("🔐 [AuthContext] signUp iniciado", { username: data.username, email: data.email });
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.signUp(data);

        // A API retorna { access_token: "..." }
        if (!response.access_token) {
          throw new Error('No token received from server');
        }

        const newToken = response.access_token;
        console.log("✅ [AuthContext] Token recebido com sucesso");

        // Decodificar token para extrair informações
        const tokenPayload = JSON.parse(atob(newToken.split('.')[1]));
        const userData = {
          id: tokenPayload.sub || '',
          email: tokenPayload.username || '',
          fullName: tokenPayload.username || '',
          accessType: data.accessType,
          role: 'default' as const,
          isAdmin: false,
        };

        console.log("✅ [AuthContext] Dados do usuário extraídos:", userData);

        // Salvar no localStorage
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('authUser', JSON.stringify(userData));

        console.log("💾 [AuthContext] Token e usuário salvos no localStorage");

        setToken(newToken);
        setUser(userData);

        console.log("✅ [AuthContext] State atualizado, redirecionando para dashboard");
        // Redirecionar para o dashboard
        router.push('/dashboard');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred during registration';
        console.error("❌ [AuthContext] Erro no signUp:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const signOut = useCallback(async () => {
    console.log("🔐 [AuthContext] signOut iniciado");
    setIsLoading(true);
    setError(null);

    try {
      const isAdminSession = token === ADMIN_TOKEN;
      if (token && !isAdminSession) {
        console.log("📤 [AuthContext] Chamando API de logout");
        await authApi.signOut(token);
        console.log("✅ [AuthContext] Logout na API bem-sucedido");
      }

      // Limpar localStorage
      console.log("🗑️ [AuthContext] Removendo token e dados do localStorage");
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      setToken(null);
      setUser(null);

      console.log("✅ [AuthContext] State limpo, redirecionando para home");
      // Redirecionar para login
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
      console.error("⚠️ [AuthContext] Erro no signOut (continuando logout local):", errorMessage);
      
      // Fazer logout local mesmo em caso de erro na API
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      router.push('/');
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [token, router]);

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      isAuthenticated: !!user && !!token,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [user, token, isLoading, error, signIn, signUp, signOut, clearError]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

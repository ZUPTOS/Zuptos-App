'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type SignInRequest, type SignUpRequest } from '@/lib/api';
import { notify } from '@/components/ui/notification-toast';
import { UNAUTHORIZED_EVENT } from '@/lib/request';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
  accessType: 'purchases' | 'products';
  role?: 'admin' | 'default';
  isAdmin?: boolean;
  status?: string;
  kyc?: {
    status?: string;
    accountType?: string;
    account_type?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInRequest, options?: { redirectTo?: string }) => Promise<void>;
  signUp: (data: SignUpRequest) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUser = (rawUser: Partial<User> | null | undefined, fallbackEmail: string): User => {
  const status =
    (rawUser as { status?: string } | undefined)?.status ??
    (rawUser as { kyc?: { status?: string } } | undefined)?.kyc?.status;
  const kyc = (rawUser as { kyc?: User["kyc"] } | undefined)?.kyc;

  return {
    id: (rawUser?.id as string) || "",
    email: (rawUser?.email as string) || fallbackEmail,
    fullName: (rawUser?.fullName as string) || "",
    username: (rawUser?.username as string) || fallbackEmail.split("@")[0],
    accessType: (rawUser?.accessType as User["accessType"]) || "purchases",
    role: (rawUser?.role as User["role"]) || "default",
    isAdmin: Boolean(rawUser?.isAdmin),
    status: status ? String(status) : undefined,
    kyc,
  };
};

const logError = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUnauthorizedAt = useRef(0);

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
      logError("⚠️ [AuthContext] Erro ao restaurar sessão:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUnauthorized = (event: Event) => {
      const storedToken = localStorage.getItem("authToken");
      if (!token && !storedToken) return;

      const now = Date.now();
      if (now - lastUnauthorizedAt.current < 2000) return;
      lastUnauthorizedAt.current = now;

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      setToken(null);
      setUser(null);
      setError(null);

      const detail = (event as CustomEvent<{ message?: string }>).detail;
      const rawMessage = detail?.message && typeof detail.message === "string" ? detail.message : undefined;
      const normalized = rawMessage?.toLowerCase();
      const isSessionError =
        normalized !== undefined &&
        ["invalid session", "jwt expired", "token expired", "unauthorized"].some(fragment =>
          normalized.includes(fragment)
        );

      notify.warning(
        "Sessão expirada",
        rawMessage && !isSessionError ? `${rawMessage}. Faça login novamente.` : "Faça login novamente."
      );
      router.push("/");
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [router, token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signIn = useCallback(
    async (credentials: SignInRequest, options?: { redirectTo?: string }) => {
      console.log("🔐 [AuthContext] signIn iniciado", { email: credentials.email });
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.signIn(credentials);

        if (!response?.access_token) {
          throw new Error("No token received from server");
        }

        let userData: User;
        const userFromApi =
          (response.data as { user?: Partial<User> } | undefined)?.user ??
          (response as { user?: Partial<User> } | undefined)?.user ??
          null;

        try {
          const meResponse = await authApi.getCurrentUser(response.access_token);
          console.log("🔍 [AuthContext] /auth/me response on login:", meResponse);
          const meKyc = (meResponse as { data?: { kyc?: User["kyc"] } })?.data?.kyc;
          const meUser =
            (meResponse as { data?: { user?: Partial<User>; kyc?: User["kyc"] }; user?: Partial<User> })
              ?.data?.user ??
            (meResponse as { user?: Partial<User> }).user ??
            (meResponse as { data?: Partial<User> }).data ??
            (meResponse as Partial<User>);
          const meUserWithKyc = meKyc ? { ...meUser, kyc: meKyc } : meUser;
          const meUserWithKycStatus =
            meUserWithKyc && meKyc?.status ? { ...meUserWithKyc, status: meKyc.status } : meUserWithKyc;
          userData = normalizeUser(meUserWithKycStatus ?? userFromApi, credentials.email);
        } catch (meError) {
          console.log("⚠️ [AuthContext] Falha ao consultar /auth/me:", meError);
          userData = normalizeUser(userFromApi, credentials.email);
        }

        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('authUser', JSON.stringify(userData));

        setToken(response.access_token);
        setUser(userData);

        notify.success("Login realizado com sucesso", "Bem-vindo de volta!");

        const redirectTo = options?.redirectTo ?? '/dashboard';
        router.push(redirectTo);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
        logError("❌ [AuthContext] Erro no signIn:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const refreshUser = async () => {
      if (!token) return;
      try {
        const meResponse = await authApi.getCurrentUser(token);
        const meKyc = (meResponse as { data?: { kyc?: User["kyc"] } })?.data?.kyc;
        const meUser =
          (meResponse as { data?: { user?: Partial<User>; kyc?: User["kyc"] }; user?: Partial<User> })
            ?.data?.user ??
          (meResponse as { user?: Partial<User> }).user ??
          (meResponse as { data?: Partial<User> }).data ??
          (meResponse as Partial<User>);
        const meUserWithKyc = meKyc ? { ...meUser, kyc: meKyc } : meUser;
        const meUserWithKycStatus =
          meUserWithKyc && meKyc?.status ? { ...meUserWithKyc, status: meKyc.status } : meUserWithKyc;
        const normalized = normalizeUser(meUserWithKycStatus, meUser?.email || user?.email || "");
        setUser(normalized);
        localStorage.setItem("authUser", JSON.stringify(normalized));
      } catch (error) {
        console.log("⚠️ [AuthContext] Falha ao atualizar /auth/me:", error);
      }
    };

    void refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const signUp = useCallback(
    async (data: SignUpRequest) => {
      console.log("🔐 [AuthContext] signUp iniciado", { username: data.username, email: data.email });
      setIsLoading(true);
      setError(null);

      try {
        await authApi.signUp({ ...data, termsAccepted: true });

        // Logout forçado após cadastro (seguindo comportamento anterior)
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        return true;
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : "An error occurred during registration";
        logError("❌ [AuthContext] Erro no signUp:", rawMessage);
        setError(rawMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    console.log("🔐 [AuthContext] signOut iniciado");
    setIsLoading(true);
    setError(null);

    try {
      const headerToken = token ?? localStorage.getItem('authToken') ?? undefined;
      if (headerToken) {
        console.log("📤 [AuthContext] Chamando API de logout");
        await authApi.signOut(headerToken);
        console.log("✅ [AuthContext] Logout na API bem-sucedido");
      }

      // Limpar localStorage
      console.log("🗑️ [AuthContext] Removendo token e dados do localStorage");
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');

      setToken(null);
      setUser(null);

      notify.success("Até a proxima", "Você efetuou logou");

      console.log("✅ [AuthContext] State limpo, redirecionando para home");
      // Redirecionar para login
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
      logError("⚠️ [AuthContext] Erro no signOut (continuando logout local):", errorMessage);
      
      // Fazer logout local mesmo em caso de erro na API
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      router.push('/');
      
      setError(errorMessage);
      return Promise.reject(err);
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

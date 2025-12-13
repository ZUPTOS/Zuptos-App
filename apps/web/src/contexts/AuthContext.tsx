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
import { authApi, type ApiError, type AuthResponse, type SignInRequest, type SignUpRequest } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username?: string;
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
  signUp: (data: SignUpRequest) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isDuplicateError = (err: unknown) => {
  const apiError = err as ApiError;
  const rawMessage = err instanceof Error ? err.message : "";
  return (
    apiError?.status === 403 ||
    apiError?.status === 409 ||
    /duplicate/i.test(rawMessage)
  );
};

const ADMIN_CREDENTIALS = {
  email: 'admin@zuptosadmin.com',
  password: '123456',
} as const;

const ADMIN_TOKEN = 'mock-admin-token';

const ADMIN_USER: User = {
  id: 'admin',
  email: ADMIN_CREDENTIALS.email,
  fullName: 'Administrador Zuptos',
  username: 'admin',
  accessType: 'products',
  role: 'admin',
  isAdmin: true,
};

const decodeTokenPayload = (token?: string): Record<string, unknown> => {
  if (!token) return {};
  const [, payload] = token.split(".");
  if (!payload) return {};
  try {
    const decoded = Buffer.from(payload, "base64").toString("utf-8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const getPayloadString = (value: unknown) => (typeof value === "string" ? value : "");

const saveUsernameHint = (email: string, username: string) => {
  if (!email || !username) return;
  try {
    const key = "signupUsernameHints";
    const existing = JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, string>;
    existing[email] = username;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // ignore
  }
};

const getUsernameHint = (email: string): string => {
  if (!email) return "";
  try {
    const stored = JSON.parse(localStorage.getItem("signupUsernameHints") ?? "{}") as Record<string, string>;
    return stored[email] ?? "";
  } catch {
    return "";
  }
};

const equalsIgnoreCase = (a?: string, b?: string) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

const trimUsername = (value: string, max = 6) => value.slice(0, max);

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

        if (!response?.access_token) {
          throw new Error("No token received from server");
        }

        const newToken = response.access_token;
        console.log("✅ [AuthContext] Token recebido (mock)");

        let profile: AuthResponse | null = null;
        try {
          profile = await authApi.getCurrentUser(newToken);
        } catch (profileError) {
          logError("⚠️ [AuthContext] Falha ao buscar perfil:", profileError);
        }

        const profileAny = (profile ?? null) as Record<string, unknown> | null;
        const profileUser: Record<string, unknown> | null =
          (profileAny as { user?: Record<string, unknown> } | null)?.user ??
          (profileAny as { data?: { user?: Record<string, unknown> } } | null)?.data?.user ??
          (profileAny as { data?: Record<string, unknown> } | null)?.data ??
          profileAny;

        const payload = decodeTokenPayload(newToken);
        const emailFromProfile =
          getPayloadString(profileUser?.email) ||
          getPayloadString(payload.email) ||
          credentials.email ||
          "";
        const usernameHint = getUsernameHint(emailFromProfile);
        const rawProfileUsername = getPayloadString(profileUser?.username);
        const rawPayloadUsername = getPayloadString(payload.username);
        const emailLocalPart = emailFromProfile.split("@")[0] || "";
        const chosenUsername =
          (rawProfileUsername && !equalsIgnoreCase(rawProfileUsername, emailFromProfile) && rawProfileUsername) ||
          (usernameHint && !equalsIgnoreCase(usernameHint, emailFromProfile) && usernameHint) ||
          (rawPayloadUsername && !equalsIgnoreCase(rawPayloadUsername, emailFromProfile) && rawPayloadUsername) ||
          emailLocalPart;

        const rawFullName =
          getPayloadString(profileUser?.fullName) ||
          getPayloadString(profileUser?.name) ||
          getPayloadString(payload.name) ||
          "";
        const chosenFullName =
          (rawFullName && !equalsIgnoreCase(rawFullName, emailFromProfile) && rawFullName) ||
          "";

        const userData = {
          id: getPayloadString(profileUser?.id) || getPayloadString(payload.sub),
          email: emailFromProfile,
          fullName: chosenFullName,
          username: trimUsername(chosenUsername),
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
        logError("❌ [AuthContext] Erro no signIn:", errorMessage);
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

      const buildPayload = (username: string) => ({
        ...data,
        username,
        termsAccepted: true,
      });

      const fallbackUsername = `${data.email.split("@")[0]}-${Math.random().toString(36).slice(2, 6)}`;

      try {
        await authApi.signUp(buildPayload(data.username));

        console.log("✅ [AuthContext] Cadastro realizado com sucesso");
        saveUsernameHint(data.email, data.username);

        // Garantir que nenhuma sessão fique ativa após cadastro
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        return true;
      } catch (err) {
        // Se for erro de duplicidade, tentar com username alternativo (baseado no email)
        if (isDuplicateError(err)) {
          try {
            await authApi.signUp(buildPayload(fallbackUsername));

            console.log("✅ [AuthContext] Cadastro realizado com username alternativo");
            saveUsernameHint(data.email, fallbackUsername);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
            return true;
          } catch (errFallback) {
            const rawMessage = errFallback instanceof Error ? errFallback.message : "An error occurred during registration";
            const friendlyMessage = "Já existe uma conta com esse email. Faça login ou recupere a senha.";
            logError("❌ [AuthContext] Erro no signUp (fallback):", rawMessage);
            setError(friendlyMessage);
            return false;
          }
        }

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

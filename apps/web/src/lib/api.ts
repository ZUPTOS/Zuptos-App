export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  accessType?: "purchases" | "products";
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      id?: string;
      email?: string;
      fullName?: string;
      accessType?: string;
    };
  };
  error?: string;
  access_token?: string;
  status?: string;
}

export interface ApiError extends Error {
  status?: number;
  response?: Response;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://86.48.22.80:3000/v1";
const EXTERNAL_AUTH_BASE = `${API_BASE_URL}/auth`;
const NEXT_API_BASE = "/api/auth";
const PATH_PROXY_MAP: Record<string, string> = {
  "/sign_in": "/sign-in",
  "/sign_up": "/sign-up",
  "/sign_out": "/sign-out",
  "/me": "/me",
};

async function request<T>(
  path: string,
  init: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { ...rest } = init;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isBrowser = typeof window !== "undefined";

  const url =
    isBrowser && PATH_PROXY_MAP[normalizedPath]
      ? `${NEXT_API_BASE}${PATH_PROXY_MAP[normalizedPath]}`
      : `${EXTERNAL_AUTH_BASE}${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    ...rest,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    const err = new Error(
      (data as { error?: string; message?: string })?.error ||
        (data as { message?: string })?.message ||
        `Request failed: ${res.status}`
    ) as ApiError;
    err.status = res.status;
    err.response = res;
    throw err;
  }

  return data as T;
}

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    console.log("Sign in payload:", credentials);
    return request<AuthResponse>("/sign_in", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    console.log("Sign up payload:", data);
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      termsAccepted: data.termsAccepted ?? true,
    };
    console.log("Sign up payload:", payload);

    return request<AuthResponse>("/sign_up", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    console.log("Getting current user with token:", token);
    return request<AuthResponse>("/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  signOut: async (token: string): Promise<AuthResponse> => {
    return request<AuthResponse>("/sign_out", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  recoverPassword: async (email: string): Promise<AuthResponse> => {
    return request<AuthResponse>("/recover_password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>("/reset_password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};

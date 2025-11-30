export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  accessType: "purchases" | "products";
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      fullName: string;
      accessType: string;
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

const MOCK_TOKEN = "mock-token";

const buildRequest = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error: ApiError = new Error(response.statusText);
    error.status = response.status;
    error.response = response;
    throw error;
  }
  try {
    return (await response.json()) as T;
  } catch {
    return { success: true } as unknown as T;
  }
};

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    console.log("📤 [signIn] mock Request:", {
      email: credentials.email,
    });
    return buildRequest<AuthResponse>("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    console.log("📤 [signUp] mock Request:", {
      username: data.username,
      email: data.email,
      accessType: data.accessType,
    });

    return buildRequest<AuthResponse>("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async (token: string) => {
    console.log("📤 [getCurrentUser] mock Request:", {
      tokenLength: token?.length || 0,
    });

    return buildRequest<AuthResponse>("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
      },
    });
  },

  signOut: async (token: string): Promise<AuthResponse> => {
    console.log("📤 [signOut] mock Request:", {
      tokenLength: token?.length || 0,
    });

    return buildRequest<AuthResponse>("/api/auth/sign-out", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
      },
    });
  },

  recoverPassword: async (email: string): Promise<AuthResponse> => {
    console.log("📤 [recoverPassword] mock Request:", {
      email: email,
    });

    return buildRequest<AuthResponse>("/api/auth/v1/auth/recover_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    console.log("📤 [resetPassword] mock Request:", {
      tokenLength: token?.length || 0,
    });

    return buildRequest<AuthResponse>("/api/auth/v1/auth/reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });
  },
};

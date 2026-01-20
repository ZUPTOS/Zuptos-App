import type { AuthResponse, SignInRequest, SignUpRequest } from "../api-types";
import { API_BASE_URL, readStoredToken, request } from "../request";

const AUTH_BASE = `${API_BASE_URL}/auth`;

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    return request<AuthResponse>("/sign_in", {
      method: "POST",
      baseUrl: AUTH_BASE,
      body: JSON.stringify(credentials),
    });
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      termsAccepted: data.termsAccepted ?? true,
    };
    console.log("Sign up payload:", payload);

    return request<AuthResponse>("/sign_up", {
      method: "POST",
      baseUrl: AUTH_BASE,
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    const response = await request<AuthResponse>("/me", {
      method: "GET",
      baseUrl: AUTH_BASE,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Resposta da API /auth/me", response)
    return response;
  },

  signOut: async (token?: string): Promise<AuthResponse> => {
    const finalToken = token ?? readStoredToken();
    if (!finalToken) {
      throw new Error("Missing auth token for logout");
    }
    return request<AuthResponse>("/sign_out", {
      method: "DELETE",
      baseUrl: AUTH_BASE,
      headers: { Authorization: `Bearer ${finalToken}` },
      body: JSON.stringify({}),
    });
  },

  recoverPassword: async (email: string): Promise<AuthResponse> => {
    console.log("🔁 [Auth] recover_password payload:", { email });
    const response = await request<AuthResponse>("/recover_password", {
      method: "POST",
      baseUrl: AUTH_BASE,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    console.log("✅ [Auth] recover_password response:", response);
    return response;
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    console.log("🔁 [Auth] reset_password payload:", {
      token: token.slice(0, 8),
      tokenLength: token.length,
      passwordLength: password.length,
    });
    const response = await request<AuthResponse>(`/reset_password?token=${encodeURIComponent(token)}`, {
      method: "POST",
      baseUrl: AUTH_BASE,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    console.log("✅ [Auth] reset_password response:", response);
    return response;
  },
};

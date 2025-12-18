import type { AuthResponse, SignInRequest, SignUpRequest } from "../api-types";
import { API_BASE_URL, readStoredToken, request } from "../request";

const AUTH_BASE = `${API_BASE_URL}/auth`;

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    console.log("Sign in payload:", credentials);
    return request<AuthResponse>("/sign_in", {
      method: "POST",
      baseUrl: AUTH_BASE,
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
      baseUrl: AUTH_BASE,
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    console.log("Getting current user with token:", token);
    const response = await request<AuthResponse>("/me", {
      method: "GET",
      baseUrl: AUTH_BASE,
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Current user response:", response);
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
    return request<AuthResponse>("/recover_password", {
      method: "POST",
      baseUrl: AUTH_BASE,
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>("/reset_password", {
      method: "POST",
      baseUrl: AUTH_BASE,
      body: JSON.stringify({ token, password }),
    }),
};

const API_BASE_URL = "/api/auth";

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

const handleResponse = async (response: Response): Promise<AuthResponse> => {
  if (!response.ok) {
    const error: ApiError = new Error(`API Error: ${response.statusText}`);
    error.status = response.status;
    error.response = response;
    console.error("❌ API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
    });
    throw error;
  }

  try {
    const data = await response.json();
    console.log("✅ API Success Response:", {
      status: response.status,
      url: response.url,
      data: data,
    });
    return data;
  } catch {
    const successResponse = {
      success: response.ok,
      message: "Request completed",
    };
    console.log("✅ API Response (no JSON):", successResponse);
    return successResponse;
  }
};

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    console.log("📤 [signIn] Request:", {
      url: `${API_BASE_URL}/sign-in`,
      method: "POST",
      email: credentials.email,
    });
    
    const response = await fetch(`${API_BASE_URL}/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return handleResponse(response);
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    console.log("📤 [signUp] Request:", {
      url: `${API_BASE_URL}/sign-up`,
      method: "POST",
      username: data.username,
      email: data.email,
      accessType: data.accessType,
    });
    
    const response = await fetch(`${API_BASE_URL}/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  getCurrentUser: async (token: string) => {
    console.log("📤 [getCurrentUser] Request:", {
      url: `${API_BASE_URL}/me`,
      method: "GET",
      tokenLength: token?.length || 0,
    });
    
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  signOut: async (token: string): Promise<AuthResponse> => {
    console.log("📤 [signOut] Request:", {
      url: `${API_BASE_URL}/sign-out`,
      method: "DELETE",
      tokenLength: token?.length || 0,
    });
    
    const response = await fetch(`${API_BASE_URL}/sign-out`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  },

  recoverPassword: async (email: string): Promise<AuthResponse> => {
    console.log("📤 [recoverPassword] Request:", {
      url: `${API_BASE_URL}/v1/auth/recover_password`,
      method: "POST",
      email: email,
    });
    
    const response = await fetch(`${API_BASE_URL}/v1/auth/recover_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    return handleResponse(response);
  },

  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    console.log("📤 [resetPassword] Request:", {
      url: `${API_BASE_URL}/v1/auth/reset_password`,
      method: "POST",
      tokenLength: token?.length || 0,
    });
    
    const response = await fetch(`${API_BASE_URL}/v1/auth/reset_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    return handleResponse(response);
  },
};

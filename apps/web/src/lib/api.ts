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

export const authApi = {
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    console.log("📤 [signIn] mock Request:", {
      email: credentials.email,
    });
    return Promise.resolve({
      access_token: MOCK_TOKEN,
      success: true,
      data: {
        token: MOCK_TOKEN,
        user: {
          id: "mock-user",
          email: credentials.email,
          fullName: credentials.email,
          accessType: "purchases",
        },
      },
    });
  },

  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    console.log("📤 [signUp] mock Request:", {
      username: data.username,
      email: data.email,
      accessType: data.accessType,
    });

    return Promise.resolve({
      access_token: MOCK_TOKEN,
      success: true,
      data: {
        token: MOCK_TOKEN,
        user: {
          id: "mock-user",
          email: data.email,
          fullName: data.username,
          accessType: data.accessType,
        },
      },
    });
  },

  getCurrentUser: async (token: string) => {
    console.log("📤 [getCurrentUser] mock Request:", {
      tokenLength: token?.length || 0,
    });

    return Promise.resolve({
      success: true,
      data: {
        token: token || MOCK_TOKEN,
        user: {
          id: "mock-user",
          email: "mock@user.com",
          fullName: "Usuário Zuptos",
          accessType: "purchases",
        },
      },
    });
  },

  signOut: async (token: string): Promise<AuthResponse> => {
    console.log("📤 [signOut] mock Request:", {
      tokenLength: token?.length || 0,
    });

    return Promise.resolve({
      success: true,
      message: "Signed out (mock)",
    });
  },

  recoverPassword: async (email: string): Promise<AuthResponse> => {
    console.log("📤 [recoverPassword] mock Request:", {
      email: email,
    });

    return Promise.resolve({
      success: true,
      message: "Recover password (mock)",
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<AuthResponse> => {
    console.log("📤 [resetPassword] mock Request:", {
      tokenLength: token?.length || 0,
      newPasswordLength: newPassword?.length || 0,
    });

    return Promise.resolve({
      success: true,
      message: "Reset password (mock)",
    });
  },
};

import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

jest.mock("@/lib/api", () => ({
  authApi: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    recoverPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const buildToken = (payload: Record<string, unknown>) => {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `header.${encoded}.signature`;
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
      user: { id: "user-1", email: "john@example.com", username: "john" }
    });
  });

  it("restaura usuário salvo no localStorage", async () => {
    localStorage.setItem("authToken", "stored-token");
    localStorage.setItem(
      "authUser",
      JSON.stringify({ id: "1", email: "stored@example.com", fullName: "Stored User", accessType: "purchases" }),
    );
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue({
      user: { id: "1", email: "stored@example.com", fullName: "Stored User", accessType: "purchases" }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.email).toBe("stored@example.com");
    expect(result.current.token).toBe("stored-token");
  });

  it("remove dados corrompidos do localStorage ao falhar restauração", async () => {
    localStorage.setItem("authToken", "stored-token");
    localStorage.setItem("authUser", "{invalid-json");

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("authUser")).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("executa signIn, guarda token e navega", async () => {
    const token = buildToken({ sub: "user-1", username: "john@example.com" });
    (authApi.signIn as jest.Mock).mockResolvedValue({ access_token: token });
    const router = useRouter();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn({ email: "john@example.com", password: "secret" });
    });

    expect(authApi.signIn).toHaveBeenCalledWith({ email: "john@example.com", password: "secret" });
    expect(localStorage.getItem("authToken")).toBe(token);
    expect(JSON.parse(localStorage.getItem("authUser") ?? "{}").username).toBe("john");
    expect(router.push).toHaveBeenCalledWith("/dashboard");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("executa signOut limpando dados e redirecionando", async () => {
    const token = buildToken({ sub: "user-2", username: "logout@example.com" });
    (authApi.signIn as jest.Mock).mockResolvedValue({ access_token: token });
    (authApi.signOut as jest.Mock).mockResolvedValue({});
    const router = useRouter();

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn({ email: "logout@example.com", password: "secret" });
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(authApi.signOut).toHaveBeenCalledWith(token);
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("executa signUp sem autenticar usuário", async () => {
    (authApi.signUp as jest.Mock).mockResolvedValue({ access_token: "token" });
    const { result } = renderHook(() => useAuth(), { wrapper });

    let created = false;
    await act(async () => {
      created = await result.current.signUp({
        email: "signup@example.com",
        password: "secret",
        username: "signup",
        accessType: "products",
        termsAccepted: true,
      });
    });

    expect(authApi.signUp).toHaveBeenCalled();
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(created).toBe(true);
  });

  it("usa valores padrão quando payload do token não contém identificadores no signIn", async () => {
    const token = buildToken({});
    (authApi.signIn as jest.Mock).mockResolvedValue({ access_token: token });
    (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn({ email: "empty@example.com", password: "123456" });
    });

    expect(result.current.user?.id).toBe("");
    expect(result.current.user?.fullName).toBe("");
  });

  it("lança erro quando signIn não retorna token", async () => {
    (authApi.signIn as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.signIn({ email: "missing@example.com", password: "123456" });
      }),
    ).rejects.toThrow("No token received from server");
  });

  it("não lança erro quando signUp não retorna token", async () => {
    (authApi.signUp as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });

    let created = false;
    await act(async () => {
      created = await result.current.signUp({
        email: "signup-missing@example.com",
        password: "secret",
        username: "signup-missing",
        accessType: "purchases",
        termsAccepted: true,
      });
    });

    expect(created).toBe(true);
  });

  it("retorna erro ao tentar signUp duplicado", async () => {
    const duplicateError = Object.assign(new Error("duplicate key value"), { status: 403 });
    (authApi.signUp as jest.Mock).mockRejectedValue(duplicateError);
    const { result } = renderHook(() => useAuth(), { wrapper });

    let created = true;
    await act(async () => {
      created = await result.current.signUp({
        email: "dupe@example.com",
        password: "secret",
        username: "dupe",
        accessType: "purchases",
        termsAccepted: true,
      });
    });

    expect(created).toBe(false);
    await waitFor(() => {
      expect(result.current.error).toBe("duplicate key value");
    });
  });

  it("usa username do backend ou parte do email ao autenticar", async () => {
    (authApi.signIn as jest.Mock).mockResolvedValue({
      access_token: "token",
      data: { user: { id: "abc", email: "long@example.com", username: "muito-longonome" } }
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.signIn({ email: "long@example.com", password: "123456" });
    });

    expect(result.current.user?.username).toBe("muito-longonome");
  });

  it("propaga erro de signIn quando API falha", async () => {
    (authApi.signIn as jest.Mock).mockRejectedValue(new Error("Credenciais inválidas"));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.signIn({ email: "error@example.com", password: "123" });
      }),
    ).rejects.toThrow("Credenciais inválidas");
  });

  it("limpa estado local mesmo quando signOut falha", async () => {
    const token = buildToken({ sub: "user-4", username: "failure@example.com" });
    (authApi.signIn as jest.Mock).mockResolvedValue({ access_token: token });
    (authApi.signOut as jest.Mock).mockRejectedValue(new Error("erro"));

    const router = useRouter();
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn({ email: "failure@example.com", password: "secret" });
    });

    await expect(
      act(async () => {
        await result.current.signOut();
      }),
    ).rejects.toThrow("erro");

    expect(localStorage.getItem("authToken")).toBeNull();
    expect(router.push).toHaveBeenCalledWith("/");
  });

  it("não chama API de signOut quando não há token ativo", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(authApi.signOut).not.toHaveBeenCalled();
  });

  it("exige AuthProvider para usar o hook", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");
    consoleSpy.mockRestore();
  });
});

import { authApi } from "@/lib/api";

describe("authApi", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("envia requisição de login e retorna dados", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({ access_token: "token" }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.signIn({ email: "john@example.com", password: "secret" });

    expect(global.fetch).toHaveBeenCalledWith("/api/auth/sign-in", expect.objectContaining({ method: "POST" }));
    expect(mockResponse.json).toHaveBeenCalled();
    expect(result).toEqual({ access_token: "token" });
  });

  it("lança erro quando a resposta não for bem sucedida", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Server error",
      json: jest.fn(),
      url: "/api/auth/me",
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(authApi.getCurrentUser("token")).rejects.toMatchObject({ status: 500 });
  });

  it("envia requisições adicionais do módulo", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({ access_token: "token" }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await authApi.signUp({ email: "a@b.com", password: "123", username: "ab", accessType: "purchases" });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/sign-up",
      expect.objectContaining({ method: "POST" }),
    );

    await authApi.signOut("token");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/sign-out",
      expect.objectContaining({ method: "DELETE", headers: { Authorization: "Bearer token" } }),
    );

    await authApi.recoverPassword("a@b.com");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/v1/auth/recover_password",
      expect.objectContaining({ method: "POST" }),
    );

    await authApi.resetPassword("token", "NewPass");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/v1/auth/reset_password",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("retorna resposta genérica quando json falha", async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: "No Content",
      json: jest.fn().mockRejectedValue(new Error("sem json")),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.signOut("token");
    expect(result).toMatchObject({ success: true });
  });

  it("ainda funciona quando token enviado está vazio", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({}),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await authApi.signOut("");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/sign-out",
      expect.objectContaining({ headers: { Authorization: "Bearer " } }),
    );

    await authApi.getCurrentUser("");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer " }) }),
    );
  });
});

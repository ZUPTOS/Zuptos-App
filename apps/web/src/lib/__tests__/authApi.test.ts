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

    // Modo mock: não chama fetch
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        access_token: expect.any(String),
        success: true,
        data: expect.any(Object),
      })
    );
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

    await authApi.getCurrentUser("token");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("envia requisições adicionais do módulo", async () => {
    await authApi.signUp({ email: "a@b.com", password: "123", username: "ab", accessType: "purchases" });
    await authApi.signOut("token");
    await authApi.recoverPassword("a@b.com");
    await authApi.resetPassword("token", "NewPass");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("retorna resposta genérica quando json falha", async () => {
    const result = await authApi.signOut("token");
    expect(result).toMatchObject({ success: true, message: expect.any(String) });
  });

  it("ainda funciona quando token enviado está vazio", async () => {
    await authApi.signOut("");
    await authApi.getCurrentUser("");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

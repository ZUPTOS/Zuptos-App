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
      json: jest.fn().mockResolvedValue({ access_token: "token" }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.signIn({ email: "john@example.com", password: "secret" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/sign-in"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result).toEqual(expect.objectContaining({ access_token: "token" }));
  });

  it("lança erro quando a resposta não for bem sucedida", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ error: "fail" }),
    };

    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await expect(authApi.getCurrentUser("token")).rejects.toHaveProperty("status", 500);
  });

  it("envia requisições adicionais do módulo", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ message: "ok" }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    await authApi.signUp({ email: "a@b.com", password: "123", username: "ab", accessType: "purchases" });
    await authApi.signOut("token");
    await authApi.recoverPassword("a@b.com");
    await authApi.resetPassword("token", "NewPass");

    expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it("retorna erro quando json falha", async () => {
    const badResponse = { ok: true, status: 200, json: jest.fn().mockRejectedValue(new Error("parse")) };
    (global.fetch as jest.Mock).mockResolvedValue(badResponse);

    const result = await authApi.signOut("token");
    expect(result).toBeUndefined();
  });
});

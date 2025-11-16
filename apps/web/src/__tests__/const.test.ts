const originalEnv = process.env;
describe("const utilities", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("expõe os valores padrão quando variáveis de ambiente não existem", async () => {
    const constants = await import("@/const");
    expect(constants.APP_TITLE).toBe("App");
    expect(constants.APP_LOGO).toContain("placehold");
  });

  it("monta a URL de login quando variáveis obrigatórias existem", async () => {
    process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL = "https://auth.zuptos.com";
    process.env.NEXT_PUBLIC_APP_ID = "app-123";

    const { getLoginUrl } = await import("@/const");
    const url = getLoginUrl();

    expect(url).toContain("auth.zuptos.com/app-auth");
    expect(url).toContain("appId=app-123");
    expect(url).toContain(
      encodeURIComponent("http://localhost/api/oauth/callback")
    );
    expect(url).toContain("state=");
  });

  it("lança quando chamada fora do browser ou sem env obrigatória", async () => {
    const constants = await import("@/const");
    expect(() => constants.getLoginUrl()).toThrow(/must be defined/i);

    jest.resetModules();
    process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL = "https://auth.zuptos.com";
    process.env.NEXT_PUBLIC_APP_ID = "app-123";

    const moduleWithEnv = await import("@/const");
    expect(() => moduleWithEnv.getLoginUrl(null)).toThrow(/browser environment/i);
  });
});

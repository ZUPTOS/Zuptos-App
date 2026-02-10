import { notifyApiError, toErrorMessage } from "@/lib/notify-error";

jest.mock("@/shared/ui/notification-toast", () => ({
  notify: {
    error: jest.fn(),
  },
}));

const notifyMock = jest.requireMock("@/shared/ui/notification-toast").notify as { error: jest.Mock };

describe("lib/notify-error", () => {
  beforeEach(() => {
    notifyMock.error.mockReset();
  });

  it("toErrorMessage: retorna fallback quando error e vazio", () => {
    expect(toErrorMessage(undefined)).toBe("Ocorreu um erro inesperado.");
    expect(toErrorMessage(null)).toBe("Ocorreu um erro inesperado.");

    expect(toErrorMessage(undefined, "Falha custom")).toBe("Falha custom");
  });

  it("toErrorMessage: string vira description e Error usa message", () => {
    expect(toErrorMessage("Mensagem simples")).toBe("Mensagem simples");
    expect(toErrorMessage(new Error("Boom"))).toBe("Boom");
    expect(toErrorMessage(new Error(""))).toBe("Ocorreu um erro inesperado.");
  });

  it("resolve mensagens por status/data e notifyApiError dispara notify.error", () => {
    notifyApiError({ status: 401, data: { message: "Token expirou" } });
    expect(notifyMock.error).toHaveBeenCalledWith("Sessão expirada", "Token expirou");

    notifyApiError({ status: 404, data: { error: "Nao encontrado no backend" } });
    expect(notifyMock.error).toHaveBeenCalledWith("Não encontrado", "Nao encontrado no backend");

    notifyApiError({ status: 500 });
    expect(notifyMock.error).toHaveBeenCalledWith("Erro no servidor", "Tente novamente em instantes.");
  });

  it("fallback: quando nao ha status/data, usa titulo/descricao informados", () => {
    notifyApiError({ foo: "bar" }, { title: "Falha ao salvar", description: "Tente de novo" });
    expect(notifyMock.error).toHaveBeenCalledWith("Falha ao salvar", "Tente de novo");
  });

  it("status desconhecido: mantem titulo do fallback e usa message do backend quando presente", () => {
    expect(toErrorMessage({ status: 418, data: { message: "I'm a teapot" } }, "Falha")).toBe("I'm a teapot");
  });
});


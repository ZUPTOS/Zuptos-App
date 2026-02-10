import {
  formatCardExpiry,
  formatCardNumber,
  formatDocument,
  formatPhone,
  unmask,
} from "@/lib/utils/formatters";

describe("lib/utils/formatters", () => {
  describe("formatDocument", () => {
    it("aplica mascara de CPF (11 digitos) e remove nao-digitos", () => {
      expect(formatDocument("12345678901")).toBe("123.456.789-01");
      expect(formatDocument("123.456.789-01")).toBe("123.456.789-01");
    });

    it("aplica mascara de CNPJ (14 digitos) e limita tamanho", () => {
      expect(formatDocument("12345678000190")).toBe("12.345.678/0001-90");
      expect(formatDocument("12.345.678/0001-90-EXTRA")).toBe("12.345.678/0001-90");
    });
  });

  describe("formatPhone", () => {
    it("aplica mascara de telefone fixo quando <= 10 digitos", () => {
      expect(formatPhone("1112345678")).toBe("(11) 1234-5678");
      expect(formatPhone("(11) 1234-5678")).toBe("(11) 1234-5678");
    });

    it("aplica mascara de celular quando > 10 digitos e limita 11 digitos", () => {
      expect(formatPhone("11912345678")).toBe("(11) 91234-5678");
      expect(formatPhone("11 91234-5678 999")).toBe("(11) 91234-5678");
    });
  });

  describe("formatCardNumber", () => {
    it("agrupa em blocos de 4 e limita 16 digitos", () => {
      expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111");
      expect(formatCardNumber("4111-1111-1111-1111-9999")).toBe("4111 1111 1111 1111");
    });
  });

  describe("formatCardExpiry", () => {
    it("formata MM/YY e remove nao-digitos", () => {
      expect(formatCardExpiry("1225")).toBe("12/25");
      expect(formatCardExpiry("12/25")).toBe("12/25");
    });
  });

  describe("unmask", () => {
    it("remove todos os caracteres nao-numericos", () => {
      expect(unmask("abc123.45")).toBe("12345");
    });
  });
});


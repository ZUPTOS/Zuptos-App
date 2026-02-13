import type { MembersStudent } from "../types";

const extractAreaSeed = (id: string) => {
  const match = id.match(/(\d+)$/);
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const mockStudentFirstNames = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Eduarda",
  "Felipe",
  "Giovana",
  "Henrique",
  "Isabela",
  "Joao",
  "Karen",
  "Lucas",
  "Marina",
  "Nicolas",
  "Olivia",
  "Paulo",
  "Rafaela",
  "Sofia",
  "Thiago",
  "Vitoria",
];

const mockStudentLastNames = [
  "Almeida",
  "Barbosa",
  "Cardoso",
  "Dias",
  "Ferreira",
  "Gomes",
  "Lima",
  "Martins",
  "Melo",
  "Moreira",
  "Nunes",
  "Oliveira",
  "Pereira",
  "Ribeiro",
  "Rodrigues",
  "Santana",
  "Silva",
  "Souza",
  "Teixeira",
  "Vieira",
];

const mockStudentProducts = [
  { id: "m-1", name: "Gestão de Tráfego 1" },
  { id: "m-2", name: "Funil de Conversão 2" },
  { id: "m-3", name: "Acelerador de Vendas 3" },
  { id: "m-4", name: "Copy para Oferta 4" },
];

export const buildMockStudentsByArea = (id: string, total = 505): MembersStudent[] => {
  const seed = extractAreaSeed(id);
  return Array.from({ length: total }, (_, index) => {
    const position = index + 1;
    const firstName = mockStudentFirstNames[(seed + index) % mockStudentFirstNames.length];
    const lastName = mockStudentLastNames[(seed * 3 + index) % mockStudentLastNames.length];
    const progressPercent = (seed * 17 + index * 7) % 101;
    const completed = progressPercent >= 100;
    const active = (seed + index) % 7 !== 0;
    const day = ((seed + index) % 28) + 1;
    const month = ((seed + Math.floor(index / 28)) % 12) + 1;

    const productsCount = ((seed + index) % 4) + 1;
    const products = Array.from({ length: productsCount }, (_, productIndex) => {
      const product = mockStudentProducts[(seed + index + productIndex) % mockStudentProducts.length];
      return { ...product };
    });

    return {
      id: `${id}-student-${position}`,
      name: `${firstName} ${lastName}`,
      email: `aluno${seed}-${position}@email.com`,
      lastAccess: `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/2026`,
      products,
      progressPercent,
      completed,
      active,
    };
  });
};


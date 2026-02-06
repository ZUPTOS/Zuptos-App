import type {
  MembersArea,
  MembersListResponse,
  MembersProduct,
  MembersProductsListResponse,
  PaginationMeta,
} from "../types/members.types";

const AREAS_PER_PAGE = 6;
const PRODUCTS_PER_PAGE = 18;

const mockMembersAreas: MembersArea[] = Array.from(
  { length: 48 },
  (_, index) => {
    const position = index + 1;
    return {
      id: `members-area-${position}`,
      name: `Área de membros ${position}`,
      studentsCount: (position * 7) % 120,
      url: "www.site.com",
    };
  }
);

const buildMeta = (
  page: number,
  perPage: number,
  totalItems: number
): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  return {
    page,
    perPage,
    totalItems,
    totalPages,
  };
};

const mockProductNames = [
  "Acelerador de Vendas",
  "Gestão de Tráfego",
  "Funil de Conversão",
  "Copy para Oferta",
  "Design para Lançamento",
  "Escala de Ads",
  "Edição de Vídeos",
  "Métricas de Performance",
  "Estratégia de Conteúdo",
  "Google Ads Avançado",
  "Facebook Ads Pro",
  "Email Marketing",
];

const extractAreaSeed = (areaId: string) => {
  const match = areaId.match(/(\d+)$/);
  const parsed = match ? Number(match[1]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const buildMockProductsByArea = (areaId: string): MembersProduct[] => {
  if (!areaId) return [];

  const seed = extractAreaSeed(areaId);
  const total = 24;

  return Array.from({ length: total }, (_, index) => {
    const position = index + 1;
    const nameBase = mockProductNames[(seed + index) % mockProductNames.length];
    return {
      id: `${areaId}-product-${position}`,
      areaId,
      name: `${nameBase} ${position}`,
      modulesCount: ((seed * 3 + index) % 12) + 1,
    };
  });
};

export const listMembersAreas = async (
  page = 1,
  search = ""
): Promise<MembersListResponse> => {
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = normalizedSearch
    ? mockMembersAreas.filter((area) =>
        [area.name, area.url].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
      )
    : mockMembersAreas;

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / AREAS_PER_PAGE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * AREAS_PER_PAGE;
  const data = filtered.slice(startIndex, startIndex + AREAS_PER_PAGE);

  return {
    data,
    meta: buildMeta(safePage, AREAS_PER_PAGE, totalItems),
  };
};

export const listMembersProducts = async (
  areaId: string,
  page = 1,
  search = ""
): Promise<MembersProductsListResponse> => {
  const allProducts = buildMockProductsByArea(areaId);
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = normalizedSearch
    ? allProducts.filter((product) =>
        [product.name].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        )
      )
    : allProducts;

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const data = filtered.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  return {
    data,
    meta: buildMeta(safePage, PRODUCTS_PER_PAGE, totalItems),
  };
};

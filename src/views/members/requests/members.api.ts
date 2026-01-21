import type {
  MembersArea,
  MembersListResponse,
  PaginationMeta,
} from "../types/members.types";

const PER_PAGE = 6;

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
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * PER_PAGE;
  const data = filtered.slice(startIndex, startIndex + PER_PAGE);

  return {
    data,
    meta: buildMeta(safePage, PER_PAGE, totalItems),
  };
};

export type MembersArea = {
  id: string;
  name: string;
  studentsCount: number;
  url: string;
};

export type MembersProduct = {
  id: string;
  areaId: string;
  name: string;
  modulesCount: number;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
};

export type MembersListResponse = {
  data: MembersArea[];
  meta: PaginationMeta;
};

export type MembersProductsListResponse = {
  data: MembersProduct[];
  meta: PaginationMeta;
};

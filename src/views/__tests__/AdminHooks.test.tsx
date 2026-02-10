import { renderHook, waitFor } from "@testing-library/react";
import { useAdminProductDetail, useAdminProducts, useAdminUserDetail, useAdminUsers } from "@/modules/admin/hooks";
import { useAdminFinanceList } from "@/modules/admin/hooks/useAdminFinanceList";
import * as _adminTypes from "@/modules/admin/types";

const listUsersMock = jest.fn();
const getUsersSummaryMock = jest.fn();
const getUserByIdMock = jest.fn();
const listProductsMock = jest.fn();
const getProductsSummaryMock = jest.fn();
const getProductByIdMock = jest.fn();
const listFinancesMock = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ token: "token" }),
}));

jest.mock("@/modules/admin/requests", () => ({
  adminUsersApi: {
    listUsers: (...args: unknown[]) => listUsersMock(...args),
    getSummary: (...args: unknown[]) => getUsersSummaryMock(...args),
    getUserById: (...args: unknown[]) => getUserByIdMock(...args),
  },
  adminProductsApi: {
    listProducts: (...args: unknown[]) => listProductsMock(...args),
    getSummary: (...args: unknown[]) => getProductsSummaryMock(...args),
    getProductById: (...args: unknown[]) => getProductByIdMock(...args),
  },
  adminFinanceApi: {
    listFinances: (...args: unknown[]) => listFinancesMock(...args),
  },
}));

describe("Admin hooks", () => {
  beforeEach(() => {
    listUsersMock.mockReset();
    getUsersSummaryMock.mockReset();
    getUserByIdMock.mockReset();
    listProductsMock.mockReset();
    getProductsSummaryMock.mockReset();
    getProductByIdMock.mockReset();
    listFinancesMock.mockReset();
  });

  it("useAdminUsers: normaliza lista e resumo", async () => {
    expect(_adminTypes).toBeDefined();
    listUsersMock.mockResolvedValue({
      data: {
        users: [
          {
            id: "user-1",
            name: "Ana",
            email: "ana@example.com",
            document: "123",
            status: "approved",
            total: 1000,
            tax: 10,
          },
        ],
      },
    });
    getUsersSummaryMock.mockResolvedValue({ data: { total_users: "1", active_users: "1" } });

    const { result } = renderHook(() => useAdminUsers());

    await waitFor(() => expect(result.current.users.length).toBe(1));
    expect(result.current.users[0]?.statusLabel).toBe("Aprovado");
    expect(result.current.summary.total).toBe(1);
  });

  it("useAdminProducts: normaliza lista e resumo", async () => {
    listProductsMock.mockResolvedValue({
      data: {
        products: [
          {
            product_id: "product-1",
            title: "Meu Produto",
            type: "course",
            status: "active",
            owner: { full_name: "Produtor", email: "prod@example.com", phone: "11999999999" },
            support_email: "support@example.com",
          },
        ],
      },
    });
    getProductsSummaryMock.mockResolvedValue({ data: { total_products: 1, total_revenue: 1200 } });

    const { result } = renderHook(() => useAdminProducts());

    await waitFor(() => expect(result.current.products.length).toBe(1));
    expect(result.current.products[0]?.typeLabel).toBe("Curso");
    expect(result.current.summary.total).toBe(1);
  });

  it("useAdminUserDetail: mapeia detalhes do usuario", async () => {
    getUserByIdMock.mockResolvedValue({
      data: {
        name: "Ana",
        document: "123",
        razao_social: "ACME LTDA",
        account_type: "PF",
        created_at: "2024-01-01T00:00:00Z",
      },
    });

    const { result } = renderHook(() => useAdminUserDetail("user-1"));

    await waitFor(() => expect(result.current.detail?.name).toBe("Ana"));
    expect(result.current.detail?.document).toBe("123");
    expect(result.current.detail?.razao).toBe("ACME LTDA");
  });

  it("useAdminProductDetail: mapeia detalhes do produto", async () => {
    getProductByIdMock.mockResolvedValue({
      product: {
        id: "product-1",
        name: "Meu Produto",
        status: "active",
        description: "Descricao",
        sale_url: "https://example.com/sales",
        user: { name: "Produtor", email: "prod@example.com" },
      },
    });

    const { result } = renderHook(() => useAdminProductDetail("product-1"));

    await waitFor(() => expect(result.current.detail?.id).toBe("product-1"));
    expect(result.current.detail?.producer).toBe("Produtor");
  });

  it("useAdminFinanceList: carrega lista e expõe paginação", async () => {
    listFinancesMock.mockResolvedValue({ data: [{ id: "f-1" }], total: 1, page: 2, limit: 10 });

    const { result } = renderHook(() => useAdminFinanceList({ page: 2, limit: 10 }));

    await waitFor(() => expect(result.current.finances.length).toBe(1));
    expect(result.current.total).toBe(1);
    expect(result.current.page).toBe(2);
  });
});

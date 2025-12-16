export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  accessType?: "purchases" | "products";
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: {
      id?: string;
      email?: string;
      fullName?: string;
      accessType?: string;
    };
  };
  error?: string;
  access_token?: string;
  status?: string;
}

export interface ApiError extends Error {
  status?: number;
  response?: Response;
}

export interface Sale {
  sale_id: string;
  product_id: string;
  sale_date: string;
  status: string;
  amount: number;
  user_id?: string;
  payment_method?: string;
  sale_type?: string;
}

export interface SaleListResponse {
  user_id: string;
  sales: Sale[];
}

export interface CreateSaleRequest {
  product_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  sale_type: string;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  image_url?: string;
  total_invoiced?: number;
  total_sold?: number;
  description?: string;
  status?: string;
}

export interface ProductListParams {
  user_id: string;
  page?: number;
  limit?: number;
}

export interface CreateProductRequest {
  name: string;
  type: string;
  image_url?: string;
  total_invoiced?: number;
  total_sold?: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  type?: string;
  image_url?: string;
  total_invoiced?: number;
  total_sold?: number;
  description?: string;
}

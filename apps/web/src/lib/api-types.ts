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
  category?: string;
  internal_description?: string;
  sale_url?: string;
  login_username?: string;
  login_password?: string;
}

export interface ProductDeliverable {
  id: string;
  product_id: string;
  name?: string;
  type: string;
  content: string;
  status: string;
  size?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListParams {
  user_id?: string;
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
  category?: string;
  internal_description?: string;
  sale_url?: string;
  login_username?: string;
  login_password?: string;
}

export interface ProductOffer {
  id?: string;
  name: string;
  type: string;
  status: string;
  offer_price?: number;
  free?: boolean;
  back_redirect_url?: string;
  next_redirect_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckoutPayload {
  template?: string;
  name: string;
  required_address?: boolean;
  required_phone?: boolean;
  required_birthdate?: boolean;
  required_document?: boolean;
  required_email_confirmation?: boolean;
  logo?: string;
  position_logo?: string;
  banner?: string;
  theme?: string;
  defaultColor?: string;
  countdown?: boolean;
  "countdown active"?: boolean;
  countdown_expire?: string;
  countdown_background?: string;
  social_proofs_message?: string;
  social_proofs_min_client?: number;
  after_sale_title?: string;
  after_sale_message?: string;
}

export interface Checkout extends CheckoutPayload {
  id?: string;
  product_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProductRequest {
  name?: string;
  type?: string;
  image_url?: string;
  total_invoiced?: number;
  total_sold?: number;
  description?: string;
  category?: string;
  internal_description?: string;
  sale_url?: string;
  login_username?: string;
  login_password?: string;
}

export interface ProductSettings {
  id: string;
  product_id: string;
  support_email?: string;
  phone_support?: string;
  language?: string;
  currency?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProductSettingsRequest {
  support_email?: string;
  phone_support?: string;
  language?: string;
  currency?: string;
  status?: string;
}

export interface ProductPlan {
  id: string;
  name?: string;
  platform?: string;
  status?: string;
  pixel_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductPlanRequest {
  type: string;
  status: string;
  plan_price: number;
  name: string;
  normal_price?: number;
  discount_price?: number;
  default?: boolean;
  cycles?: number;
  price_first_cycle?: number;
}

export interface KycAddress {
  address: string;
  number: string;
  complement?: string;
  state: string;
  city: string;
  neighborhood: string;
}

export interface KycPayload {
  account_type: string;
  document: string;
  social_name: string;
  phone: string;
  owner_name: string;
  medium_ticket: string;
  average_revenue: string;
  address: KycAddress;
  kycAddress?: KycAddress;
}

export type KycResponse = KycPayload & {
  id?: string;
  status?: string;
};

export interface KycDocumentResponse {
  id?: string;
  name?: string;
  status?: string;
  url?: string;
  message?: string;
}

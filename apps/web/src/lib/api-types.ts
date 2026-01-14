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
  type: ProductType | string;
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

export enum ProductType {
  COURSE = "course",
  BOOK = "book",
  SERVICE = "service",
}

export enum TrackingType {
  DEFAULT = "default",
  API = "api",
}

export enum TrackingStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ProviderTrackingName {
  FACEBOOK = "facebook",
  GOOGLE = "google",
  TIKTOK = "tiktok",
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
  type: ProductType;
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
  type: ProductOfferType | string;
  status: string;
  offer_price?: number;
  free?: boolean;
  back_redirect_url?: string;
  next_redirect_url?: string;
  checkout_id?: string;
  checkout?: Checkout;
  created_at?: string;
  updated_at?: string;
  order_bumps?: OrderBump[];
  template?: Checkout | string;
  subscription_plan?: SubscriptionPlanPayload;
}

export interface PublicCheckoutOfferBump {
  id?: string;
  title?: string;
  description?: string;
  tagDisplay?: string;
  tag_display?: string;
}

export interface PublicCheckoutOfferResponse {
  id?: string;
  product?: Product;
  checkout?: Checkout;
  plan?: SubscriptionPlanPayload | null;
  productOfferBumps?: PublicCheckoutOfferBump[] | null;
  type?: ProductOfferType | string;
  status?: string;
  offerPrice?: number | string;
  offer_price?: number | string;
  free?: boolean;
  backRedirectUrl?: string;
  back_redirect_url?: string;
  nextRedirectUrl?: string;
  next_redirect_url?: string;
  name?: string;
  checkoutId?: string;
  checkout_id?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CheckoutPayload {
  template?: CheckoutTemplate | string;
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
  countdown_active?: boolean;
  countdown_expire?: string;
  countdown_background?: string;
  countdown_text_color?: string;
  social_proofs_message?: string;
  social_proofs_min_client?: number;
  after_sale_title?: string;
  after_sale_message?: string;
  accepted_documents?: ("cpf" | "cnpj")[];
  payment_methods?: ("card" | "boleto" | "pix")[];
  coupon_enabled?: boolean;
  discount_card?: number;
  discount_pix?: number;
  discount_boleto?: number;
  installments_limit?: number;
  installments_preselected?: number;
  boleto_due_days?: number;
  pix_expire_minutes?: number;
  testimonials_enabled?: boolean;
  testimonials?: Testimonial[];
  sales_notifications_enabled?: boolean;
  social_proof_enabled?: boolean;
}

export enum CheckoutTemplate {
  DEFAULT = "default",
  VEGA = "vega",
  AFILIA = "afilia",
}

export enum ProductOfferType {
  SUBSCRIPTION = "subscription",
  SINGLE_PURCHASE = "single_purchase",
}

export interface SubscriptionPlanPayload {
  type: "monthly" | "yearly" | "quarterly";
  status: "active" | "inactive";
  plan_price: number;
  name: string;
  normal_price?: number;
  discount_price?: number;
  default?: boolean;
  cycles?: number;
  price_first_cycle?: number;
}

export interface OrderBump {
  id?: string;
  title: string;
  tag?: string;
  description?: string;
  product?: string;
  offer?: string;
  price?: number;
  offer_price?: number;
  normal_price?: number;
  original_price?: number;
  discount_price?: number;
  promotional_price?: number;
}

export interface Testimonial {
  id?: string;
  name?: string;
  text?: string;
  rating?: number;
  image?: string;
  avatar?: string;
  active?: boolean;
}

export interface CreateOrderBumpRequest {
  bumped_offer_show_id: string;
  title: string;
  description?: string;
  tag_display?: string;
}

export interface Coproducer {
  id?: string;
  name?: string;
  email?: string;
  commission?: number | string;
  commission_percentage?: number;
  revenue_share_percentage?: number;
  status?: string;
  start?: string;
  start_at?: string;
  created_at?: string;
  duration?: string;
  duration_months?: number;
  share_sales_details?: boolean;
  extend_product_strategies?: boolean;
  split_invoice?: boolean;
}

export interface CreateCoproducerRequest {
  name: string;
  email: string;
  duration_months?: number;
  revenue_share_percentage: number;
  share_sales_details?: boolean;
  extend_product_strategies?: boolean;
  split_invoice?: boolean;
}

export interface Checkout extends CheckoutPayload {
  id?: string;
  product_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSettings {
  id: string;
  product_id: string;
  support_email?: string;
  phone_support?: string;
  language?: ProductSettingsLanguage | string;
  currency?: ProductSettingsCurrency | string;
  status?: ProductSettingsStatus | string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProductSettingsRequest {
  support_email?: string;
  phone_support?: string;
  language?: ProductSettingsLanguage | string;
  currency?: ProductSettingsCurrency | string;
  status?: ProductSettingsStatus | string;
  product?: {
    id?: string;
    name?: string;
    description?: string;
  };
}

export enum ProductSettingsLanguage {
  EN = "en",
  ES = "es",
  PT_BR = "pt-BR",
}

export enum ProductSettingsCurrency {
  USD = "USD",
  EUR = "EUR",
  BRL = "BRL",
}

export enum ProductSettingsStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface ProductPlan {
  id: string;
  name?: string;
  type?: string;
  platform?: string;
  status?: string;
  pixel_id?: string;
  provider_tracking_id?: string;
  provider_tracking_name?: ProviderTrackingName | string;
  token_api_connection?: string;
  add_to_cart?: boolean;
  initiate_checkout?: boolean;
  add_payment_info?: boolean;
  purchase?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductTrackingRequest {
  name: string;
  type: TrackingType;
  status: TrackingStatus;
  provider_tracking_name: ProviderTrackingName;
  provider_tracking_id: string;
  token_api_connection?: string;
  add_to_cart?: boolean;
  initiate_checkout?: boolean;
  add_payment_info?: boolean;
  purchase?: boolean;
}

export interface CreateProductPlanRequest {
  type: SubscriptionPlanPayload["type"];
  status: SubscriptionPlanPayload["status"];
  plan_price: number;
  name: string;
  normal_price?: number;
  discount_price?: number;
  default?: boolean;
  cycles?: number;
  price_first_cycle?: number;
}

export interface ProductStrategy {
  id: string;
  name?: string;
  type?: string;
  offer?: string;
  value?: string | number;
  script?: string;
  status?: string;
  action_successful_type?: string;
  action_unsuccessful_type?: string;
  action_successful_url?: string;
  action_unsuccessful_url?: string;
}

export interface CreateProductStrategyRequest {
  name?: string;
  type: string;
  offer_id: string;
  action_successful_type?: string;
  action_unsuccessful_type?: string;
  action_successful_url?: string;
  action_unsuccessful_url?: string;
}

export interface ProductCoupon {
  id: string;
  name?: string;
  internal_name?: string;
  discount?: number | string;
  discount_amount?: number | string;
  code?: string;
  coupon_code?: string;
  is_percentage?: boolean;
  minimum_purchase_amount?: number | string;
  limit_usage?: number;
  expires_at?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductCouponRequest {
  coupon_code: string;
  discount_amount: number;
  status: "active" | "inactive";
  is_percentage?: boolean;
  internal_name?: string;
  expires_at?: string;
  minimum_purchase_amount?: number;
  limit_usage?: number;
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

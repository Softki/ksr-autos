// Domain types for KSR Auto's. These mirror the Supabase schema but are
// stable across the two data sources (seed / Supabase).

export type CarStatus = "draft" | "available" | "reserved" | "sold" | "hidden";

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  storage_path?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  sort_order: number;
  is_main: boolean;
}

export interface Car {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  version?: string;
  year?: number;
  price: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
  doors?: number;
  seats?: number;
  power_hp?: number;
  engine_cc?: number;
  apk_until?: string;
  license_plate?: string;
  vat_type?: string;
  description?: string;
  options?: string[];
  status: CarStatus;
  is_featured?: boolean;
  is_published?: boolean;
  main_image?: string;
  images?: CarImage[];
  created_at?: string;
  updated_at?: string;
}

export type InquiryType = "contact" | "test_drive" | "trade_in" | "search_request";
export type InquiryStatus = "new" | "contacted" | "closed" | "spam";

export interface InquiryMetadata {
  brand?: string;
  model?: string;
  mileage?: string;
  condition?: string;
  asking_price?: string;
  budget?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface Inquiry {
  id: string;
  car_id?: string | null;
  type: InquiryType;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  metadata?: InquiryMetadata;
  status: InquiryStatus;
  created_at: string;
}

export interface CarFilterParams {
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  mileageMax?: number;
  fuel?: string;
  transmission?: string;
  body?: string;
  q?: string;
  includeReserved?: boolean;
  includeSold?: boolean;
}

export type CarSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "mileage-asc"
  | "mileage-desc"
  | "year-asc"
  | "year-desc";

export interface CarListResult {
  cars: Car[];
  total: number;
}

export interface FilterOptions {
  brands: { value: string; count: number }[];
  fuels: { value: string; count: number }[];
  transmissions: { value: string; count: number }[];
  bodies: { value: string; count: number }[];
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  topic?: string;
  sort_order: number;
}

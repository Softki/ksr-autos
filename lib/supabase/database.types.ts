/**
 * Minimal hand-written types for the public schema.
 *
 * IMPORTANT: the Row / Insert / Update shapes MUST be declared with `type`
 * (not `interface`) so they satisfy the supabase-js
 * `Row: Record<string, unknown>` constraint. Named interfaces don't
 * automatically satisfy that constraint and silently degrade Supabase's
 * type inference to `never`.
 *
 * In production these can be replaced by the output of
 *   supabase gen types typescript --project-id <ref> --schema public
 */

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export type CarStatus = "draft" | "available" | "reserved" | "sold" | "hidden";
export type InquiryType = "contact" | "test_drive" | "trade_in" | "search_request";
export type InquiryStatus = "new" | "contacted" | "closed" | "spam";

// ---------------------------------------------------------------------------
// Row shapes
// ---------------------------------------------------------------------------

export type CarRow = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  version: string | null;
  year: number | null;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  body_type: string | null;
  color: string | null;
  doors: number | null;
  seats: number | null;
  power_hp: number | null;
  engine_cc: number | null;
  apk_until: string | null;
  license_plate: string | null;
  vat_type: string | null;
  description: string | null;
  options: Json;
  status: CarStatus;
  is_featured: boolean;
  is_published: boolean;
  sort_score: number;
  created_at: string;
  updated_at: string;
};

export type CarImageRow = {
  id: string;
  car_id: string;
  storage_path: string;
  image_url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_main: boolean;
  created_at: string;
};

export type InquiryRow = {
  id: string;
  car_id: string | null;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  metadata: Json;
  status: InquiryStatus;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
};

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  topic: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SiteSettingsRow = {
  id: number;
  company_name: string;
  street: string;
  postal_code: string;
  city: string;
  phone: string;
  whatsapp_url: string;
  email: string;
  kvk: string;
  announcement: string | null;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Insert / Update helpers
// ---------------------------------------------------------------------------

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CarInsert = Optional<CarRow,
  "id" | "created_at" | "updated_at" | "sort_score" | "options"
  | "is_published" | "is_featured" | "status" | "vat_type">;
type CarUpdate = Partial<CarInsert>;

type CarImageInsert = Optional<CarImageRow,
  "id" | "created_at" | "alt_text" | "width" | "height" | "sort_order" | "is_main">;
type CarImageUpdate = Partial<CarImageInsert>;

type InquiryInsert = Optional<InquiryRow,
  "id" | "created_at" | "metadata" | "ip_hash" | "user_agent" | "phone"
  | "message" | "car_id" | "status">;
type InquiryUpdate = Partial<InquiryInsert>;

type FaqInsert = Optional<FaqRow,
  "id" | "created_at" | "updated_at" | "sort_order" | "is_published" | "topic">;
type FaqUpdate = Partial<FaqInsert>;

type SiteSettingsUpdate = Partial<SiteSettingsRow>;

// ---------------------------------------------------------------------------
// Supabase Database generic
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: CarRow;
        Insert: CarInsert;
        Update: CarUpdate;
        Relationships: [];
      };
      car_images: {
        Row: CarImageRow;
        Insert: CarImageInsert;
        Update: CarImageUpdate;
        Relationships: [
          {
            foreignKeyName: "car_images_car_id_fkey";
            columns: ["car_id"];
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: InquiryInsert;
        Update: InquiryUpdate;
        Relationships: [
          {
            foreignKeyName: "inquiries_car_id_fkey";
            columns: ["car_id"];
            referencedRelation: "cars";
            referencedColumns: ["id"];
          },
        ];
      };
      faq: {
        Row: FaqRow;
        Insert: FaqInsert;
        Update: FaqUpdate;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: SiteSettingsRow;
        Update: SiteSettingsUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      car_status: CarStatus;
      inquiry_type: InquiryType;
      inquiry_status: InquiryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

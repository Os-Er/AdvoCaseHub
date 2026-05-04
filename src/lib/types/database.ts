export type DosyaDurum = "ACIK" | "KAPALI" | "ITIRAZ" | "TEMYIZ" | "ASKIDA" | "INFAZ" | "ARSIV";
export type Vekaletnamedurum = "AKTIF" | "SONA_ERDI" | "IPTAL";
export type MakbuzDurum = "BEKLENIYOR" | "KISMI" | "ODENDI";
export type AuditAction =
  | "LOGIN" | "LOGOUT" | "LOGIN_FAILED"
  | "CREATE_DOSYA" | "UPDATE_DOSYA" | "DELETE_DOSYA"
  | "CREATE_VEKALETNAME" | "UPDATE_VEKALETNAME" | "DELETE_VEKALETNAME"
  | "CREATE_MAKBUZ" | "UPDATE_MAKBUZ" | "DELETE_MAKBUZ"
  | "UPDATE_USER" | "PASSWORD_RESET";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      kategoriler: {
        Row: {
          id: number;
          user_id: string | null;
          adi: string;
          color: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["kategoriler"]["Row"], "id" | "created_at"> & {
          id?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["kategoriler"]["Insert"]>;
      };
      dosyalar: {
        Row: {
          id: string;
          user_id: string;
          kategori_id: number;
          klasor_no: string | null;
          dosya_no: string | null;
          basvuru_no: string | null;
          taraf_1: string | null;
          taraf_2: string | null;
          mahkeme_merkez: string | null;
          konu: string | null;
          gorev_tarihi: string | null;
          durusma_tarihi: string | null;
          rapor_tarihi: string | null;
          sonuc: string | null;
          notlar: string | null;
          durum: DosyaDurum;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dosyalar"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dosyalar"]["Insert"]>;
      };
      vekaletnameler: {
        Row: {
          id: string;
          user_id: string;
          vekaletname_no: string | null;
          vekaletname_tarihi: string;
          bitis_tarihi: string;
          vekalet_veren: string;
          turu: string | null;
          notlar: string | null;
          durum: Vekaletnamedurum;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vekaletnameler"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vekaletnameler"]["Insert"]>;
      };
      vekaletname_dosya: {
        Row: {
          id: string;
          vekaletname_id: string;
          dosya_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vekaletname_dosya"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vekaletname_dosya"]["Insert"]>;
      };
      makbuzlar: {
        Row: {
          id: string;
          user_id: string;
          makbuz_no: string | null;
          makbuz_miktari: number;
          makbuz_tarihi: string;
          odeme_miktari: number | null;
          odeme_tarihi: string | null;
          notlar: string | null;
          durum: MakbuzDurum;
          manuel_odendi_onayi: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["makbuzlar"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          manuel_odendi_onayi?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["makbuzlar"]["Insert"]>;
      };
      makbuz_dosya: {
        Row: {
          id: string;
          makbuz_id: string;
          dosya_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["makbuz_dosya"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["makbuz_dosya"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: AuditAction;
          table_name: string | null;
          record_id: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
    Views: {
      vekaletname_expiring: {
        Row: {
          id: string;
          user_id: string;
          vekaletname_no: string | null;
          vekaletname_tarihi: string;
          bitis_tarihi: string;
          vekalet_veren: string;
          turu: string | null;
          notlar: string | null;
          durum: Vekaletnamedurum;
          created_at: string;
          updated_at: string;
          avukat_adi: string;
          email: string;
          kalan_gun: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Kısaltma tipleri
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Kategori = Database["public"]["Tables"]["kategoriler"]["Row"];
export type Dosya = Database["public"]["Tables"]["dosyalar"]["Row"];
export type Vekaletname = Database["public"]["Tables"]["vekaletnameler"]["Row"];
export type VekaletnameExpiring = Database["public"]["Views"]["vekaletname_expiring"]["Row"];
export type Makbuz = Database["public"]["Tables"]["makbuzlar"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];

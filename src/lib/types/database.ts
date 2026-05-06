// ============================================================
// Mevcut tipler (v1 — korunuyor)
// ============================================================

export type DosyaDurum = "ACIK" | "KAPALI" | "ITIRAZ" | "TEMYIZ" | "ASKIDA" | "INFAZ" | "ARSIV";
export type Vekaletnamedurum = "AKTIF" | "SONA_ERDI" | "IPTAL";
export type MakbuzDurum = "BEKLENIYOR" | "KISMI" | "ODENDI";
export type AuditAction =
  | "LOGIN" | "LOGOUT" | "LOGIN_FAILED"
  | "CREATE_DOSYA" | "UPDATE_DOSYA" | "DELETE_DOSYA"
  | "CREATE_VEKALETNAME" | "UPDATE_VEKALETNAME" | "DELETE_VEKALETNAME"
  | "CREATE_MAKBUZ" | "UPDATE_MAKBUZ" | "DELETE_MAKBUZ"
  | "UPDATE_USER" | "PASSWORD_RESET";

// ============================================================
// v2 — Yeni tipler
// ============================================================

export type DosyaTip = "HUKUK" | "CEZA" | "ICRA";

export type ArabuluculukSonuc = "ANLASMA" | "ANLASAMAMAMA" | "DEVAM";
export type ArabuluculukDurum = "DEVAM" | "TAMAMLANDI" | "IPTAL";

export type CmkSureTipi = "SORUSTURMA" | "KOVUSTURMA";
export type CmkDurum = "DEVAM" | "TAMAMLANDI" | "IPTAL";

export type DanismanlikTur = "DANISMANLIK" | "SOZLESME" | "GENEL";
export type DanismanlikDurum = "AKTIF" | "TAMAMLANDI" | "IPTAL";

export type SureliIsKategori =
  | "ISTINAF"
  | "CEVAP_DILEKCESI"
  | "BILIRKISI_ITIRAZI"
  | "TEMYIZ"
  | "ITIRAZ"
  | "DURUSMA"
  | "DIGER";
export type Oncelik = "DUSUK" | "NORMAL" | "YUKSEK" | "KRITIK";

export type KaynakTip = "DOSYA" | "ARABULUCULUK" | "CMK" | "DANISMANLIK";
export type FinansTip = "MAKBUZ" | "GIDER" | "TAHSILAT";
export type FinansDurum = "BEKLIYOR" | "KISMI" | "TAMAMLANDI" | "IPTAL";

// sure_logic JSONB için yardımcı tip
export interface SureLogic {
  hafta_sonu_atla?: boolean;
  adli_tatil_dikkate_al?: boolean;
  sure_gun?: number;
  [key: string]: unknown;
}

// ============================================================
// Database interface
// ============================================================

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
          tip: DosyaTip;                  // v2: HUKUK | CEZA | ICRA
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
          tip?: DosyaTip;
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

      // --------------------------------------------------------
      // v2 — Yeni tablolar
      // --------------------------------------------------------

      arabuluculuk: {
        Row: {
          id: string;
          user_id: string;
          basvuru_no: string | null;
          basvuran: string | null;
          karsi_taraf: string | null;
          arabulucu_adi: string | null;
          basvuru_tarihi: string | null;
          gorusme_tarihi: string | null;
          konu: string | null;
          sonuc: ArabuluculukSonuc | null;
          durum: ArabuluculukDurum;
          arsivlendi: boolean;
          notlar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["arabuluculuk"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          durum?: ArabuluculukDurum;
          arsivlendi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["arabuluculuk"]["Insert"]>;
      };

      cmk_islemleri: {
        Row: {
          id: string;
          user_id: string;
          baro_atama_no: string | null;
          atama_tarihi: string | null;
          muvekkil_adi: string | null;
          suc_isnadı: string | null;
          sure_tipi: CmkSureTipi | null;
          merci: string | null;
          dosya_no: string | null;
          durum: CmkDurum;
          arsivlendi: boolean;
          notlar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cmk_islemleri"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          durum?: CmkDurum;
          arsivlendi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cmk_islemleri"]["Insert"]>;
      };

      danismanlik: {
        Row: {
          id: string;
          user_id: string;
          muvekkil: string | null;
          tur: DanismanlikTur | null;
          sozlesme_no: string | null;
          baslangic_tarihi: string | null;
          bitis_tarihi: string | null;
          ucret: number | null;
          konu: string | null;
          durum: DanismanlikDurum;
          arsivlendi: boolean;
          notlar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["danismanlik"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          durum?: DanismanlikDurum;
          arsivlendi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["danismanlik"]["Insert"]>;
      };

      sureli_isler: {
        Row: {
          id: string;
          user_id: string;
          kaynak_tip: KaynakTip | null;
          kaynak_id: string | null;
          baslik: string;
          kategori: SureliIsKategori;
          aciklama: string | null;
          son_tarih: string;
          hatirlatma_tarihi: string | null;
          oncelik: Oncelik;
          tamamlandi: boolean;
          tamamlanma_tarihi: string | null;
          arsivlendi: boolean;
          sure_logic: SureLogic;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sureli_isler"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          oncelik?: Oncelik;
          tamamlandi?: boolean;
          arsivlendi?: boolean;
          sure_logic?: SureLogic;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sureli_isler"]["Insert"]>;
      };

      finans: {
        Row: {
          id: string;
          user_id: string;
          tip: FinansTip;
          kaynak_tip: KaynakTip;
          kaynak_id: string | null;
          miktar: number;
          tarih: string;
          referans_no: string | null;
          aciklama: string | null;
          durum: FinansDurum;
          odenen_miktar: number | null;
          arsivlendi: boolean;
          notlar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["finans"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          durum?: FinansDurum;
          arsivlendi?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["finans"]["Insert"]>;
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

// ============================================================
// Kısaltma tipleri — v1
// ============================================================

export type User             = Database["public"]["Tables"]["users"]["Row"];
export type Kategori         = Database["public"]["Tables"]["kategoriler"]["Row"];
export type Dosya            = Database["public"]["Tables"]["dosyalar"]["Row"];
export type Vekaletname      = Database["public"]["Tables"]["vekaletnameler"]["Row"];
export type VekaletnameExpiring = Database["public"]["Views"]["vekaletname_expiring"]["Row"];
export type Makbuz           = Database["public"]["Tables"]["makbuzlar"]["Row"];
export type AuditLog         = Database["public"]["Tables"]["audit_logs"]["Row"];

// ============================================================
// Kısaltma tipleri — v2
// ============================================================

export type Arabuluculuk     = Database["public"]["Tables"]["arabuluculuk"]["Row"];
export type CmkIslem         = Database["public"]["Tables"]["cmk_islemleri"]["Row"];
export type Danismanlik      = Database["public"]["Tables"]["danismanlik"]["Row"];
export type SureliIs         = Database["public"]["Tables"]["sureli_isler"]["Row"];
export type Finans           = Database["public"]["Tables"]["finans"]["Row"];

// Insert tipleri (form submit için)
export type ArabuluculukInsert = Database["public"]["Tables"]["arabuluculuk"]["Insert"];
export type CmkIslemInsert    = Database["public"]["Tables"]["cmk_islemleri"]["Insert"];
export type DanismanlikInsert = Database["public"]["Tables"]["danismanlik"]["Insert"];
export type SureliIsInsert    = Database["public"]["Tables"]["sureli_isler"]["Insert"];
export type FinansInsert      = Database["public"]["Tables"]["finans"]["Insert"];

// Update tipleri
export type ArabuluculukUpdate = Database["public"]["Tables"]["arabuluculuk"]["Update"];
export type CmkIslemUpdate    = Database["public"]["Tables"]["cmk_islemleri"]["Update"];
export type DanismanlikUpdate = Database["public"]["Tables"]["danismanlik"]["Update"];
export type SureliIsUpdate    = Database["public"]["Tables"]["sureli_isler"]["Update"];
export type FinansUpdate      = Database["public"]["Tables"]["finans"]["Update"];

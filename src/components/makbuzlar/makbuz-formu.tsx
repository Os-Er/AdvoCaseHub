"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MakbuzDurumBadge } from "./makbuz-durum-badge";
import { DosyaSecici } from "@/components/dosyalar/dosya-secici";
import { formatTL, odemeYuzdesi } from "@/lib/utils/para";
import type { MakbuzActionState } from "@/lib/actions/makbuzlar";
import type { Makbuz, MakbuzDurum, Dosya } from "@/lib/types/database";

type Action = (prev: MakbuzActionState, fd: FormData) => Promise<MakbuzActionState>;

interface Props {
  action: Action;
  dosyalar: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1">[];
  seciliDosyaIds?: string[];
  makbuz?: Makbuz;
  cancelHref: string;
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 font-medium">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 border-b pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function hesaplaDurumClient(makbuz: number, odeme: number | null, manuelOnay: boolean): MakbuzDurum {
  if (manuelOnay) return "ODENDI";
  if (!odeme || odeme <= 0) return "BEKLENIYOR";
  if (odeme >= makbuz)      return "ODENDI";
  return "KISMI";
}

export function MakbuzFormu({ action, dosyalar, seciliDosyaIds = [], makbuz, cancelHref }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<MakbuzActionState, FormData>(action, null);

  const [makbuzMiktar, setMakbuzMiktar] = useState<number>(makbuz?.makbuz_miktari ?? 0);
  const [odemeMiktar, setOdemeMiktar]   = useState<number | null>(makbuz?.odeme_miktari ?? null);
  const [manuelOnay, setManuelOnay]     = useState<boolean>(makbuz?.manuel_odendi_onayi ?? false);
  const [selectedDosyaIds, setSelectedDosyaIds] = useState<string[]>(seciliDosyaIds);

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(makbuz ? "Makbuz güncellendi" : "Makbuz başarıyla oluşturuldu");
      router.refresh(); // sunucu bileşenlerini yeni veriyle senkronize et
      router.push(`/makbuzlar/${state.id}`);
    }
  }, [state, router, makbuz]);

  const hesaplananDurum = hesaplaDurumClient(makbuzMiktar, odemeMiktar, manuelOnay);
  const yuzde = manuelOnay ? 100 : odemeYuzdesi(makbuzMiktar, odemeMiktar);

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Makbuz Bilgileri */}
      <Section title="Makbuz Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Makbuz No">
            <Input
              name="makbuz_no"
              defaultValue={makbuz?.makbuz_no ?? ""}
              placeholder="2024/MKB-001"
            />
          </Field>
          <Field label="Makbuz Tarihi" required>
            <Input
              name="makbuz_tarihi"
              type="date"
              required
              defaultValue={makbuz?.makbuz_tarihi ?? ""}
            />
          </Field>
        </div>
      </Section>

      {/* Tutarlar */}
      <Section title="Tutar Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Makbuz Miktarı (₺)" required>
            <div className="relative">
              <Input
                name="makbuz_miktari"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={makbuz?.makbuz_miktari ?? ""}
                placeholder="0,00"
                className="pr-6"
                onChange={(e) => setMakbuzMiktar(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₺</span>
            </div>
          </Field>
          <Field label="Ödenen Miktar (₺)">
            <div className="relative">
              <Input
                name="odeme_miktari"
                type="number"
                step="0.01"
                min="0"
                defaultValue={makbuz?.odeme_miktari ?? ""}
                placeholder="0,00"
                className="pr-6"
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setOdemeMiktar(isNaN(v) ? null : v);
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₺</span>
            </div>
          </Field>
        </div>

        {/* Manuel Onay Checkbox */}
        <div
          className="rounded-lg border-2 p-4 transition-colors"
          style={{
            borderColor: manuelOnay ? "#D4AF37" : "#E2E8F0",
            backgroundColor: manuelOnay ? "#D4AF3710" : "transparent",
          }}
        >
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="manuel_odendi_onayi"
              checked={manuelOnay}
              onChange={(e) => setManuelOnay(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 w-4 h-4 flex-shrink-0"
              style={{ accentColor: "#D4AF37" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
                <span className="text-sm font-medium text-slate-800">Manuel Ödendi Onayı</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                İşaretlenirse ödenen miktar ne olursa olsun durum <strong>ÖDENDİ</strong> olarak kaydedilir.
              </p>
            </div>
          </label>
        </div>

        {/* Canlı Durum Önizlemesi */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Hesaplanan Durum</span>
            <div className="flex items-center gap-2">
              {manuelOnay && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border"
                  style={{ borderColor: "#D4AF37", color: "#B8962A", backgroundColor: "#D4AF3718" }}
                >
                  <CheckCheck className="w-3 h-3" /> Manuel Onaylı
                </span>
              )}
              <MakbuzDurumBadge durum={hesaplananDurum} />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Kalan Borç</span>
            <span className="font-semibold text-slate-800">
              {manuelOnay ? <span className="text-emerald-600">Tam Ödendi</span> : formatTL(Math.max(0, makbuzMiktar - (odemeMiktar ?? 0)))}
            </span>
          </div>
          {/* İlerleme çubuğu */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Ödeme İlerlemesi</span>
              <span>%{yuzde}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${yuzde}%`,
                  backgroundColor: manuelOnay ? "#D4AF37" : yuzde >= 100 ? "#10B981" : yuzde > 0 ? "#3B82F6" : "#F59E0B",
                }}
              />
            </div>
          </div>
        </div>

        <Field label="Ödeme Tarihi">
          <Input
            name="odeme_tarihi"
            type="date"
            defaultValue={makbuz?.odeme_tarihi ?? ""}
          />
        </Field>
      </Section>

      {/* Notlar */}
      <Section title="Notlar">
        <Field label="Notlar">
          <Textarea
            name="notlar"
            defaultValue={makbuz?.notlar ?? ""}
            placeholder="Makbuz ile ilgili notlar..."
            rows={3}
          />
        </Field>
      </Section>

      {/* Dosya İlişkilendirme */}
      <Section title="İlişkili Dosyalar">
        <DosyaSecici
          dosyalar={dosyalar}
          seciliIds={selectedDosyaIds}
          onChange={setSelectedDosyaIds}
        />
        <p className="text-xs text-slate-400">Birden fazla dosya seçilebilir.</p>
      </Section>

      {/* Butonlar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">İptal</Button>
        </Link>
        <Button
          type="submit"
          disabled={pending}
          className="text-white"
          style={{ backgroundColor: "#1B2A4A" }}
        >
          {pending ? "Kaydediliyor..." : makbuz ? "Güncelle" : "Makbuz Oluştur"}
        </Button>
      </div>
    </form>
  );
}

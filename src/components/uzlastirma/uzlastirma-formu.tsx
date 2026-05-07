"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DURUM_OPTIONS, SONUC_OPTIONS } from "./durum-badge";
import type { UzlastirmaActionState } from "@/lib/actions/uzlastirma";
import type { Uzlastirma } from "@/lib/types/database";

type Action = (prev: UzlastirmaActionState, fd: FormData) => Promise<UzlastirmaActionState>;

interface Props {
  action: Action;
  kayit?: Uzlastirma;
  cancelHref: string;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

export function UzlastirmaFormu({ action, kayit, cancelHref }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<UzlastirmaActionState, FormData>(action, null);
  const k = kayit;

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(kayit ? "Kayıt güncellendi." : "Uzlaştırma kaydı oluşturuldu.");
      router.push(`/uzlastirma/${state.id}`);
    }
  }, [state, router, kayit]);

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Süreç Durumu */}
      <Section title="Süreç Durumu">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Durum">
            <select name="durum" defaultValue={k?.durum ?? "DEVAM"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {DURUM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Sonuç">
            <select name="sonuc" defaultValue={k?.sonuc ?? ""}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Henüz belli değil</option>
              {SONUC_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Referans */}
      <Section title="Referans Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Başvuru No">
            <Input name="basvuru_no" defaultValue={k?.basvuru_no ?? ""} placeholder="UZL-2024-001" />
          </Field>
          <Field label="Uzlaştırmacı Adı">
            <Input name="uzlastirmaci_adi" defaultValue={k?.uzlastirmaci_adi ?? ""} placeholder="Ad Soyad" />
          </Field>
        </div>
      </Section>

      {/* Taraflar */}
      <Section title="Taraflar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Şüpheli / Sanık">
            <Input name="suphe_sani" defaultValue={k?.suphe_sani ?? ""} placeholder="Ad Soyad" />
          </Field>
          <Field label="Mağdur / Müşteki">
            <Input name="magdur" defaultValue={k?.magdur ?? ""} placeholder="Ad Soyad" />
          </Field>
        </div>
        <Field label="Suç İsnadı / Türü">
          <Input name="suc_isnad" defaultValue={k?.suc_isnad ?? ""} placeholder="örn. Kasten Yaralama (TCK 86)" />
        </Field>
      </Section>

      {/* Tarihler & Ücret */}
      <Section title="Tarihler & Ücret">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Atama Tarihi">
            <Input name="atama_tarihi" type="date" defaultValue={k?.atama_tarihi ?? ""} />
          </Field>
          <Field label="Görüşme Tarihi">
            <Input name="gorusme_tarihi" type="date" defaultValue={k?.gorusme_tarihi ?? ""} />
          </Field>
          <Field label="Uzlaştırmacı Ücreti (₺)">
            <Input name="ucret" type="number" min="0" step="0.01"
              defaultValue={k?.ucret != null ? String(k.ucret) : ""}
              placeholder="0.00" />
          </Field>
        </div>
      </Section>

      {/* Notlar */}
      <Section title="Notlar">
        <Field label="Notlar">
          <Textarea name="notlar" defaultValue={k?.notlar ?? ""} placeholder="İç notlar..." rows={3} />
        </Field>
      </Section>

      {/* Butonlar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Link href={cancelHref}>
          <Button type="button" variant="outline">İptal</Button>
        </Link>
        <Button type="submit" disabled={pending} className="text-white" style={{ backgroundColor: "#1B2A4A" }}>
          {pending ? "Kaydediliyor..." : kayit ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}

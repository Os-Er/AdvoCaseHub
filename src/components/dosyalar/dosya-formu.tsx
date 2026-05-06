"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DURUM_OPTIONS } from "./durum-badge";
import { TaraflarFormu, type TarafItem } from "./taraflar-formu";
import type { DosyaActionState } from "@/lib/actions/dosyalar";
import type { Dosya, Kategori, DosyaTip } from "@/lib/types/database";

type Action = (prev: DosyaActionState, fd: FormData) => Promise<DosyaActionState>;

const TIP_LABEL: Record<DosyaTip, string> = {
  HUKUK: "Hukuk",
  CEZA:  "Ceza",
  ICRA:  "İcra",
};

interface Props {
  action: Action;
  kategoriler: Kategori[];
  dosya?: Dosya;
  cancelHref: string;
  tip?: DosyaTip;
  initialTaraflar?: TarafItem[];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 font-medium">{label}</Label>
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

export function DosyaFormu({ action, kategoriler, dosya, cancelHref, tip, initialTaraflar }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<DosyaActionState, FormData>(action, null);
  const d = dosya;
  const effectiveTip: DosyaTip = dosya?.tip ?? tip ?? "HUKUK";

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(dosya ? "Dosya güncellendi" : "Dosya başarıyla oluşturuldu");
      router.refresh(); // sunucu bileşenlerini yeni veriyle senkronize et
      router.push(`/dosyalar/${state.id}`);
    }
  }, [state, router, dosya]);

  return (
    <form action={formAction} className="space-y-8">
      {/* Tip hidden field */}
      <input type="hidden" name="tip" value={effectiveTip} />

      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <Section title={`Temel Bilgiler — ${TIP_LABEL[effectiveTip]} Dosyası`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kategori *">
            <select
              name="kategori_id"
              required
              defaultValue={d?.kategori_id ?? ""}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>Kategori seçin</option>
              {kategoriler.map((k) => (
                <option key={k.id} value={k.id}>{k.adi}</option>
              ))}
            </select>
          </Field>

          <Field label="Durum">
            <select
              name="durum"
              defaultValue={d?.durum ?? "ACIK"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DURUM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Numaralar */}
      <Section title="Dosya Numaraları">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Klasör No">
            <Input name="klasor_no" defaultValue={d?.klasor_no ?? ""} placeholder="2024/001" />
          </Field>
          <Field label="Dosya No">
            <Input name="dosya_no" defaultValue={d?.dosya_no ?? ""} placeholder="2024/123" />
          </Field>
          <Field label="Başvuru No">
            <Input name="basvuru_no" defaultValue={d?.basvuru_no ?? ""} placeholder="ARABULUCU-001" />
          </Field>
        </div>
      </Section>

      {/* Taraflar */}
      <Section title="Taraflar">
        <TaraflarFormu tip={effectiveTip} initialTaraflar={initialTaraflar} />
      </Section>

      {/* Mahkeme & Konu */}
      <Section title="Mahkeme & Konu">
        <Field label="Mahkeme / Merkez / İcra Dairesi">
          <Input name="mahkeme_merkez" defaultValue={d?.mahkeme_merkez ?? ""} placeholder="İstanbul Anadolu Adliyesi" />
        </Field>
        <Field label="Konu">
          <Textarea name="konu" defaultValue={d?.konu ?? ""} placeholder="Dosya konusu..." rows={2} />
        </Field>
      </Section>

      {/* Tarihler */}
      <Section title="Tarihler">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Görev Tarihi">
            <Input name="gorev_tarihi" type="date" defaultValue={d?.gorev_tarihi ?? ""} />
          </Field>
          <Field label="Duruşma Tarihi">
            <Input name="durusma_tarihi" type="date" defaultValue={d?.durusma_tarihi ?? ""} />
          </Field>
          <Field label="Rapor Tarihi">
            <Input name="rapor_tarihi" type="date" defaultValue={d?.rapor_tarihi ?? ""} />
          </Field>
        </div>
      </Section>

      {/* Sonuç & Notlar */}
      <Section title="Sonuç & Notlar">
        <Field label="Sonuç">
          <Textarea name="sonuc" defaultValue={d?.sonuc ?? ""} placeholder="Dava sonucu..." rows={3} />
        </Field>
        <Field label="Notlar">
          <Textarea name="notlar" defaultValue={d?.notlar ?? ""} placeholder="İç notlar..." rows={3} />
        </Field>
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
          {pending ? "Kaydediliyor..." : dosya ? "Güncelle" : "Dosya Oluştur"}
        </Button>
      </div>
    </form>
  );
}

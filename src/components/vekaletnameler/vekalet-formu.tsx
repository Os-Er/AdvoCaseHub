"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VEKALET_DURUM_OPTIONS } from "./vekalet-durum-badge";
import { DosyaSecici } from "@/components/dosyalar/dosya-secici";
import type { VekaletActionState } from "@/lib/actions/vekaletnameler";
import type { Vekaletname, Dosya } from "@/lib/types/database";

type Action = (prev: VekaletActionState, fd: FormData) => Promise<VekaletActionState>;

interface Props {
  action: Action;
  dosyalar: Pick<Dosya, "id" | "klasor_no" | "dosya_no" | "taraf_1">[];
  seciliDosyaIds?: string[];
  vekalet?: Vekaletname;
  cancelHref: string;
}

const TURU_OPTIONS = [
  "Genel Vekâletname",
  "Özel Vekâletname",
  "Dava Vekâletnamesi",
  "Taşınmaz Satış Vekâletnamesi",
  "Araç Satış Vekâletnamesi",
  "İş Hukuku Vekâletnamesi",
  "Diğer",
];

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

export function VekaletFormu({ action, dosyalar, seciliDosyaIds = [], vekalet, cancelHref }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<VekaletActionState, FormData>(action, null);
  const [selectedDosyaIds, setSelectedDosyaIds] = useState<string[]>(seciliDosyaIds);
  const v = vekalet;

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(vekalet ? "Vekâletname güncellendi" : "Vekâletname başarıyla oluşturuldu");
      router.refresh(); // sunucu bileşenlerini yeni veriyle senkronize et
      router.push(`/vekaletnameler/${state.id}`);
    }
  }, [state, router, vekalet]);

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <Section title="Temel Bilgiler">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vekâlet Veren" required>
            <Input
              name="vekalet_veren"
              required
              defaultValue={v?.vekalet_veren ?? ""}
              placeholder="Ad Soyad / Kurum"
            />
          </Field>
          <Field label="Vekâletname No">
            <Input
              name="vekaletname_no"
              defaultValue={v?.vekaletname_no ?? ""}
              placeholder="2024/VEK-001"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tür">
            <select
              name="turu"
              defaultValue={v?.turu ?? ""}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Seçiniz...</option>
              {TURU_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Durum">
            <select
              name="durum"
              defaultValue={v?.durum ?? "AKTIF"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {VEKALET_DURUM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Tarihler */}
      <Section title="Tarihler">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Düzenlenme Tarihi" required>
            <Input
              name="vekaletname_tarihi"
              type="date"
              required
              defaultValue={v?.vekaletname_tarihi ?? ""}
            />
          </Field>
          <Field label="Bitiş Tarihi" required>
            <Input
              name="bitis_tarihi"
              type="date"
              required
              defaultValue={v?.bitis_tarihi ?? ""}
            />
          </Field>
        </div>
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <span>⚠</span> Bitiş tarihine 30 gün kala kırmızı, 90 gün kala sarı uyarı gösterilir.
        </p>
      </Section>

      {/* Notlar */}
      <Section title="Notlar">
        <Field label="Notlar">
          <Textarea
            name="notlar"
            defaultValue={v?.notlar ?? ""}
            placeholder="Vekâletname ile ilgili notlar..."
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
          {pending ? "Kaydediliyor..." : vekalet ? "Güncelle" : "Vekâletname Oluştur"}
        </Button>
      </div>
    </form>
  );
}

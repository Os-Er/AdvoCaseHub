"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DURUM_OPTIONS, TUR_OPTIONS } from "./durum-badge";
import type { DanismanlikActionState } from "@/lib/actions/danismanlik";
import type { Danismanlik } from "@/lib/types/database";

type Action = (prev: DanismanlikActionState, fd: FormData) => Promise<DanismanlikActionState>;

interface Props {
  action: Action;
  kayit?: Danismanlik;
  cancelHref: string;
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
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

export function DanismanlikFormu({ action, kayit, cancelHref }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<DanismanlikActionState, FormData>(action, null);
  const k = kayit;

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(kayit ? "Kayıt güncellendi." : "Danışmanlık kaydı oluşturuldu.");
      router.push(`/danismanlik/${state.id}`);
    }
  }, [state, router, kayit]);

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Durum & Tür */}
      <Section title="Tür ve Durum">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tür">
            <select name="tur" defaultValue={k?.tur ?? "DANISMANLIK"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {TUR_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Durum">
            <select name="durum" defaultValue={k?.durum ?? "AKTIF"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {DURUM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Müvekkil & Konu */}
      <Section title="Müvekkil ve Konu">
        <Field label="Müvekkil">
          <Input name="muvekkil" defaultValue={k?.muvekkil ?? ""} placeholder="Müvekkil adı / şirketi" />
        </Field>
        <Field label="Konu">
          <Input name="konu" defaultValue={k?.konu ?? ""} placeholder="Danışmanlık konusu" />
        </Field>
      </Section>

      {/* Sözleşme Bilgileri */}
      <Section title="Sözleşme Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Sözleşme No">
            <Input name="sozlesme_no" defaultValue={k?.sozlesme_no ?? ""} placeholder="2024/DAN-001" />
          </Field>
          <Field label="Ücret (₺)">
            <Input name="ucret" type="number" min="0" step="0.01"
              defaultValue={k?.ucret != null ? String(k.ucret) : ""}
              placeholder="0.00" />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Başlangıç Tarihi">
            <Input name="baslangic_tarihi" type="date" defaultValue={k?.baslangic_tarihi ?? ""} />
          </Field>
          <Field label="Bitiş Tarihi">
            <Input name="bitis_tarihi" type="date" defaultValue={k?.bitis_tarihi ?? ""} />
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

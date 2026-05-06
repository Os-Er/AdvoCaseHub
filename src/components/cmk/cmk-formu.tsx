"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DURUM_OPTIONS, SURE_TIPI_OPTIONS } from "./durum-badge";
import type { CmkActionState } from "@/lib/actions/cmk";
import type { CmkIslem } from "@/lib/types/database";

type Action = (prev: CmkActionState, fd: FormData) => Promise<CmkActionState>;

interface Props {
  action: Action;
  kayit?: CmkIslem;
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

export function CmkFormu({ action, kayit, cancelHref }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CmkActionState, FormData>(action, null);
  const k = kayit;

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(kayit ? "Kayıt güncellendi." : "CMK işlemi oluşturuldu.");
      router.push(`/cmk/${state.id}`);
    }
  }, [state, router, kayit]);

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Durum */}
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
          <Field label="Süre Tipi">
            <select name="sure_tipi" defaultValue={k?.sure_tipi ?? ""}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Seçin</option>
              {SURE_TIPI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Atama Bilgileri */}
      <Section title="Atama Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Baro Atama No">
            <Input name="baro_atama_no" defaultValue={k?.baro_atama_no ?? ""} placeholder="2024/CMK-001" />
          </Field>
          <Field label="Atama Tarihi">
            <Input name="atama_tarihi" type="date" defaultValue={k?.atama_tarihi ?? ""} />
          </Field>
        </div>
      </Section>

      {/* Müvekkil & Suç */}
      <Section title="Müvekkil & Suç İsnadı">
        <Field label="Müvekkil Adı">
          <Input name="muvekkil_adi" defaultValue={k?.muvekkil_adi ?? ""} placeholder="Ad Soyad" />
        </Field>
        <Field label="Suç İsnadı">
          <Input name="suc_isnadı" defaultValue={k?.suc_isnadı ?? ""} placeholder="TCK 86 — Kasten yaralama vb." />
        </Field>
      </Section>

      {/* Merci & Dosya */}
      <Section title="Merci & Dosya Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Merci (Savcılık / Mahkeme)">
            <Input name="merci" defaultValue={k?.merci ?? ""} placeholder="İstanbul Anadolu Cumhuriyet Savcılığı" />
          </Field>
          <Field label="Dosya / Soruşturma No">
            <Input name="dosya_no" defaultValue={k?.dosya_no ?? ""} placeholder="2024/12345" />
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

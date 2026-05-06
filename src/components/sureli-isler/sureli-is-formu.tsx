"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ONCELIK_OPTIONS, KATEGORI_OPTIONS } from "./oncelik-badge";
import type { SureliIsActionState } from "@/lib/actions/sureli-isler";
import type { SureliIs, KaynakTip } from "@/lib/types/database";

type Action = (prev: SureliIsActionState, fd: FormData) => Promise<SureliIsActionState>;

export type KaynakOption = {
  tip: KaynakTip;
  id: string;
  label: string;
};

interface Props {
  action: Action;
  kayit?: SureliIs;
  cancelHref: string;
  kaynaklar: KaynakOption[];
}

const KAYNAK_TIP_OPTIONS: { value: KaynakTip; label: string }[] = [
  { value: "DOSYA",        label: "Dosya" },
  { value: "ARABULUCULUK", label: "Arabuluculuk" },
  { value: "CMK",          label: "CMK İşlemi" },
  { value: "DANISMANLIK",  label: "Danışmanlık" },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 font-medium">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
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

export function SureliIsFormu({ action, kayit, cancelHref, kaynaklar }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SureliIsActionState, FormData>(action, null);
  const k = kayit;

  const [secilenTip, setSecilenTip] = useState<KaynakTip | "">(k?.kaynak_tip ?? "");

  useEffect(() => {
    if (state && "success" in state) {
      toast.success(kayit ? "İş güncellendi." : "Süreli iş oluşturuldu.");
      router.push(`/sureli-isler/${state.id}`);
    }
  }, [state, router, kayit]);

  const filtreliKaynaklar = secilenTip
    ? kaynaklar.filter((kn) => kn.tip === secilenTip)
    : [];

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <Section title="İş Bilgileri">
        <Field label="Başlık" required>
          <Input name="baslik" defaultValue={k?.baslik ?? ""} placeholder="İstinaf dilekçesi sunumu" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kategori" required>
            <select name="kategori" defaultValue={k?.kategori ?? "DIGER"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {KATEGORI_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Öncelik">
            <select name="oncelik" defaultValue={k?.oncelik ?? "NORMAL"}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {ONCELIK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Açıklama">
          <Textarea name="aciklama" defaultValue={k?.aciklama ?? ""} placeholder="Ek detaylar..." rows={2} />
        </Field>
      </Section>

      {/* Tarihler */}
      <Section title="Tarih Bilgileri">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Son Tarih" required>
            <Input name="son_tarih" type="date" defaultValue={k?.son_tarih ?? ""} />
          </Field>
          <Field label="Hatırlatma Tarihi">
            <Input name="hatirlatma_tarihi" type="date" defaultValue={k?.hatirlatma_tarihi ?? ""} />
          </Field>
        </div>
        <p className="text-xs text-slate-400">
          Hatırlatma tarihi; son tarihten birkaç gün önce sizi uyarmak için kullanılır.
        </p>
      </Section>

      {/* Kaynak Bağlantısı */}
      <Section title="Kaynak Bağlantısı (İsteğe Bağlı)">
        <p className="text-xs text-slate-500">
          Bu süreli işi bir dosyaya, arabuluculuk kaydına, CMK işlemine veya danışmanlık kaydına bağlayabilirsiniz.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kaynak Türü">
            <select
              name="kaynak_tip"
              value={secilenTip}
              onChange={(e) => setSecilenTip(e.target.value as KaynakTip | "")}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Bağlantı yok</option>
              {KAYNAK_TIP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          {secilenTip && (
            <Field label="Kayıt Seçin">
              <select name="kaynak_id" defaultValue={k?.kaynak_id ?? ""}
                className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Seçin...</option>
                {filtreliKaynaklar.map((kn) => (
                  <option key={kn.id} value={kn.id}>{kn.label}</option>
                ))}
                {filtreliKaynaklar.length === 0 && (
                  <option disabled>Bu türde kayıt bulunamadı</option>
                )}
              </select>
            </Field>
          )}
        </div>
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

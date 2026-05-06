"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DURUM_OPTIONS, TIP_OPTIONS } from "./durum-badge";
import type { FinansActionState } from "@/lib/actions/finans";
import type { Finans, FinansTip, KaynakTip } from "@/lib/types/database";
import type { KaynakOption } from "@/lib/utils/kaynak-secenekler";

type Action = (prev: FinansActionState, fd: FormData) => Promise<FinansActionState>;

interface Props {
  action: Action;
  kayit?: Finans;
  cancelHref: string;
  kaynaklar: KaynakOption[];
  defaultTip?: FinansTip;
}

const KAYNAK_TIP_OPTIONS: { value: KaynakTip; label: string }[] = [
  { value: "DOSYA",        label: "Dosya" },
  { value: "ARABULUCULUK", label: "Arabuluculuk" },
  { value: "CMK",          label: "CMK İşlemi" },
  { value: "DANISMANLIK",  label: "Danışmanlık" },
];

const GIDER_VARSAYILAN_DURUM: FinansTip = "GIDER";

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

export function FinansFormu({ action, kayit, cancelHref, kaynaklar, defaultTip = "MAKBUZ" }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FinansActionState, FormData>(action, null);
  const k = kayit;

  const [secilenTip,     setSecilenTip]     = useState<FinansTip>(k?.tip ?? defaultTip);
  const [secilenKaynakTip, setSecilenKaynakTip] = useState<KaynakTip | "">(k?.kaynak_tip ?? "DOSYA");

  useEffect(() => {
    if (state && "success" in state) {
      const tipEtiketi = secilenTip === "MAKBUZ" ? "Makbuz" : secilenTip === "GIDER" ? "Gider" : "Tahsilat";
      toast.success(kayit ? "Kayıt güncellendi." : `${tipEtiketi} kaydı oluşturuldu.`);
      router.push(`/finans/${state.id}`);
    }
  }, [state, router, kayit, secilenTip]);

  const filtreliKaynaklar = secilenKaynakTip
    ? kaynaklar.filter((kn) => kn.tip === secilenKaynakTip)
    : [];

  const goesterOdenenMiktar = secilenTip !== GIDER_VARSAYILAN_DURUM;
  const varsayilanDurum = k?.durum ?? (secilenTip === "GIDER" ? "TAMAMLANDI" : "BEKLIYOR");

  return (
    <form action={formAction} className="space-y-8">
      {state && "error" in state && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Tip & Durum */}
      <Section title="İşlem Tipi ve Durum">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="İşlem Tipi" required>
            <select name="tip" value={secilenTip}
              onChange={(e) => setSecilenTip(e.target.value as FinansTip)}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {TIP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Durum">
            <select name="durum" defaultValue={varsayilanDurum}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              {DURUM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Finansal Bilgiler */}
      <Section title="Finansal Bilgiler">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Miktar (₺)" required>
            <Input name="miktar" type="number" min="0.01" step="0.01"
              defaultValue={k?.miktar != null ? String(k.miktar) : ""}
              placeholder="0.00" />
          </Field>
          {goesterOdenenMiktar && (
            <Field label="Ödenen Miktar (₺)">
              <Input name="odenen_miktar" type="number" min="0" step="0.01"
                defaultValue={k?.odenen_miktar != null ? String(k.odenen_miktar) : ""}
                placeholder="0.00" />
              <p className="text-xs text-slate-400 mt-1">Kısmi ödeme varsa doldurun.</p>
            </Field>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tarih" required>
            <Input name="tarih" type="date" defaultValue={k?.tarih ?? ""} />
          </Field>
          <Field label="Referans No">
            <Input name="referans_no" defaultValue={k?.referans_no ?? ""}
              placeholder={secilenTip === "MAKBUZ" ? "Makbuz no" : secilenTip === "GIDER" ? "Fatura no" : "Dekont no"} />
          </Field>
        </div>
        <Field label="Açıklama">
          <Input name="aciklama" defaultValue={k?.aciklama ?? ""} placeholder="Kısa açıklama..." />
        </Field>
      </Section>

      {/* Kaynak Bağlantısı */}
      <Section title="Kaynak Bağlantısı">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kaynak Türü" required>
            <select name="kaynak_tip" value={secilenKaynakTip}
              onChange={(e) => setSecilenKaynakTip(e.target.value as KaynakTip)}
              className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="">Seçin...</option>
              {KAYNAK_TIP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          {secilenKaynakTip && (
            <Field label="Kayıt Seçin">
              <select name="kaynak_id" defaultValue={k?.kaynak_id ?? ""}
                className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="">Seçin (isteğe bağlı)</option>
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

      {/* Notlar */}
      <Section title="Notlar">
        <Field label="İç Notlar">
          <Textarea name="notlar" defaultValue={k?.notlar ?? ""} placeholder="Ek notlar..." rows={2} />
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

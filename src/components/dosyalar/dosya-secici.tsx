"use client";

import { useState, useMemo } from "react";
import { Search, X, Check } from "lucide-react";

export interface DosyaSeciciItem {
  id: string;
  klasor_no: string | null;
  dosya_no: string | null;
  taraf_1: string | null;
}

interface Props {
  dosyalar: DosyaSeciciItem[];
  seciliIds: string[];
  onChange: (ids: string[]) => void;
}

export function DosyaSecici({ dosyalar, seciliIds, onChange }: Props) {
  const [arama, setArama]   = useState("");
  const [focused, setFocused] = useState(false);

  const filtrelenmis = useMemo(() => {
    const q = arama.toLowerCase().trim();
    if (!q) return dosyalar;
    return dosyalar.filter((d) => {
      const klasor = (d.klasor_no ?? "").toLowerCase();
      const dosya  = (d.dosya_no  ?? "").toLowerCase();
      const taraf  = (d.taraf_1   ?? "").toLowerCase();
      return klasor.includes(q) || dosya.includes(q) || taraf.includes(q);
    });
  }, [dosyalar, arama]);

  function toggle(id: string) {
    onChange(seciliIds.includes(id)
      ? seciliIds.filter((x) => x !== id)
      : [...seciliIds, id]);
  }

  return (
    <div className="space-y-2">
      {/* Hidden form inputs */}
      {seciliIds.map((id) => (
        <input key={id} type="hidden" name="dosya_ids" value={id} />
      ))}

      {/* Arama kutusu */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Klasör No, Dosya No veya taraf adıyla ara..."
          className="w-full h-9 pl-9 pr-8 rounded-md border text-sm bg-white outline-none transition-all"
          style={{
            borderColor: focused ? "#D4AF37" : "#E2E8F0",
            boxShadow:   focused ? "0 0 0 2px #D4AF3730" : "none",
          }}
        />
        {arama && (
          <button
            type="button"
            onClick={() => setArama("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dosya listesi */}
      {dosyalar.length === 0 ? (
        <p className="text-sm text-slate-400 py-2">Henüz dosya eklenmemiş.</p>
      ) : (
        <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50">
          {filtrelenmis.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-5">Eşleşen dosya bulunamadı.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtrelenmis.map((d) => {
                const secili = seciliIds.includes(d.id);
                const baslik = d.klasor_no ?? d.dosya_no ?? "Dosya";
                const alt    = d.dosya_no && d.klasor_no ? d.dosya_no : null;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggle(d.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white"
                    style={{ backgroundColor: secili ? "#1B2A4A08" : undefined }}
                  >
                    {/* Custom checkbox */}
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                      style={{
                        borderColor:     secili ? "#1B2A4A" : "#CBD5E1",
                        backgroundColor: secili ? "#1B2A4A"  : "transparent",
                      }}
                    >
                      {secili && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>

                    {/* Etiket */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{baslik}</p>
                      {d.taraf_1 && (
                        <p className="text-xs text-slate-400 truncate">{d.taraf_1}</p>
                      )}
                    </div>

                    {/* Dosya no (sağ taraf) */}
                    {alt && (
                      <span className="text-xs text-slate-400 flex-shrink-0 font-mono ml-auto pl-2">
                        {alt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Seçili chip'ler */}
      {seciliIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {seciliIds.map((id) => {
            const d = dosyalar.find((x) => x.id === id);
            if (!d) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#1B2A4A15", color: "#1B2A4A" }}
              >
                {d.klasor_no ?? d.dosya_no ?? "Dosya"}
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  className="ml-0.5 hover:text-red-500 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

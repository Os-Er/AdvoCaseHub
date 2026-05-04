"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DURUM_OPTIONS } from "./durum-badge";
import type { Kategori } from "@/lib/types/database";

interface Props {
  kategoriler: Kategori[];
}

export function DosyaAra({ kategoriler }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      params.delete("sayfa"); // filtrede sayfa sıfırlanır
      return params.toString();
    },
    [searchParams]
  );

  function update(updates: Record<string, string | null>) {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`);
    });
  }

  const q = searchParams.get("q") ?? "";
  const durum = searchParams.get("durum") ?? "";
  const kategori = searchParams.get("kategori") ?? "";
  const hasFilters = q || durum || kategori;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Arama */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Klasör no, dosya no, taraf ara..."
          className="pl-9"
          defaultValue={q}
          onChange={(e) => update({ q: e.target.value || null })}
        />
      </div>

      {/* Durum filtresi */}
      <select
        value={durum}
        onChange={(e) => update({ durum: e.target.value || null })}
        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring min-w-[140px]"
      >
        <option value="">Tüm Durumlar</option>
        {DURUM_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Kategori filtresi */}
      <select
        value={kategori}
        onChange={(e) => update({ kategori: e.target.value || null })}
        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring min-w-[160px]"
      >
        <option value="">Tüm Kategoriler</option>
        {kategoriler.map((k) => (
          <option key={k.id} value={k.id}>{k.adi}</option>
        ))}
      </select>

      {/* Temizle */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => update({ q: null, durum: null, kategori: null })}
          className="text-slate-500 hover:text-slate-700"
        >
          <X className="w-4 h-4 mr-1" /> Temizle
        </Button>
      )}
    </div>
  );
}

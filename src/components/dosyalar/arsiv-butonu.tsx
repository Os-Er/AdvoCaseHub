"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { arsivleDosya, arsivdenCikarDosya, deleteDosya } from "@/lib/actions/dosyalar";

// ─── Arşivle ────────────────────────────────────────────────────────────────

export function ArsivleButonu({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Bu dosyayı arşivlemek istediğinizden emin misiniz?")) return;
    startTransition(async () => {
      const res = await arsivleDosya(id);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Dosya arşivlendi.");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 transition-colors"
      title="Arşivle"
    >
      <Archive className="w-3.5 h-3.5" />
      {pending ? "..." : "Arşivle"}
    </button>
  );
}

// ─── Arşivden Çıkar ─────────────────────────────────────────────────────────

export function ArsivdenCikarButonu({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await arsivdenCikarDosya(id);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Dosya arşivden çıkarıldı.");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
      title="Arşivden Çıkar"
    >
      <ArchiveRestore className="w-3.5 h-3.5" />
      {pending ? "..." : "Geri Al"}
    </button>
  );
}

// ─── Kalıcı Sil (sadece arşivden) ────────────────────────────────────────────

export function KaliciSilButonu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const res = await deleteDosya(id);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Dosya kalıcı olarak silindi.");
      }
      setOpen(false);
    });
  }

  if (open) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs text-red-600 font-medium">Emin misiniz?</span>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-2 py-1 text-xs font-medium rounded border text-slate-600 hover:bg-slate-100"
        >
          İptal
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
      title="Kalıcı Sil"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Sil
    </button>
  );
}

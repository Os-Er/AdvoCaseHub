"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  arsivleUzlastirma,
  arsivdenCikarUzlastirma,
  deleteUzlastirma,
} from "@/lib/actions/uzlastirma";

export function ArsivleButonu({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Bu kaydı arşivlemek istediğinizden emin misiniz?")) return;
    startTransition(async () => {
      const res = await arsivleUzlastirma(id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Kayıt arşivlendi.");
    });
  }

  return (
    <button onClick={handleClick} disabled={pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 transition-colors">
      <Archive className="w-3.5 h-3.5" />
      {pending ? "..." : "Arşivle"}
    </button>
  );
}

export function ArsivdenCikarButonu({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await arsivdenCikarUzlastirma(id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Kayıt arşivden çıkarıldı.");
    });
  }

  return (
    <button onClick={handleClick} disabled={pending}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">
      <ArchiveRestore className="w-3.5 h-3.5" />
      {pending ? "..." : "Geri Al"}
    </button>
  );
}

export function KaliciSilButonu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const res = await deleteUzlastirma(id);
      if ("error" in res) toast.error(res.error);
      else toast.success("Kayıt kalıcı olarak silindi.");
      setOpen(false);
    });
  }

  if (open) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs text-red-600 font-medium">Emin misiniz?</span>
        <button onClick={handleConfirm} disabled={pending}
          className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
          {pending ? "..." : "Evet, Sil"}
        </button>
        <button onClick={() => setOpen(false)}
          className="px-2 py-1 text-xs font-medium rounded border text-slate-600 hover:bg-slate-100">
          İptal
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
      <Trash2 className="w-3.5 h-3.5" />
      Sil
    </button>
  );
}

"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  endpoint: "/api/export/dosyalar" | "/api/export/vekaletnameler" | "/api/export/makbuzlar";
  params: Record<string, string>;
  label?: string;
}

export function ExportButton({ endpoint, params, label = "Dışa Aktar" }: ExportButtonProps) {
  function handleExport() {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
    const url = sp.toString() ? `${endpoint}?${sp}` : endpoint;
    window.location.href = url;
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border-2 transition-colors hover:opacity-90 active:scale-95"
      style={{ borderColor: "#C9A84C", color: "#1B2A4A", backgroundColor: "#C9A84C18" }}
      title="Mevcut filtreyle CSV indir (Excel'de açılır)"
    >
      <Download className="w-4 h-4" style={{ color: "#C9A84C" }} />
      {label}
    </button>
  );
}

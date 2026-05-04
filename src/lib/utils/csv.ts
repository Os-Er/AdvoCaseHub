/**
 * CSV yardımcıları
 * Değerler RFC 4180 uyumlu — Excel'de düzgün açılır.
 */

export function escapeCSV(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCSV(headers: string[], rows: unknown[][]): string {
  const bom = "﻿"; // BOM: Excel'de Türkçe karakter desteği
  const head = headers.map(escapeCSV).join(",");
  const body = rows.map((r) => r.map(escapeCSV).join(",")).join("\r\n");
  return `${bom}${head}\r\n${body}`;
}

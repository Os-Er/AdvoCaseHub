"use client";

import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

interface GrafikVeri {
  yil: string;
  dosyaSayisi: number;
  makbuzToplam: number;
}

interface Props {
  veri: GrafikVeri[];
}

function formatTLKisa(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₺`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}K ₺`;
  return `${value} ₺`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-slate-800">
            {p.name === "Makbuz (₺)" ? formatTLKisa(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function IstatistikGrafik({ veri }: Props) {
  if (!veri || veri.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Grafik için yeterli veri yok.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={veri} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="yil"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="dosya"
          orientation="left"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          label={{ value: "Dosya", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#94a3b8" } }}
        />
        <YAxis
          yAxisId="makbuz"
          orientation="right"
          tickFormatter={formatTLKisa}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => <span style={{ color: "#64748b" }}>{value}</span>}
        />
        <Bar
          yAxisId="dosya"
          dataKey="dosyaSayisi"
          name="Dosya Sayısı"
          fill="#1B2A4A"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
        <Line
          yAxisId="makbuz"
          type="monotone"
          dataKey="makbuzToplam"
          name="Makbuz (₺)"
          stroke="#C9A84C"
          strokeWidth={2.5}
          dot={{ fill: "#C9A84C", r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

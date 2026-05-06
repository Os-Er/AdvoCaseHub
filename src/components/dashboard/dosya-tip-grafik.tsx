"use client";

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface Props {
  hukuk:  number;
  ceza:   number;
  icra:   number;
}

const DATA_KONFIG = [
  { key: "hukuk",  label: "Hukuk", renk: "#1B2A4A" },
  { key: "ceza",   label: "Ceza",  renk: "#C9A84C" },
  { key: "icra",   label: "İcra",  renk: "#475569" },
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <span className="font-semibold text-slate-800">{name}: </span>
      <span className="text-slate-600">{value} dosya</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.06) return null; // Çok küçük dilim
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function DosyaTipGrafik({ hukuk, ceza, icra }: Props) {
  const values = { hukuk, ceza, icra };
  const data = DATA_KONFIG
    .map((k) => ({ name: k.label, value: values[k.key], renk: k.renk }))
    .filter((d) => d.value > 0);

  const toplam = hukuk + ceza + icra;

  if (toplam === 0) {
    return (
      <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
        <span className="text-3xl">📂</span>
        <span>Henüz aktif dosya yok.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={42}
            dataKey="value"
            paddingAngle={2}
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.renk} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
            formatter={(value) => <span style={{ color: "#64748b" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Sayı özeti */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {DATA_KONFIG.map((k) => (
          <div key={k.key} className="rounded-lg py-2 px-1"
            style={{ backgroundColor: k.renk + "14" }}>
            <p className="text-lg font-bold tabular-nums" style={{ color: k.renk }}>
              {values[k.key]}
            </p>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: k.renk + "cc" }}>
              {k.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

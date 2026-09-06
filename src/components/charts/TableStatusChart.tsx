'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function TableStatusChart({ segments, total }: { segments: Segment[]; total: number }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={segments.filter((s) => s.value > 0).length > 1 ? 3 : 0}
            stroke="none"
          >
            {segments.map((segment) => (
              <Cell key={segment.label} fill={segment.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#14161c',
              border: '1px solid #262a34',
              borderRadius: 8,
              color: '#f4f5f7',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text">{total}</span>
        <span className="text-xs text-text-muted">Total Meja</span>
      </div>
    </div>
  );
}

'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface RevenueChartProps {
  data: { label: string; total: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#262a34" vertical={false} />
        <XAxis dataKey="label" stroke="#5b6270" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#5b6270"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(value: number) => (value >= 1000 ? `${value / 1000}k` : `${value}`)}
        />
        <Tooltip
          contentStyle={{
            background: '#14161c',
            border: '1px solid #262a34',
            borderRadius: 8,
            color: '#f4f5f7',
          }}
          labelStyle={{ color: '#9aa0ac' }}
          formatter={(value) => [formatCurrency(Number(value)), 'Omzet']}
        />
        <Area type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

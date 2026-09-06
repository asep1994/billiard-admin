import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: { value: string; direction: 'up' | 'down'; suffix: string };
}

export function StatCard({ label, value, icon: Icon, iconClassName, trend }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            iconClassName ?? 'bg-primary-soft text-primary'
          }`}
        >
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-xl font-semibold text-text">{value}</p>
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span
            className={`flex items-center gap-0.5 font-medium ${
              trend.direction === 'up' ? 'text-primary' : 'text-danger'
            }`}
          >
            {trend.direction === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend.value}
          </span>
          <span className="text-text-faint">{trend.suffix}</span>
        </div>
      )}
    </div>
  );
}

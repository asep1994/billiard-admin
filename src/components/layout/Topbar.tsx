'use client';

import { useState } from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  vendor_admin: 'Vendor Admin',
  staff: 'Staff',
};

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="text-text-muted lg:hidden">
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-text">{title}</h1>
          <p className="hidden text-xs text-text-muted sm:block">
            Selamat datang kembali, {user?.name?.split(' ')[0] ?? 'Admin'}!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted sm:block">
          {today}
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-sm text-text hover:bg-surface-hover"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium leading-tight">{user?.name}</span>
              <span className="block text-[11px] leading-tight text-text-muted">
                {user ? ROLE_LABELS[user.role] : ''}
              </span>
            </span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-surface-hover"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

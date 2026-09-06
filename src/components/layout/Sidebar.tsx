'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleDot, X } from 'lucide-react';
import { navItems } from '@/lib/nav';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const visibleItems = navItems.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <>
      {isOpen && (
        <button
          aria-label="Tutup menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <CircleDot size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-text">
                {user?.vendor?.name ?? 'Billiard Admin'}
              </p>
              {user?.vendor?.status && (
                <p className="text-xs text-text-faint">Vendor {user.vendor.status === 'active' ? 'aktif' : 'nonaktif'}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted lg:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

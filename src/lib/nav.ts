import {
  LayoutDashboard,
  CalendarCheck,
  Grid3x3,
  CalendarClock,
  Users,
  CreditCard,
  Wallet,
  Tag,
  BarChart3,
  Star,
  Bell,
  Settings,
  UserCog,
  History,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from './types';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Omit to allow every role. */
  roles?: UserRole[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Booking', href: '/bookings', icon: CalendarCheck },
  { label: 'Meja Billiard', href: '/tables', icon: Grid3x3 },
  { label: 'Jadwal', href: '/schedule', icon: CalendarClock },
  { label: 'Member', href: '/customers', icon: Users },
  { label: 'Pembayaran', href: '/payments', icon: CreditCard },
  { label: 'Komisi & Payout', href: '/commissions', icon: Wallet, roles: ['super_admin', 'vendor_admin'] },
  { label: 'Promo', href: '/promotions', icon: Tag },
  { label: 'Laporan', href: '/reports', icon: BarChart3 },
  { label: 'Ulasan', href: '/reviews', icon: Star },
  { label: 'Notifikasi', href: '/notifications', icon: Bell },
  { label: 'Pengaturan', href: '/settings', icon: Settings },
  { label: 'User & Role', href: '/users', icon: UserCog, roles: ['super_admin', 'vendor_admin'] },
  { label: 'Log Aktivitas', href: '/activity-log', icon: History, roles: ['super_admin', 'vendor_admin'] },
];

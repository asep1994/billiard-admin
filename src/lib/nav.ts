import {
  LayoutDashboard,
  CalendarCheck,
  Grid3x3,
  CalendarClock,
  Users,
  CreditCard,
  Tag,
  BarChart3,
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
  /** Pages not yet backed by a real API endpoint. */
  comingSoon?: boolean;
  /** Roles allowed to see this item. Omit to allow every role. */
  roles?: UserRole[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Booking', href: '/bookings', icon: CalendarCheck },
  { label: 'Meja Billiard', href: '/tables', icon: Grid3x3 },
  { label: 'Jadwal', href: '/schedule', icon: CalendarClock, comingSoon: true },
  { label: 'Member', href: '/customers', icon: Users },
  { label: 'Pembayaran', href: '/payments', icon: CreditCard, comingSoon: true },
  { label: 'Promo', href: '/promotions', icon: Tag, comingSoon: true },
  { label: 'Laporan', href: '/reports', icon: BarChart3, comingSoon: true },
  { label: 'Notifikasi', href: '/notifications', icon: Bell, comingSoon: true },
  { label: 'Pengaturan', href: '/settings', icon: Settings, comingSoon: true },
  { label: 'User & Role', href: '/users', icon: UserCog, roles: ['super_admin', 'vendor_admin'] },
  { label: 'Log Aktivitas', href: '/activity-log', icon: History, comingSoon: true },
];

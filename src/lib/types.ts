export type UserRole = 'super_admin' | 'vendor_admin' | 'staff';

export type Status = 'active' | 'inactive';

export type TableType = '8_ball' | '9_ball' | 'snooker' | 'carom';

export type TableStatus = 'available' | 'maintenance' | 'inactive';

export type BookingStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export type BookingPaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Vendor {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: Status;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  vendor_id: number | null;
  vendor?: Vendor;
}

export interface Venue {
  id: number;
  vendor_id: number;
  vendor?: Vendor;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  opening_time: string | null;
  closing_time: string | null;
  status: Status;
}

export interface BilliardTable {
  id: number;
  venue_id: number;
  venue?: Venue;
  name: string;
  type: TableType;
  hourly_rate: string;
  status: TableStatus;
}

export interface Customer {
  id: number;
  vendor_id: number;
  name: string;
  phone: string;
  email: string | null;
}

export interface Booking {
  id: number;
  vendor_id: number;
  venue_id: number;
  venue?: Venue;
  billiard_table_id: number;
  billiard_table?: BilliardTable;
  customer_id: number;
  customer?: Customer;
  user_id: number | null;
  created_by?: AuthUser;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: BookingPaymentStatus;
  total_price: string;
  notes: string | null;
  created_at: string;
}

export type PaymentGatewayStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface Payment {
  id: number;
  booking_id: number;
  booking?: Booking;
  merchant_order_id: string;
  duitku_reference: string | null;
  payment_method: string;
  amount: string;
  status: PaymentGatewayStatus;
  paid_at: string | null;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

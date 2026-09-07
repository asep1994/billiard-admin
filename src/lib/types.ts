export type UserRole = 'super_admin' | 'vendor_admin' | 'staff';

export type Status = 'active' | 'inactive';

export type TableType = '8_ball' | '9_ball' | 'snooker' | 'carom';

export type VenueFacility = 'parking' | 'ac' | 'food_drink' | 'wifi';

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
  commission_rate: number;
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
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  description: string | null;
  facilities: VenueFacility[];
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

export type PromotionType = 'percentage' | 'fixed';

export interface Promotion {
  id: number;
  vendor_id: number;
  code: string;
  type: PromotionType;
  value: string;
  max_discount: string | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
  is_valid_now: boolean;
  created_at: string;
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
  promotion_id: number | null;
  promotion?: Promotion;
  discount_amount: string;
  payable_amount: number;
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
  commission_amount: string | null;
  vendor_payout_amount: string | null;
  status: PaymentGatewayStatus;
  paid_at: string | null;
  created_at: string;
}

export interface CommissionSummary {
  vendor_id: number;
  vendor_name: string;
  commission_rate: number;
  gross_revenue: string;
  commission_earned: string;
  payout_owed: string;
  paid_out: string;
  outstanding_balance: string;
}

export interface Payout {
  id: number;
  vendor_id: number;
  vendor?: Vendor;
  user_id: number | null;
  recorded_by?: AuthUser;
  amount: string;
  note: string | null;
  paid_at: string;
  created_at: string;
}

export interface Review {
  id: number;
  vendor_id: number;
  venue_id: number;
  venue?: Venue;
  booking_id: number;
  booking?: Booking;
  customer_id: number;
  customer?: Customer;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  type: 'booking_created' | 'payment_received' | string;
  title: string;
  message: string;
  booking_id: number | null;
  read_at: string | null;
  created_at: string;
}

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'cancelled' | 'paid' | 'payout';

export interface ActivityLogEntry {
  id: number;
  action: ActivityAction;
  subject_type: string;
  subject_id: number | null;
  description: string;
  user?: AuthUser;
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

const STATUS_STYLES: Record<string, string> = {
  // booking status
  pending: 'bg-warning-soft text-warning',
  confirmed: 'bg-primary-soft text-primary',
  ongoing: 'bg-info-soft text-info',
  completed: 'bg-primary-soft text-primary',
  cancelled: 'bg-danger-soft text-danger',
  // payment status
  unpaid: 'bg-danger-soft text-danger',
  partial: 'bg-warning-soft text-warning',
  paid: 'bg-primary-soft text-primary',
  failed: 'bg-danger-soft text-danger',
  expired: 'bg-surface-hover text-text-faint',
  // generic / table status
  active: 'bg-primary-soft text-primary',
  available: 'bg-primary-soft text-primary',
  maintenance: 'bg-warning-soft text-warning',
  inactive: 'bg-danger-soft text-danger',
  // partner lead status
  new: 'bg-info-soft text-info',
  contacted: 'bg-warning-soft text-warning',
  converted: 'bg-primary-soft text-primary',
  rejected: 'bg-danger-soft text-danger',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ongoing: 'Berlangsung',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  unpaid: 'Belum Bayar',
  partial: 'Sebagian',
  paid: 'Lunas',
  failed: 'Gagal',
  expired: 'Kedaluwarsa',
  active: 'Aktif',
  available: 'Tersedia',
  maintenance: 'Maintenance',
  inactive: 'Nonaktif',
  new: 'Baru',
  contacted: 'Dihubungi',
  converted: 'Gabung',
  rejected: 'Ditolak',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? 'bg-surface-hover text-text-muted';
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

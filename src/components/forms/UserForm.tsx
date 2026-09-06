'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { FieldError } from '@/components/ui/FieldError';
import type { AuthUser, UserRole, Vendor } from '@/lib/types';

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  vendor_admin: 'Vendor Admin',
  staff: 'Staff',
};

export function UserForm({ targetUser }: { targetUser?: AuthUser }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isEdit = Boolean(targetUser);
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isSelf = targetUser?.id === currentUser?.id;

  const assignableRoles: UserRole[] = isSuperAdmin
    ? ['super_admin', 'vendor_admin', 'staff']
    : ['vendor_admin', 'staff'];

  const [name, setName] = useState(targetUser?.name ?? '');
  const [email, setEmail] = useState(targetUser?.email ?? '');
  const [role, setRole] = useState<UserRole>(targetUser?.role ?? (isSuperAdmin ? 'vendor_admin' : 'staff'));
  const [vendorId, setVendorId] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const needsVendorPicker = isSuperAdmin && !isEdit && role !== 'super_admin';

  useEffect(() => {
    if (!needsVendorPicker) return;

    apiFetch<{ data: Vendor[] }>('/vendors?per_page=100').then((res) => setVendors(res.data));
  }, [needsVendorPicker]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      if (isEdit && targetUser) {
        const payload: Record<string, unknown> = { name, email, role };
        if (password) {
          payload.password = password;
          payload.password_confirmation = passwordConfirmation;
        }

        await apiFetch(`/users/${targetUser.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/users', {
          method: 'POST',
          body: JSON.stringify({
            name,
            email,
            role,
            password,
            password_confirmation: passwordConfirmation,
            vendor_id: needsVendorPicker ? Number(vendorId) : undefined,
          }),
        });
      }

      router.push('/users');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
        setFormError(err.message);
      } else {
        setFormError('Gagal menyimpan pengguna.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!targetUser) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await apiFetch(`/users/${targetUser.id}`, { method: 'DELETE' });
      router.push('/users');
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Gagal menghapus pengguna.');
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4">
      {formError && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      )}

      <Card className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm text-text-muted">Nama</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.name} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <FieldError messages={fieldErrors.email} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-text-muted">Role</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={isSelf}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          >
            {assignableRoles.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          {isSelf && <p className="mt-1 text-xs text-text-faint">Tidak bisa mengubah role akun sendiri.</p>}
          <FieldError messages={fieldErrors.role} />
        </div>

        {needsVendorPicker && (
          <div>
            <label className="mb-1 block text-sm text-text-muted">Vendor</label>
            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">Pilih vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            <FieldError messages={fieldErrors.vendor_id} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-text-muted">
              {isEdit ? 'Password Baru (opsional)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <FieldError messages={fieldErrors.password} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-muted">Konfirmasi Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>
        </div>
      </Card>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? 'Simpan Perubahan' : 'Tambah Pengguna'}
      </button>

      {isEdit && !isSelf && (
        <Card className="space-y-3 border-danger/30 p-5">
          {deleteError && <p className="text-sm text-danger">{deleteError}</p>}

          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="flex items-center gap-2 text-sm font-medium text-danger hover:underline"
            >
              <Trash2 size={15} />
              Hapus Pengguna
            </button>
          ) : (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm text-danger">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                Akun ini tidak akan bisa login lagi. Tindakan ini tidak bisa dibatalkan.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting && <Loader2 size={14} className="animate-spin" />}
                  Ya, Hapus Permanen
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-surface-hover"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </form>
  );
}

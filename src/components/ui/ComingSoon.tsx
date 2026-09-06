import { Construction } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-text-muted">
        <Construction size={26} />
      </div>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Halaman ini belum tersambung ke API. Menyusul di iterasi berikutnya.
      </p>
    </div>
  );
}

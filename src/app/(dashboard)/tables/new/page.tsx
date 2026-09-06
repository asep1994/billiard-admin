import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TableForm } from '@/components/forms/TableForm';

export default function NewTablePage() {
  return (
    <div className="space-y-4">
      <Link href="/tables" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Meja Billiard
      </Link>
      <TableForm />
    </div>
  );
}

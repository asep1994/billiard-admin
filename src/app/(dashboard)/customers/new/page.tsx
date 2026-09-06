import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CustomerForm } from '@/components/forms/CustomerForm';

export default function NewCustomerPage() {
  return (
    <div className="space-y-4">
      <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Member
      </Link>
      <CustomerForm />
    </div>
  );
}

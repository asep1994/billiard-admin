import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VendorForm } from '@/components/forms/VendorForm';

export default function NewVendorPage() {
  return (
    <div className="space-y-4">
      <Link href="/vendors" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Vendor
      </Link>
      <VendorForm />
    </div>
  );
}

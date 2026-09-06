import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VenueForm } from '@/components/forms/VenueForm';

export default function NewVenuePage() {
  return (
    <div className="space-y-4">
      <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke Pengaturan
      </Link>
      <VenueForm />
    </div>
  );
}

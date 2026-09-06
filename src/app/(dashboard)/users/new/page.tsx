import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { UserForm } from '@/components/forms/UserForm';

export default function NewUserPage() {
  return (
    <div className="space-y-4">
      <Link href="/users" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} />
        Kembali ke User &amp; Role
      </Link>
      <UserForm />
    </div>
  );
}

import Link from 'next/link';
import { VisitorForm } from '@/components/visitor-form';

export default function VisitorPage() {
  return (
    <div className="container-app">
      <header className="page-header pt-4">
        <h1 className="page-title">Visitor Entry</h1>
        <p className="page-subtitle">Request access to visit a resident</p>
      </header>

      <VisitorForm />

      <footer className="mt-10 text-center">
        <p className="text-sm text-gray-400">
          Your request will be sent to the resident for approval
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-sm text-coral-500 hover:text-coral-600"
        >
          Back to Demo Menu
        </Link>
      </footer>
    </div>
  );
}

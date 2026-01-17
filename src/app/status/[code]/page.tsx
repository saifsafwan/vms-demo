'use client';

import { use } from 'react';
import Link from 'next/link';
import { StatusDisplay } from '@/components/status-display';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useVisit } from '@/hooks';

interface StatusPageProps {
  params: Promise<{ code: string }>;
}

const POLL_INTERVAL = 5000;

export default function StatusPage({ params }: StatusPageProps) {
  const { code } = use(params);
  const { visit, isLoading, error } = useVisit(code, POLL_INTERVAL);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !visit) {
    return <ErrorState message={error ?? 'Visit request not found'} />;
  }

  return (
    <div className="container-app">
      <header className="page-header pt-4">
        <h1 className="page-title">Request Status</h1>
      </header>

      <StatusDisplay visit={visit} />

      <footer className="mt-12 text-center">
        <Link
          href="/"
          className="text-sm text-coral-500 hover:text-coral-600"
        >
          Back to Demo Menu
        </Link>
      </footer>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container-app">
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">?</span>
        </div>
        <h2 className="text-lg font-semibold text-red-500 mb-2">Not Found</h2>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

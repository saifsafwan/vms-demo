'use client';

import Link from 'next/link';
import { ResidentCard } from '@/components/resident-card';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useResidentsWithCounts } from '@/hooks';

const POLL_INTERVAL = 10000;

export default function ResidentsPage() {
  const { residents, isLoading, error } = useResidentsWithCounts(POLL_INTERVAL);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="container-app">
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app">
      <header className="page-header pt-4">
        <h1 className="page-title">Select Your Profile</h1>
        <p className="page-subtitle">Choose your resident profile to manage visitors</p>
      </header>

      <div className="space-y-4">
        {residents.map((resident) => (
          <ResidentCard
            key={resident.id}
            resident={resident}
            pendingCount={resident.pendingCount}
          />
        ))}
      </div>

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

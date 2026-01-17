'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { RequestCard } from '@/components/request-card';
import { LoadingState } from '@/components/ui/loading-spinner';
import { useResidentVisits } from '@/hooks';

interface ResidentDashboardProps {
  params: Promise<{ id: string }>;
}

const POLL_INTERVAL = 10000;

export default function ResidentDashboardPage({ params }: ResidentDashboardProps) {
  const { id } = use(params);
  const { resident, visits, stats, isLoading, error, refetch } = useResidentVisits(
    id,
    POLL_INTERVAL
  );

  const { pendingVisits, processedVisits } = useMemo(
    () => ({
      pendingVisits: visits.filter((v) => v.status === 'pending'),
      processedVisits: visits.filter((v) => v.status !== 'pending'),
    }),
    [visits]
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !resident) {
    return <ErrorState message={error ?? 'Resident not found'} />;
  }

  return (
    <div className="container-app">
      <ResidentHeader resident={resident} />
      <StatsGrid stats={stats} />

      <section className="mb-10">
        <h2 className="section-title">
          Pending Requests ({pendingVisits.length})
        </h2>

        {pendingVisits.length === 0 ? (
          <EmptyState message="No pending requests for your unit" />
        ) : (
          <div className="space-y-4">
            {pendingVisits.map((visit) => (
              <RequestCard key={visit.id} visit={visit} onUpdate={refetch} />
            ))}
          </div>
        )}
      </section>

      {processedVisits.length > 0 && (
        <section>
          <h2 className="section-title">Today's Activity</h2>
          <div className="space-y-4">
            {processedVisits.slice(0, 5).map((visit) => (
              <RequestCard key={visit.id} visit={visit} onUpdate={refetch} />
            ))}
          </div>
        </section>
      )}

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

// ============================================
// Sub-components
// ============================================

interface ResidentHeaderProps {
  resident: { name: string; unit_number: string };
}

function ResidentHeader({ resident }: ResidentHeaderProps) {
  return (
    <Card className="mb-8 bg-gradient-to-br from-coral-50 to-white border-coral-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-coral-600 font-medium">Welcome back</p>
          <h1 className="text-xl font-semibold text-navy-900 mt-1">
            {resident.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Unit {resident.unit_number}
          </p>
        </div>
        <Link href="/residents">
          <Button variant="ghost" size="sm">
            Switch
          </Button>
        </Link>
      </div>
    </Card>
  );
}

interface StatsGridProps {
  stats: { pending: number; approved: number; rejected: number };
}

function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      <StatCard value={stats.pending} label="Pending" color="text-amber-500" />
      <StatCard value={stats.approved} label="Approved" color="text-emerald-500" />
      <StatCard value={stats.rejected} label="Rejected" color="text-red-400" />
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  color: string;
}

function StatCard({ value, label, color }: StatCardProps) {
  return (
    <Card className="text-center py-4 px-3">
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="text-center py-10">
      <p className="text-gray-400">{message}</p>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="container-app">
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-red-500 mb-6">{message}</h2>
        <Link href="/residents">
          <Button>Back to Residents</Button>
        </Link>
      </div>
    </div>
  );
}

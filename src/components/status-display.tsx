'use client';

import { Card } from '@/components/ui';
import { QRPass } from '@/components/qr-pass';
import { VisitDetails } from '@/components/visit-details';
import type { Visit, VisitStatus } from '@/types';

interface StatusDisplayProps {
  visit: Visit;
}

export function StatusDisplay({ visit }: StatusDisplayProps) {
  const StatusComponent = STATUS_COMPONENTS[visit.status];

  return (
    <div className="space-y-5">
      <StatusComponent visit={visit} />
      <VisitDetails visit={visit} />
      {visit.status === 'pending' && (
        <p className="text-center text-sm text-gray-400 pt-2">
          This page will update automatically
        </p>
      )}
    </div>
  );
}

// ============================================
// Status-specific Components
// ============================================

const STATUS_COMPONENTS: Record<VisitStatus, React.FC<{ visit: Visit }>> = {
  approved: ApprovedStatus,
  rejected: RejectedStatus,
  pending: PendingStatus,
};

function ApprovedStatus({ visit }: { visit: Visit }) {
  return <QRPass visit={visit} />;
}

function RejectedStatus() {
  return (
    <Card className="text-center border-2 border-red-200 bg-red-50">
      <div className="py-6">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CrossIcon />
        </div>
        <h2 className="text-red-600 text-lg font-semibold mb-2">
          Request Rejected
        </h2>
        <p className="text-red-500 text-sm">Your entry request was not approved</p>
      </div>
    </Card>
  );
}

function PendingStatus() {
  return (
    <Card className="text-center border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white">
      <div className="py-6">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClockIcon />
        </div>

        <span className="inline-block px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-medium mb-4">
          PENDING
        </span>

        <h2 className="text-amber-700 font-semibold mb-2">
          Waiting for approval
        </h2>
        <p className="text-amber-600 text-sm">
          The resident has been notified of your request
        </p>
      </div>
    </Card>
  );
}

// ============================================
// Icons
// ============================================

function ClockIcon() {
  return (
    <svg
      className="w-7 h-7 text-amber-500 animate-pulse"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-7 h-7 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

'use client';

import Link from 'next/link';
import type { Resident } from '@/types';

interface ResidentCardProps {
  resident: Resident;
  pendingCount: number;
}

export function ResidentCard({ resident, pendingCount }: ResidentCardProps) {
  return (
    <Link href={`/resident/${resident.id}`} className="block group">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-150 hover:shadow-md hover:border-gray-200 active:scale-[0.98]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-semibold text-gray-600">
                {resident.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-navy-900">{resident.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Unit {resident.unit_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && <PendingBadge count={pendingCount} />}
            <ChevronIcon />
          </div>
        </div>
      </div>
    </Link>
  );
}

function PendingBadge({ count }: { count: number }) {
  return (
    <div
      className="flex items-center justify-center min-w-[28px] h-7 px-2 bg-coral-500 text-white rounded-full text-sm font-medium"
      aria-label={`${count} pending requests`}
    >
      {count}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

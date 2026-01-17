'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { formatTimeAgo, formatPhone } from '@/lib/utils';
import { updateVisitStatus } from '@/lib/actions';
import type { Visit } from '@/types';

interface RequestCardProps {
  visit: Visit;
  onUpdate: () => void;
}

export function RequestCard({ visit, onUpdate }: RequestCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    const result = await updateVisitStatus(visit.id, 'approved');
    setIsApproving(false);
    if (result.success) onUpdate();
  };

  const handleReject = async () => {
    setIsRejecting(true);
    const result = await updateVisitStatus(visit.id, 'rejected');
    setIsRejecting(false);
    if (result.success) onUpdate();
  };

  const isPending = visit.status === 'pending';

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-medium text-navy-900 text-lg">
            {visit.visitor_name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatPhone(visit.visitor_phone)}
          </p>
        </div>
        <Badge status={visit.status} />
      </div>

      <div className="flex gap-6 text-sm mb-4">
        <div>
          <span className="text-gray-400">Unit</span>
          <p className="font-medium text-gray-700 mt-0.5">{visit.unit_number}</p>
        </div>
        <div>
          <span className="text-gray-400">Purpose</span>
          <p className="font-medium text-gray-700 capitalize mt-0.5">
            {visit.purpose}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-5">{formatTimeAgo(visit.created_at)}</p>

      {isPending && (
        <div className="flex gap-3">
          <Button
            variant="success"
            className="flex-1"
            onClick={handleApprove}
            isLoading={isApproving}
            disabled={isRejecting}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleReject}
            isLoading={isRejecting}
            disabled={isApproving}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}

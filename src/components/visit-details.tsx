import { Card } from '@/components/ui';
import { formatPhone } from '@/lib/utils';
import type { Visit } from '@/types';

interface VisitDetailsProps {
  visit: Visit;
}

export function VisitDetails({ visit }: VisitDetailsProps) {
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
        Visit Details
      </h3>
      <dl className="space-y-3">
        <DetailRow label="Name" value={visit.visitor_name} />
        <DetailRow label="Phone" value={formatPhone(visit.visitor_phone)} />
        <DetailRow label="Unit" value={visit.unit_number} />
        <DetailRow label="Purpose" value={visit.purpose} capitalize />
      </dl>
    </Card>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  capitalize?: boolean;
}

function DetailRow({ label, value, capitalize }: DetailRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-medium text-gray-700 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

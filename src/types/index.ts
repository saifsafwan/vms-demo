// ============================================
// Domain Types
// ============================================

export type VisitStatus = 'pending' | 'approved' | 'rejected';

export type VisitPurpose = 'delivery' | 'personal' | 'service' | 'other';

// ============================================
// Database Entity Types
// ============================================

export interface Resident {
  id: string;
  name: string;
  unit_number: string;
  phone: string | null;
  created_at: string;
}

export interface Visit {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  unit_number: string;
  purpose: string;
  status: VisitStatus;
  pass_code: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

// ============================================
// Input/Form Types
// ============================================

export interface CreateVisitInput {
  visitor_name: string;
  visitor_phone: string;
  unit_number: string;
  purpose: string;
}

// ============================================
// UI Types
// ============================================

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

// ============================================
// Constants
// ============================================

export const VISIT_PURPOSES: SelectOption<VisitPurpose>[] = [
  { value: 'personal', label: 'Personal Visit' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'service', label: 'Service/Repair' },
  { value: 'other', label: 'Other' },
] as const;

export const VISIT_STATUS_CONFIG = {
  pending: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    label: 'Pending',
  },
  approved: {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    label: 'Approved',
  },
  rejected: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'Rejected',
  },
} as const;

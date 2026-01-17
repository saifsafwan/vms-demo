import { supabase } from '@/lib/supabase';
import { getExpiryTime } from '@/lib/utils';
import type { VisitStatus } from '@/types';

// ============================================
// Visit Actions
// ============================================

interface UpdateVisitStatusResult {
  success: boolean;
  error?: string;
}

/**
 * Updates a visit's status (approve or reject)
 */
export async function updateVisitStatus(
  visitId: string,
  status: VisitStatus
): Promise<UpdateVisitStatusResult> {
  try {
    const updateData: Record<string, unknown> = { status };

    // Set expiry time when approving
    if (status === 'approved') {
      updateData.expires_at = getExpiryTime(3); // 3 hours from now
    }

    const { error } = await supabase
      .from('visits')
      .update(updateData)
      .eq('id', visitId);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('Error updating visit status:', err);
    return { success: false, error: 'Failed to update status' };
  }
}

/**
 * Verifies a pass code and returns the visit if valid
 */
export async function verifyPassCode(code: string) {
  try {
    const { data: visit, error } = await supabase
      .from('visits')
      .select('*')
      .eq('pass_code', code.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { valid: false, reason: 'not_found' as const, visit: null };
      }
      throw error;
    }

    if (visit.status !== 'approved') {
      return { valid: false, reason: 'not_approved' as const, visit };
    }

    if (visit.expires_at && new Date(visit.expires_at) < new Date()) {
      return { valid: false, reason: 'expired' as const, visit };
    }

    return { valid: true, reason: 'valid' as const, visit };
  } catch (err) {
    console.error('Error verifying pass code:', err);
    return { valid: false, reason: 'error' as const, visit: null };
  }
}

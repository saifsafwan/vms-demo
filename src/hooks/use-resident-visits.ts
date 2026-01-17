'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getTodayStart } from '@/lib/utils';
import type { Visit, Resident } from '@/types';

interface VisitStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface UseResidentVisitsReturn {
  resident: Resident | null;
  visits: Visit[];
  stats: VisitStats;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const INITIAL_STATS: VisitStats = { pending: 0, approved: 0, rejected: 0 };

/**
 * Hook to fetch a resident's info and their unit's visits
 */
export function useResidentVisits(
  residentId: string,
  pollInterval?: number
): UseResidentVisitsReturn {
  const [resident, setResident] = useState<Resident | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<VisitStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch resident info
      const { data: residentData, error: residentError } = await supabase
        .from('residents')
        .select('*')
        .eq('id', residentId)
        .single();

      if (residentError) {
        if (residentError.code === 'PGRST116') {
          setError('Resident not found');
        } else {
          throw residentError;
        }
        setIsLoading(false);
        return;
      }

      setResident(residentData);

      // Fetch visits for this resident's unit (today only)
      const { data: visitsData, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .eq('unit_number', residentData.unit_number)
        .gte('created_at', getTodayStart())
        .order('created_at', { ascending: false });

      if (visitsError) throw visitsError;

      const fetchedVisits = visitsData ?? [];
      setVisits(fetchedVisits);

      // Calculate stats
      setStats({
        pending: fetchedVisits.filter((v) => v.status === 'pending').length,
        approved: fetchedVisits.filter((v) => v.status === 'approved').length,
        rejected: fetchedVisits.filter((v) => v.status === 'rejected').length,
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching resident data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [residentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for updates
  useEffect(() => {
    if (!pollInterval) return;

    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchData]);

  return { resident, visits, stats, isLoading, error, refetch: fetchData };
}

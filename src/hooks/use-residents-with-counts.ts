'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Resident } from '@/types';

interface ResidentWithCount extends Resident {
  pendingCount: number;
}

interface UseResidentsWithCountsReturn {
  residents: ResidentWithCount[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch residents with their pending visit counts
 */
export function useResidentsWithCounts(pollInterval?: number): UseResidentsWithCountsReturn {
  const [residents, setResidents] = useState<ResidentWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all residents
      const { data: residentsData, error: residentsError } = await supabase
        .from('residents')
        .select('*')
        .order('unit_number');

      if (residentsError) throw residentsError;
      if (!residentsData) {
        setResidents([]);
        setIsLoading(false);
        return;
      }

      // Fetch pending visit counts per unit
      const { data: pendingData, error: pendingError } = await supabase
        .from('visits')
        .select('unit_number')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Count pending visits per unit
      const pendingCounts: Record<string, number> = {};
      pendingData?.forEach((v) => {
        pendingCounts[v.unit_number] = (pendingCounts[v.unit_number] || 0) + 1;
      });

      // Merge counts with residents
      const residentsWithCounts = residentsData.map((r) => ({
        ...r,
        pendingCount: pendingCounts[r.unit_number] || 0,
      }));

      setResidents(residentsWithCounts);
      setError(null);
    } catch (err) {
      console.error('Error fetching residents:', err);
      setError('Failed to load residents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for updates
  useEffect(() => {
    if (!pollInterval) return;

    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, fetchData]);

  return { residents, isLoading, error };
}

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Resident } from '@/types';

interface UseResidentsReturn {
  residents: Resident[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch all residents from the database
 */
export function useResidents(): UseResidentsReturn {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResidents() {
      try {
        const { data, error: dbError } = await supabase
          .from('residents')
          .select('*')
          .order('unit_number');

        if (dbError) throw dbError;
        setResidents(data ?? []);
      } catch (err) {
        console.error('Error fetching residents:', err);
        setError('Failed to load residents');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResidents();
  }, []);

  return { residents, isLoading, error };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Visit } from '@/types';

interface UseVisitReturn {
  visit: Visit | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a single visit by pass code with optional polling
 */
export function useVisit(passCode: string, pollInterval?: number): UseVisitReturn {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisit = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('visits')
        .select('*')
        .eq('pass_code', passCode)
        .single();

      if (dbError) {
        if (dbError.code === 'PGRST116') {
          setError('Visit request not found');
        } else {
          throw dbError;
        }
        return;
      }

      setVisit(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching visit:', err);
      setError('Failed to load visit');
    } finally {
      setIsLoading(false);
    }
  }, [passCode]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  // Poll for updates if interval is provided and visit is pending
  useEffect(() => {
    if (!pollInterval || visit?.status !== 'pending') return;

    const interval = setInterval(fetchVisit, pollInterval);
    return () => clearInterval(interval);
  }, [pollInterval, visit?.status, fetchVisit]);

  return { visit, isLoading, error, refetch: fetchVisit };
}

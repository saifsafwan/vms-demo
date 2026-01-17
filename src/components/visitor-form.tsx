'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { generatePassCode } from '@/lib/utils';
import { visitorFormSchema, type VisitorFormData } from '@/lib/validations';
import { useResidents } from '@/hooks';
import { VISIT_PURPOSES } from '@/types';

export function VisitorForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const { residents, isLoading: isLoadingResidents } = useResidents();

  const unitOptions = useMemo(
    () =>
      residents.map((r) => ({
        value: r.unit_number,
        label: `${r.unit_number} - ${r.name}`,
      })),
    [residents]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      visitor_name: '',
      visitor_phone: '',
      unit_number: '',
      purpose: '',
    },
  });

  const onSubmit = async (data: VisitorFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const passCode = generatePassCode();

      const { error: dbError } = await supabase.from('visits').insert({
        ...data,
        pass_code: passCode,
        status: 'pending',
      });

      if (dbError) throw dbError;

      router.push(`/status/${passCode}`);
    } catch (err) {
      console.error('Error submitting visit request:', err);
      setSubmitError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          id="visitor_name"
          label="Your Full Name"
          placeholder="e.g., John Smith"
          error={errors.visitor_name?.message}
          autoComplete="name"
          {...register('visitor_name')}
        />

        <Input
          id="visitor_phone"
          label="Phone Number"
          type="tel"
          placeholder="e.g., 0123456789"
          error={errors.visitor_phone?.message}
          autoComplete="tel"
          {...register('visitor_phone')}
        />

        <Select
          id="unit_number"
          label="Which Unit Are You Visiting?"
          placeholder="Select unit..."
          options={unitOptions}
          error={errors.unit_number?.message}
          disabled={isLoadingResidents}
          {...register('unit_number')}
        />

        <Select
          id="purpose"
          label="Purpose of Visit"
          placeholder="Select purpose..."
          options={VISIT_PURPOSES}
          error={errors.purpose?.message}
          {...register('purpose')}
        />

        {submitError && (
          <div
            className="p-4 bg-red-50 text-red-600 rounded-xl text-sm"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Request Entry
          </Button>
        </div>
      </form>
    </Card>
  );
}

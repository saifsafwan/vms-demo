import { z } from 'zod';

/**
 * Validation schema for visitor entry form
 */
export const visitorFormSchema = z.object({
  visitor_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  visitor_phone: z
    .string()
    .min(10, 'Enter a valid phone number')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number'),
  unit_number: z
    .string()
    .min(1, 'Please select a unit'),
  purpose: z
    .string()
    .min(1, 'Please select a purpose'),
});

export type VisitorFormData = z.infer<typeof visitorFormSchema>;

/**
 * Validation schema for pass code verification
 */
export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Pass code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Invalid pass code format'),
});

export type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

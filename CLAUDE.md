# PRD-slim: Visitor Pass MVP

**Build Time:** 1 day (solo developer)
**Deployment:** Netlify (static export)
**Database:** Supabase
**UI Style:** Monzo Banking App

---

## 1. Product Overview

### What It Does
A simple visitor pass system for an apartment building:
1. **Visitor** fills out a form to request entry to a specific unit
2. **Resident** of that unit sees the request and approves/rejects (each resident only sees their own unit's requests)
3. **Visitor** gets a QR code pass if approved
4. **Guard** verifies pass by entering the code

### Key Demo Feature
Each resident only sees and manages requests for **their own unit**. This demonstrates multi-user functionality without requiring authentication.

### What's NOT Included (Intentionally)
- No user authentication/login (residents selected from a list)
- No multi-tenant support (single building)
- No admin panel
- No staff dashboard (replaced by resident-specific dashboards)
- No camera QR scanning (manual code entry)
- No real-time WebSockets (uses polling)
- No analytics or reports

---

## 2. User Flows

### Flow 1: Visitor Requests Entry
```
Visitor lands on homepage (/)
    ↓
Fills form: Name, Phone, Unit (dropdown), Purpose
    ↓
Clicks "Request Entry"
    ↓
Redirected to /status/[code]
    ↓
Sees "Pending" status
    ↓
Page polls every 5 seconds for updates
```

### Flow 2: Resident Selects Profile (Demo "Login")
```
Resident opens /residents
    ↓
Sees list of all residents with pending counts
    ↓
Clicks their name (e.g., "Ahmad Ibrahim - A-12-1")
    ↓
Redirected to /resident/[id]
```

### Flow 3: Resident Approves/Rejects
```
Resident views their dashboard (/resident/[id])
    ↓
Sees ONLY requests for their unit
    ↓
Clicks "Approve" or "Reject"
    ↓
Database updated
    ↓
Visitor's status page reflects change
```

### Flow 4: Guard Verifies Pass
```
Guard opens /verify
    ↓
Enters 6-character pass code
    ↓
System checks:
  - Code exists?
  - Status = approved?
  - Not expired?
    ↓
Shows VALID (green) or INVALID (red)
```

---

## 3. Pages & Routes

| Route | Purpose | Who Uses It |
|-------|---------|-------------|
| `/` | Visitor entry form (with unit dropdown) | Visitor |
| `/status/[code]` | Request status + QR pass | Visitor |
| `/residents` | List of residents (demo "login") | Resident |
| `/resident/[id]` | Resident's dashboard (their unit only) | Resident |
| `/verify` | Verify pass codes | Guard |

---

## 4. Database Schema

### Supabase Setup Instructions

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** in the sidebar
3. Run this SQL:

```sql
-- =============================================
-- STEP 1: Create the residents table (run first)
-- =============================================
CREATE TABLE residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit_number TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

-- Allow all operations for MVP (no auth)
CREATE POLICY "Allow all operations on residents" ON residents
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- STEP 2: Seed demo residents (run second)
-- =============================================
INSERT INTO residents (name, unit_number, phone) VALUES
  ('Ahmad Ibrahim', 'A-12-1', '0123456789'),
  ('Sarah Tan', 'A-12-2', '0129876543'),
  ('Raj Kumar', 'B-05-3', '0121234567'),
  ('Lisa Wong', 'C-08-1', '0125551234');

-- =============================================
-- STEP 3: Create the visits table (run third)
-- =============================================
CREATE TABLE visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  unit_number TEXT NOT NULL REFERENCES residents(unit_number),
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  pass_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_pass_code ON visits(pass_code);
CREATE INDEX idx_visits_unit ON visits(unit_number);
CREATE INDEX idx_visits_created_at ON visits(created_at DESC);

-- Enable Row Level Security (but allow all for MVP)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow all operations for MVP (no auth)
CREATE POLICY "Allow all operations on visits" ON visits
  FOR ALL USING (true) WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

4. Get your credentials from **Settings > API**:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon public key

### Database Diagram
```
┌─────────────────┐         ┌─────────────────┐
│   residents     │         │     visits      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ name            │◄────────│ unit_number (FK)│
│ unit_number (U) │         │ visitor_name    │
│ phone           │         │ visitor_phone   │
│ created_at      │         │ purpose         │
└─────────────────┘         │ status          │
                            │ pass_code (U)   │
  4 demo residents          │ created_at      │
  pre-seeded                │ updated_at      │
                            │ expires_at      │
                            └─────────────────┘
```

---

## 5. Tech Stack & Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@supabase/supabase-js": "^2.x",
    "qrcode": "^1.5.x",
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/qrcode": "^1.5.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

### Install Command
```bash
npm install @supabase/supabase-js qrcode react-hook-form zod @hookform/resolvers
npm install -D @types/qrcode
```

---

## 6. UI Design System (Monzo-Inspired)

### Color Palette
```typescript
// tailwind.config.ts colors
const colors = {
  coral: {
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCC',
    300: '#FFADAD',
    400: '#FF8080',
    500: '#FF5A5F',  // Primary
    600: '#E6484D',
    700: '#CC3A3F',
    800: '#B32D31',
    900: '#992024',
  },
  navy: {
    900: '#14233C',  // Dark text
  }
}
```

### Design Tokens
```css
/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

/* Typography */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 30px;
```

### Component Styling Guidelines

**Buttons:**
- Height: 48px minimum (touch-friendly)
- Border radius: 12px
- Font weight: 600 (semibold)
- Full width on mobile
- Subtle shadow on primary

**Cards:**
- Background: white
- Border radius: 16px
- Padding: 20px
- Shadow: shadow-md
- No borders (shadow defines edges)

**Inputs:**
- Height: 52px
- Border radius: 12px
- Border: 1px solid #E5E5E5
- Focus: coral-500 border + ring
- Padding: 16px

**Status Badges:**
- Pending: Yellow background (#FFF8E5), dark text
- Approved: Green background (#E5FFF5), dark text
- Rejected: Red background (#FFE5E5), dark text
- Border radius: full (pill shape)
- Padding: 6px 12px

---

## 7. File Structure

```
src/
├── app/
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Visitor form (/)
│   ├── residents/
│   │   └── page.tsx             # Resident selector (demo login)
│   ├── resident/
│   │   └── [id]/
│   │       └── page.tsx         # Resident's unit dashboard
│   ├── status/
│   │   └── [code]/
│   │       └── page.tsx         # Status + QR
│   └── verify/
│       └── page.tsx             # Guard pass verification
├── components/
│   ├── ui/
│   │   ├── button.tsx           # Reusable button
│   │   ├── card.tsx             # Card container
│   │   ├── input.tsx            # Form input
│   │   └── badge.tsx            # Status badge
│   ├── visitor-form.tsx         # Entry form with unit dropdown
│   ├── resident-card.tsx        # Resident selector card
│   ├── request-card.tsx         # Visit request item
│   ├── qr-pass.tsx              # QR code display
│   └── status-display.tsx       # Status page content
├── lib/
│   ├── supabase.ts              # Supabase client
│   └── utils.ts                 # Helper functions
└── types/
    └── index.ts                 # TypeScript types
```

---

## 8. Detailed Implementation

### 8.1 Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

### 8.2 TypeScript Types

**File: `src/types/index.ts`**
```typescript
export type VisitStatus = 'pending' | 'approved' | 'rejected';

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

export interface CreateVisitInput {
  visitor_name: string;
  visitor_phone: string;
  unit_number: string;
  purpose: string;
}

export type VisitPurpose =
  | 'delivery'
  | 'personal'
  | 'service'
  | 'other';

export const PURPOSES: { value: VisitPurpose; label: string }[] = [
  { value: 'personal', label: 'Personal Visit' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'service', label: 'Service/Repair' },
  { value: 'other', label: 'Other' },
];
```

---

### 8.3 Supabase Client

**File: `src/lib/supabase.ts`**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

### 8.4 Utility Functions

**File: `src/lib/utils.ts`**
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate 6-character alphanumeric code
export function generatePassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I,O,0,1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Format phone number for display
export function formatPhone(phone: string): string {
  // Simple format: (XXX) XXX-XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Format relative time
export function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Format countdown timer
export function formatCountdown(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return 'Expired';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${mins}m remaining`;
  }
  return `${mins}m remaining`;
}

// Check if pass is expired
export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
```

**Note:** You'll also need `clsx` and `tailwind-merge`:
```bash
npm install clsx tailwind-merge
```

---

### 8.5 UI Components

**File: `src/components/ui/button.tsx`**
```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-coral-500 text-white hover:bg-coral-600 active:bg-coral-700 shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
```

**File: `src/components/ui/card.tsx`**
```typescript
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-2xl p-5 shadow-md',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold text-gray-900', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
```

**File: `src/components/ui/input.tsx`**
```typescript
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full h-13 px-4 text-base rounded-xl border border-gray-200',
            'focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500',
            'placeholder:text-gray-400 transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
```

**File: `src/components/ui/badge.tsx`**
```typescript
import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { VisitStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: VisitStatus;
}

const statusConfig = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'Pending',
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    label: 'Approved',
  },
  rejected: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'Rejected',
  },
};

export function Badge({ status, className, ...props }: BadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
        config.bg,
        config.text,
        className
      )}
      {...props}
    >
      {config.label}
    </span>
  );
}
```

---

### 8.6 Tailwind Configuration

**File: `tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFCCCC',
          300: '#FFADAD',
          400: '#FF8080',
          500: '#FF5A5F',
          600: '#E6484D',
          700: '#CC3A3F',
          800: '#B32D31',
          900: '#992024',
        },
      },
      height: {
        '13': '3.25rem', // 52px for inputs
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### 8.7 Global Styles

**File: `src/app/globals.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-gray-50 text-gray-900;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }
}

@layer components {
  .container-app {
    @apply max-w-md mx-auto px-4 py-6;
  }

  .page-title {
    @apply text-2xl font-bold text-gray-900 mb-6;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* Focus visible for accessibility */
*:focus-visible {
  outline: 2px solid #FF5A5F;
  outline-offset: 2px;
}
```

---

### 8.8 Root Layout

**File: `src/app/layout.tsx`**
```typescript
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Visitor Pass',
  description: 'Request and manage visitor passes',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF5A5F',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
```

---

### 8.9 Visitor Entry Form Component

**File: `src/components/visitor-form.tsx`**
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { generatePassCode } from '@/lib/utils';
import { PURPOSES, Resident } from '@/types';

const formSchema = z.object({
  visitor_name: z.string().min(2, 'Name must be at least 2 characters'),
  visitor_phone: z.string().min(10, 'Enter a valid phone number'),
  unit_number: z.string().min(1, 'Please select a unit'),
  purpose: z.string().min(1, 'Please select a purpose'),
});

type FormData = z.infer<typeof formSchema>;

export function VisitorForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const router = useRouter();

  // Fetch residents for unit dropdown
  useEffect(() => {
    async function fetchResidents() {
      const { data } = await supabase
        .from('residents')
        .select('*')
        .order('unit_number');
      if (data) setResidents(data);
    }
    fetchResidents();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const passCode = generatePassCode();

      const { error: dbError } = await supabase
        .from('visits')
        .insert({
          ...data,
          pass_code: passCode,
          status: 'pending',
        });

      if (dbError) throw dbError;

      router.push(`/status/${passCode}`);
    } catch (err) {
      console.error('Error submitting:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="visitor_name"
          label="Your Full Name"
          placeholder="e.g., John Smith"
          error={errors.visitor_name?.message}
          {...register('visitor_name')}
        />

        <Input
          id="visitor_phone"
          label="Phone Number"
          type="tel"
          placeholder="e.g., 0123456789"
          error={errors.visitor_phone?.message}
          {...register('visitor_phone')}
        />

        {/* Unit dropdown from residents table */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Which Unit Are You Visiting?
          </label>
          <select
            {...register('unit_number')}
            className="w-full h-13 px-4 text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
          >
            <option value="">Select unit...</option>
            {residents.map((r) => (
              <option key={r.id} value={r.unit_number}>
                {r.unit_number} - {r.name}
              </option>
            ))}
          </select>
          {errors.unit_number && (
            <p className="mt-1.5 text-sm text-red-500">{errors.unit_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Visit
          </label>
          <select
            {...register('purpose')}
            className="w-full h-13 px-4 text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 bg-white"
          >
            <option value="">Select purpose...</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {errors.purpose && (
            <p className="mt-1.5 text-sm text-red-500">{errors.purpose.message}</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Request Entry
        </Button>
      </form>
    </Card>
  );
}
```

---

### 8.10 Homepage (Visitor Form)

**File: `src/app/page.tsx`**
```typescript
import { VisitorForm } from '@/components/visitor-form';

export default function HomePage() {
  return (
    <div className="container-app">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Visitor Entry
        </h1>
        <p className="text-gray-500">
          Request access to visit a resident
        </p>
      </div>

      <VisitorForm />

      <p className="text-center text-sm text-gray-400 mt-6">
        Your request will be sent to the resident for approval
      </p>
    </div>
  );
}
```

---

### 8.11 QR Pass Component

**File: `src/components/qr-pass.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { Visit } from '@/types';
import { formatCountdown, isExpired } from '@/lib/utils';

interface QRPassProps {
  visit: Visit;
}

export function QRPass({ visit }: QRPassProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const expired = visit.expires_at ? isExpired(visit.expires_at) : false;

  useEffect(() => {
    // Generate QR code
    const qrData = JSON.stringify({
      code: visit.pass_code,
      name: visit.visitor_name,
      unit: visit.unit_number,
      expires: visit.expires_at,
    });

    QRCode.toDataURL(qrData, {
      width: 280,
      margin: 2,
      color: {
        dark: '#14233C',
        light: '#FFFFFF',
      },
    }).then(setQrDataUrl);
  }, [visit]);

  useEffect(() => {
    // Update countdown every second
    if (!visit.expires_at) return;

    const interval = setInterval(() => {
      setCountdown(formatCountdown(visit.expires_at!));
    }, 1000);

    return () => clearInterval(interval);
  }, [visit.expires_at]);

  if (expired) {
    return (
      <Card className="text-center bg-red-50 border-2 border-red-200">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Pass Expired
        </div>
        <p className="text-red-500 text-sm">
          This pass is no longer valid
        </p>
      </Card>
    );
  }

  return (
    <Card className="text-center border-2 border-emerald-200 bg-emerald-50/30">
      <div className="mb-4">
        <span className="inline-block px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-semibold">
          APPROVED
        </span>
      </div>

      <p className="text-gray-600 mb-4">Show this QR code to the guard</p>

      {qrDataUrl && (
        <div className="flex justify-center mb-4">
          <img
            src={qrDataUrl}
            alt="Pass QR Code"
            className="rounded-xl shadow-lg"
          />
        </div>
      )}

      <div className="bg-white rounded-xl p-4 mb-4">
        <div className="text-3xl font-mono font-bold text-gray-900 tracking-wider">
          {visit.pass_code}
        </div>
        <p className="text-sm text-gray-500 mt-1">Backup Code</p>
      </div>

      <div className="text-sm">
        <span className="text-gray-500">Valid for: </span>
        <span className="font-semibold text-emerald-600">{countdown}</span>
      </div>
    </Card>
  );
}
```

---

### 8.12 Status Display Component

**File: `src/components/status-display.tsx`**
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRPass } from '@/components/qr-pass';
import { Visit } from '@/types';
import { formatPhone } from '@/lib/utils';

interface StatusDisplayProps {
  visit: Visit;
}

export function StatusDisplay({ visit }: StatusDisplayProps) {
  if (visit.status === 'approved') {
    return (
      <div className="space-y-4">
        <QRPass visit={visit} />
        <VisitDetails visit={visit} />
      </div>
    );
  }

  if (visit.status === 'rejected') {
    return (
      <div className="space-y-4">
        <Card className="text-center border-2 border-red-200 bg-red-50">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Request Rejected
          </div>
          <p className="text-red-500 text-sm">
            Your entry request was not approved
          </p>
        </Card>
        <VisitDetails visit={visit} />
      </div>
    );
  }

  // Pending status
  return (
    <div className="space-y-4">
      <Card className="text-center border-2 border-amber-200 bg-amber-50">
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="inline-block px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-semibold">
            PENDING
          </span>
        </div>

        <p className="text-amber-700 font-medium mb-2">
          Waiting for approval
        </p>
        <p className="text-amber-600 text-sm">
          The resident has been notified of your request
        </p>
      </Card>

      <VisitDetails visit={visit} />

      <p className="text-center text-sm text-gray-400">
        This page will update automatically
      </p>
    </div>
  );
}

function VisitDetails({ visit }: { visit: Visit }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-3">Visit Details</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">Name</dt>
          <dd className="font-medium text-gray-900">{visit.visitor_name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Phone</dt>
          <dd className="font-medium text-gray-900">{formatPhone(visit.visitor_phone)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Unit</dt>
          <dd className="font-medium text-gray-900">{visit.unit_number}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Purpose</dt>
          <dd className="font-medium text-gray-900 capitalize">{visit.purpose}</dd>
        </div>
      </dl>
    </Card>
  );
}
```

---

### 8.13 Status Page

**File: `src/app/status/[code]/page.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { StatusDisplay } from '@/components/status-display';
import { Visit } from '@/types';

export default function StatusPage() {
  const params = useParams();
  const code = params.code as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisit() {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('pass_code', code)
        .single();

      if (error) {
        setError('Visit request not found');
        setLoading(false);
        return;
      }

      setVisit(data);
      setLoading(false);
    }

    fetchVisit();

    // Poll for updates every 5 seconds if pending
    const interval = setInterval(() => {
      if (visit?.status === 'pending') {
        fetchVisit();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [code, visit?.status]);

  if (loading) {
    return (
      <div className="container-app">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !visit) {
    return (
      <div className="container-app">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg font-semibold mb-2">
            Not Found
          </div>
          <p className="text-gray-500">{error || 'Visit request not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Request Status
        </h1>
      </div>

      <StatusDisplay visit={visit} />
    </div>
  );
}
```

---

### 8.14 Request Card Component

**File: `src/components/request-card.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Visit } from '@/types';
import { formatTimeAgo, formatPhone } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface RequestCardProps {
  visit: Visit;
  onUpdate: () => void;
}

export function RequestCard({ visit, onUpdate }: RequestCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);

    // Set expiry to 3 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 3);

    await supabase
      .from('visits')
      .update({
        status: 'approved',
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', visit.id);

    setIsApproving(false);
    onUpdate();
  };

  const handleReject = async () => {
    setIsRejecting(true);

    await supabase
      .from('visits')
      .update({ status: 'rejected' })
      .eq('id', visit.id);

    setIsRejecting(false);
    onUpdate();
  };

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{visit.visitor_name}</h3>
          <p className="text-sm text-gray-500">{formatPhone(visit.visitor_phone)}</p>
        </div>
        <Badge status={visit.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="text-gray-500">Unit: </span>
          <span className="font-medium">{visit.unit_number}</span>
        </div>
        <div>
          <span className="text-gray-500">Purpose: </span>
          <span className="font-medium capitalize">{visit.purpose}</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 mb-4">
        {formatTimeAgo(visit.created_at)}
      </div>

      {visit.status === 'pending' && (
        <div className="flex gap-3">
          <Button
            variant="success"
            className="flex-1"
            onClick={handleApprove}
            isLoading={isApproving}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={handleReject}
            isLoading={isRejecting}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
```

---

### 8.15 Resident Card Component

**File: `src/components/resident-card.tsx`**
```typescript
'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Resident } from '@/types';

interface ResidentCardProps {
  resident: Resident;
  pendingCount: number;
}

export function ResidentCard({ resident, pendingCount }: ResidentCardProps) {
  return (
    <Link href={`/resident/${resident.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{resident.name}</h3>
            <p className="text-sm text-gray-500">Unit {resident.unit_number}</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center justify-center w-8 h-8 bg-coral-500 text-white rounded-full text-sm font-bold">
              {pendingCount}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
```

---

### 8.16 Resident Selector Page

**File: `src/app/residents/page.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ResidentCard } from '@/components/resident-card';
import { Button } from '@/components/ui/button';
import { Resident } from '@/types';

interface ResidentWithCount extends Resident {
  pendingCount: number;
}

export default function ResidentsPage() {
  const [residents, setResidents] = useState<ResidentWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResidents() {
      // Fetch all residents
      const { data: residentsData } = await supabase
        .from('residents')
        .select('*')
        .order('unit_number');

      if (!residentsData) {
        setLoading(false);
        return;
      }

      // Fetch pending counts for each resident's unit
      const { data: pendingData } = await supabase
        .from('visits')
        .select('unit_number')
        .eq('status', 'pending');

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
      setLoading(false);
    }

    fetchResidents();

    // Refresh every 10 seconds
    const interval = setInterval(fetchResidents, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container-app">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-app">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Profile
        </h1>
        <p className="text-gray-500">
          Choose your resident profile to manage visitors
        </p>
      </div>

      <div className="space-y-3">
        {residents.map((resident) => (
          <ResidentCard
            key={resident.id}
            resident={resident}
            pendingCount={resident.pendingCount}
          />
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <Link href="/">
          <Button variant="ghost" className="w-full">
            ← Back to Visitor Form
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### 8.17 Resident Dashboard Page

**File: `src/app/resident/[id]/page.tsx`**
```typescript
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { RequestCard } from '@/components/request-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Visit, Resident } from '@/types';

export default function ResidentDashboardPage() {
  const params = useParams();
  const residentId = params.id as string;

  const [resident, setResident] = useState<Resident | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const fetchData = useCallback(async () => {
    // Fetch resident info
    const { data: residentData } = await supabase
      .from('residents')
      .select('*')
      .eq('id', residentId)
      .single();

    if (!residentData) {
      setLoading(false);
      return;
    }

    setResident(residentData);

    // Fetch visits for this resident's unit only
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: visitsData } = await supabase
      .from('visits')
      .select('*')
      .eq('unit_number', residentData.unit_number)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });

    if (visitsData) {
      setVisits(visitsData);
      setStats({
        pending: visitsData.filter((v) => v.status === 'pending').length,
        approved: visitsData.filter((v) => v.status === 'approved').length,
        rejected: visitsData.filter((v) => v.status === 'rejected').length,
      });
    }

    setLoading(false);
  }, [residentId]);

  useEffect(() => {
    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const pendingVisits = visits.filter((v) => v.status === 'pending');
  const processedVisits = visits.filter((v) => v.status !== 'pending');

  if (loading) {
    return (
      <div className="container-app">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="container-app">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-500">Resident not found</h2>
          <Link href="/residents">
            <Button className="mt-4">Back to Residents</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app">
      {/* Resident Header */}
      <Card className="mb-6 bg-coral-50 border-coral-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-coral-600 font-medium">Welcome back</p>
            <h1 className="text-xl font-bold text-gray-900">{resident.name}</h1>
            <p className="text-sm text-gray-500">Unit {resident.unit_number}</p>
          </div>
          <Link href="/residents">
            <Button variant="ghost" size="sm">Switch</Button>
          </Link>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-emerald-500">{stats.approved}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
          <div className="text-xs text-gray-500">Rejected</div>
        </Card>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Requests ({pendingVisits.length})
        </h2>

        {pendingVisits.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">No pending requests for your unit</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingVisits.map((visit) => (
              <RequestCard key={visit.id} visit={visit} onUpdate={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Today's Activity */}
      {processedVisits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Activity
          </h2>
          <div className="space-y-4">
            {processedVisits.slice(0, 5).map((visit) => (
              <RequestCard key={visit.id} visit={visit} onUpdate={fetchData} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 8.18 Verify Page

**File: `src/app/verify/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Visit } from '@/types';
import { formatPhone, isExpired } from '@/lib/utils';

type VerifyResult = {
  status: 'valid' | 'invalid' | 'expired';
  visit?: Visit;
  message: string;
};

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setResult({
        status: 'invalid',
        message: 'Please enter a 6-character code',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    const { data: visit } = await supabase
      .from('visits')
      .select('*')
      .eq('pass_code', code.toUpperCase())
      .single();

    setLoading(false);

    if (!visit) {
      setResult({
        status: 'invalid',
        message: 'Pass code not found',
      });
      return;
    }

    if (visit.status !== 'approved') {
      setResult({
        status: 'invalid',
        visit,
        message: `Pass status: ${visit.status}`,
      });
      return;
    }

    if (visit.expires_at && isExpired(visit.expires_at)) {
      setResult({
        status: 'expired',
        visit,
        message: 'This pass has expired',
      });
      return;
    }

    setResult({
      status: 'valid',
      visit,
      message: 'Access Granted',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="container-app">
      <h1 className="page-title text-center">Verify Pass</h1>

      <Card className="mb-6">
        <div className="mb-4">
          <Input
            id="code"
            label="Enter Pass Code"
            placeholder="e.g., ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={6}
            className="text-center text-2xl font-mono tracking-widest uppercase"
          />
        </div>

        <Button
          onClick={handleVerify}
          isLoading={loading}
          className="w-full"
          size="lg"
        >
          Verify
        </Button>
      </Card>

      {result && (
        <ResultDisplay result={result} />
      )}
    </div>
  );
}

function ResultDisplay({ result }: { result: VerifyResult }) {
  const configs = {
    valid: {
      bg: 'bg-emerald-50 border-emerald-300',
      icon: '✓',
      iconBg: 'bg-emerald-500',
      titleColor: 'text-emerald-700',
    },
    invalid: {
      bg: 'bg-red-50 border-red-300',
      icon: '✗',
      iconBg: 'bg-red-500',
      titleColor: 'text-red-700',
    },
    expired: {
      bg: 'bg-amber-50 border-amber-300',
      icon: '!',
      iconBg: 'bg-amber-500',
      titleColor: 'text-amber-700',
    },
  };

  const config = configs[result.status];

  return (
    <Card className={`border-2 ${config.bg}`}>
      <div className="text-center mb-4">
        <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}>
          <span className="text-white text-3xl font-bold">{config.icon}</span>
        </div>
        <h2 className={`text-xl font-bold ${config.titleColor}`}>
          {result.message}
        </h2>
      </div>

      {result.visit && (
        <div className="border-t pt-4 mt-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Visitor</dt>
              <dd className="font-medium">{result.visit.visitor_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{formatPhone(result.visit.visitor_phone)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Unit</dt>
              <dd className="font-medium">{result.visit.unit_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Purpose</dt>
              <dd className="font-medium capitalize">{result.visit.purpose}</dd>
            </div>
          </dl>
        </div>
      )}
    </Card>
  );
}
```

---

### 8.17 Next.js Configuration for Netlify

**File: `next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

**Note:** Since we're using static export, the polling approach works better than SSR. All data fetching happens client-side.

---

## 9. Deployment to Netlify

### Option A: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=out
```

### Option B: Deploy via Git
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub repo
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Deploy!

---

## 10. Testing Checklist

### Visitor Flow
- [ ] Open `/` - see visitor form with unit dropdown
- [ ] Unit dropdown shows all 4 residents
- [ ] Fill form and select a unit
- [ ] Submit - redirected to `/status/[code]`
- [ ] See "Pending" status
- [ ] Page auto-refreshes every 5 seconds

### Resident Selection Flow
- [ ] Open `/residents` - see all 4 residents
- [ ] Residents with pending requests show badge count
- [ ] Click a resident - go to their dashboard

### Resident Approval Flow
- [ ] On `/resident/[id]` - see ONLY requests for that resident's unit
- [ ] Create request for Unit A-12-1
- [ ] Ahmad's dashboard shows request, Sarah's dashboard does NOT
- [ ] Click "Approve" - status changes to approved
- [ ] Visitor page shows QR code
- [ ] Click "Reject" on another request
- [ ] Visitor page shows "Rejected"

### Guard Flow
- [ ] Open `/verify`
- [ ] Enter valid code - see "Valid" + details
- [ ] Enter invalid code - see "Invalid"
- [ ] Wait for pass to expire - see "Expired"

### Demo Scenarios
- [ ] **Scenario 1:** Request to A-12-1, login as Ahmad, approve, verify QR
- [ ] **Scenario 2:** Request to B-05-3, login as Ahmad (shouldn't see it), login as Raj (should see it)
- [ ] **Scenario 3:** Verify expired pass shows "Expired"

### Edge Cases
- [ ] Invalid form data shows errors
- [ ] Non-existent code shows "Not Found"
- [ ] Non-existent resident ID shows error
- [ ] Page works on mobile
- [ ] Polling updates work correctly

---

## 11. Quick Reference

### All Dependencies
```bash
npm install @supabase/supabase-js qrcode react-hook-form zod @hookform/resolvers clsx tailwind-merge
npm install -D @types/qrcode
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
```

### Key Files Count: 20

**Pages (6):**
1. `src/app/layout.tsx`
2. `src/app/page.tsx`
3. `src/app/globals.css`
4. `src/app/residents/page.tsx`
5. `src/app/resident/[id]/page.tsx`
6. `src/app/status/[code]/page.tsx`
7. `src/app/verify/page.tsx`

**Components (9):**
8. `src/components/ui/button.tsx`
9. `src/components/ui/card.tsx`
10. `src/components/ui/input.tsx`
11. `src/components/ui/badge.tsx`
12. `src/components/visitor-form.tsx`
13. `src/components/resident-card.tsx`
14. `src/components/request-card.tsx`
15. `src/components/qr-pass.tsx`
16. `src/components/status-display.tsx`

**Lib & Config (4):**
17. `src/lib/supabase.ts`
18. `src/lib/utils.ts`
19. `src/types/index.ts`
20. `next.config.js`

### Build & Deploy
```bash
npm run build    # Creates 'out' folder
netlify deploy --prod --dir=out
```

---

**Total estimated implementation time: 3-4 hours**

Good luck with your MVP!

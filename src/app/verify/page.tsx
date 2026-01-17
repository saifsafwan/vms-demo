'use client';

import { useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@/components/ui';
import { formatPhone } from '@/lib/utils';
import { verifyPassCode } from '@/lib/actions';
import type { Visit } from '@/types';

type VerifyStatus = 'valid' | 'invalid' | 'expired';

interface VerifyResult {
  status: VerifyStatus;
  visit: Visit | null;
  message: string;
}

const PASS_CODE_LENGTH = 6;

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const handleVerify = async () => {
    if (code.length !== PASS_CODE_LENGTH) {
      setResult({
        status: 'invalid',
        visit: null,
        message: 'Please enter a 6-character code',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    const verification = await verifyPassCode(code);
    setIsLoading(false);

    const resultMap: Record<string, VerifyResult> = {
      valid: {
        status: 'valid',
        visit: verification.visit,
        message: 'Access Granted',
      },
      not_found: {
        status: 'invalid',
        visit: null,
        message: 'Pass code not found',
      },
      not_approved: {
        status: 'invalid',
        visit: verification.visit,
        message: `Pass status: ${verification.visit?.status ?? 'unknown'}`,
      },
      expired: {
        status: 'expired',
        visit: verification.visit,
        message: 'This pass has expired',
      },
      error: {
        status: 'invalid',
        visit: null,
        message: 'Verification failed. Please try again.',
      },
    };

    setResult(resultMap[verification.reason]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(
      value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, PASS_CODE_LENGTH)
    );
  };

  return (
    <div className="container-app">
      <header className="page-header pt-4">
        <h1 className="page-title">Verify Pass</h1>
        <p className="page-subtitle">Enter the visitor's pass code</p>
      </header>

      <Card className="mb-6">
        <div className="mb-6">
          <Input
            id="code"
            label="Pass Code"
            placeholder="ABC123"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={PASS_CODE_LENGTH}
            className="text-center text-2xl font-mono tracking-[0.3em] uppercase"
            autoComplete="off"
            autoCapitalize="characters"
          />
        </div>

        <Button
          onClick={handleVerify}
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Verify
        </Button>
      </Card>

      {result && <ResultDisplay result={result} />}

      <footer className="mt-12 text-center">
        <Link
          href="/"
          className="text-sm text-coral-500 hover:text-coral-600"
        >
          Back to Demo Menu
        </Link>
      </footer>
    </div>
  );
}

// ============================================
// Result Display
// ============================================

interface ResultDisplayProps {
  result: VerifyResult;
}

const STATUS_CONFIG: Record<
  VerifyStatus,
  {
    cardBg: string;
    iconBg: string;
    icon: string;
    titleColor: string;
  }
> = {
  valid: {
    cardBg: 'bg-emerald-50 border-emerald-200',
    iconBg: 'bg-emerald-500',
    icon: '✓',
    titleColor: 'text-emerald-700',
  },
  invalid: {
    cardBg: 'bg-red-50 border-red-200',
    iconBg: 'bg-red-500',
    icon: '✗',
    titleColor: 'text-red-700',
  },
  expired: {
    cardBg: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-500',
    icon: '!',
    titleColor: 'text-amber-700',
  },
};

function ResultDisplay({ result }: ResultDisplayProps) {
  const config = STATUS_CONFIG[result.status];

  return (
    <Card className={`border-2 ${config.cardBg}`}>
      <div className="text-center mb-6">
        <div
          className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <span className="text-white text-3xl font-bold" aria-hidden="true">
            {config.icon}
          </span>
        </div>
        <h2 className={`text-xl font-semibold ${config.titleColor}`}>
          {result.message}
        </h2>
      </div>

      {result.visit && <VisitorDetails visit={result.visit} />}
    </Card>
  );
}

function VisitorDetails({ visit }: { visit: Visit }) {
  return (
    <div className="border-t border-gray-200 pt-5">
      <dl className="space-y-3">
        <DetailRow label="Visitor" value={visit.visitor_name} />
        <DetailRow label="Phone" value={formatPhone(visit.visitor_phone)} />
        <DetailRow label="Unit" value={visit.unit_number} />
        <DetailRow label="Purpose" value={visit.purpose} capitalize />
      </dl>
    </div>
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

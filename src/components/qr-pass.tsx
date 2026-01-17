'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui';
import { formatCountdown, isExpired } from '@/lib/utils';
import type { Visit } from '@/types';

interface QRPassProps {
  visit: Visit;
}

export function QRPass({ visit }: QRPassProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<string>('');
  const expired = visit.expires_at ? isExpired(visit.expires_at) : false;

  useEffect(() => {
    const qrData = JSON.stringify({
      code: visit.pass_code,
      name: visit.visitor_name,
      unit: visit.unit_number,
      expires: visit.expires_at,
    });

    QRCode.toDataURL(qrData, {
      width: 240,
      margin: 2,
      color: {
        dark: '#14233C',
        light: '#FFFFFF',
      },
    }).then(setQrDataUrl);
  }, [visit]);

  useEffect(() => {
    if (!visit.expires_at) return;

    const updateCountdown = () => setCountdown(formatCountdown(visit.expires_at!));
    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [visit.expires_at]);

  if (expired) {
    return <ExpiredPass />;
  }

  return (
    <Card className="text-center border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white">
      <div className="mb-6">
        <span className="inline-block px-5 py-2 bg-emerald-500 text-white rounded-full text-sm font-medium">
          APPROVED
        </span>
      </div>

      <p className="text-gray-500 mb-6">Show this QR code to the guard</p>

      {qrDataUrl && (
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <img
              src={qrDataUrl}
              alt="Pass QR Code"
              className="rounded-xl"
              width={240}
              height={240}
            />
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-5 mb-5">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Backup Code
        </p>
        <div className="text-3xl font-mono font-semibold text-navy-900 tracking-[0.2em]">
          {visit.pass_code}
        </div>
      </div>

      <div className="text-sm">
        <span className="text-gray-400">Valid for </span>
        <span className="font-medium text-emerald-600">{countdown}</span>
      </div>
    </Card>
  );
}

function ExpiredPass() {
  return (
    <Card className="text-center bg-red-50 border-2 border-red-200">
      <div className="py-4">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <h3 className="text-red-600 text-lg font-semibold mb-2">Pass Expired</h3>
        <p className="text-red-500 text-sm">This pass is no longer valid</p>
      </div>
    </Card>
  );
}

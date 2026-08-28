'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, QrCode, CheckCircle2 } from 'lucide-react';
import { RegistrationFormData } from '@/lib/types';
import { formatCurrencyINR, calculateEventFee } from '@/lib/utils';

interface LivePassPreviewProps {
  formData: RegistrationFormData;
}

export function LivePassPreview({ formData }: LivePassPreviewProps) {
  const feeInfo = calculateEventFee(formData.semester);
  const isFresher = formData.semester === '1st Semester';
  const displayName = formData.name.trim() || 'STUDENT NAME';
  const displayPhone = formData.phone.trim() ? `+91 ${formData.phone}` : '+91 ••••• •••••';

  return (
    <div className="w-full flex flex-col items-center">
      {/* Live Indicator Pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-indigo-100 shadow-xs mb-3 text-[11px] font-bold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
        <span>Live Pass Preview</span>
        <span className="text-slate-400">&bull;</span>
        <span className="text-indigo-600 font-extrabold">{isFresher ? 'Fresher VIP' : 'Tech Delegate'}</span>
      </div>

      {/* Holographic Apple Wallet / Event Pass Card */}
      <div
        className={`w-full max-w-85 sm:max-w-90 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-2xl transition-all duration-500 group ${
          isFresher
            ? 'bg-linear-to-br from-indigo-900 via-indigo-800 to-slate-950 border border-indigo-500/40 shadow-indigo-900/30'
            : 'bg-linear-to-br from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 shadow-purple-900/30'
        }`}
      >
        {/* Holographic Foil Shimmer Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Pass Card Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 shadow-xs shrink-0">
              <Image
                src="/college-logo.png"
                alt="PBC Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-300">
                Panskura Banamali College
              </div>
              <div className="text-xs font-black tracking-tight text-white">
                BCA Annual Event 2026
              </div>
            </div>
          </div>

          <div className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/20">
            {isFresher ? 'Fresher VIP' : 'Delegate'}
          </div>
        </div>

        {/* Name & Semester Visualizer */}
        <div className="space-y-3 relative z-10 mb-4">
          <div>
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Attendee Name</div>
            <div className="text-base sm:text-lg font-black tracking-tight text-white truncate drop-shadow-xs">
              {displayName}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Semester</div>
              <div className="font-extrabold text-indigo-200">{formData.semester}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Entry Tier Fee</div>
              <div className="font-extrabold text-emerald-400">{formatCurrencyINR(feeInfo.amountInINR)}</div>
            </div>
          </div>

          <div>
            <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Registered Mobile</div>
            <div className="font-mono text-xs font-bold text-slate-300">{displayPhone}</div>
          </div>
        </div>

        {/* Pass Ticket Perforation Notch */}
        <div className="relative flex items-center justify-between my-2 -mx-6 sm:-mx-7 px-2">
          <div className="w-4 h-8 bg-[#f6f8fd] rounded-r-full border-r border-slate-300" />
          <div className="flex-1 border-b-2 border-dashed border-white/25 mx-2" />
          <div className="w-4 h-8 bg-[#f6f8fd] rounded-l-full border-l border-slate-300" />
        </div>

        {/* Pass Bottom / Barcode & Security Badge */}
        <div className="pt-2 flex items-center justify-between relative z-10">
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pass ID (On Checkout)</div>
            <div className="font-mono text-sm font-black text-white tracking-widest">
              #6-DIGIT-PASS
            </div>
            <div className="text-[9px] text-indigo-300 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Instant Digital Pass Issuance</span>
            </div>
          </div>

          {/* Simulated QR Badge */}
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
            <QrCode className="w-10 h-10 text-slate-900" />
          </div>
        </div>

        {/* Perks pill list */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Grand Feast
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-indigo-400" />
            Contest Entry
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            Certificates
          </span>
        </div>
      </div>
    </div>
  );
}

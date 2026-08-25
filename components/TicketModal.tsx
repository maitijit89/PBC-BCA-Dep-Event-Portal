'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CheckCircle, Copy, Printer, X, ShieldCheck, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrencyINR } from '@/lib/utils';

export interface TicketDetails {
  ticketId: string;
  name: string;
  email: string;
  phone: string;
  semester: string;
  amountPaid: number;
  paymentId: string;
  timestamp: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketDetails | null;
}

export function TicketModal({ isOpen, onClose, ticket }: TicketModalProps) {
  useEffect(() => {
    if (isOpen) {
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.6 },
          zIndex: 9999,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const copyTicketId = () => {
    navigator.clipboard.writeText(ticket.ticketId);
    toast.success('6-Digit Pass ID copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/40 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl liquid-glass p-5 sm:p-9 shadow-2xl text-slate-900 my-auto border-white/90 no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 sm:p-2.5 rounded-full liquid-glass-subtle text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-all no-print cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 mb-3 shadow-md shadow-emerald-500/10 backdrop-blur-xl">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Payment Verified!</h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-medium">
            Your registration is confirmed. A copy has been dispatched to{' '}
            <span className="font-bold text-indigo-700">{ticket.email}</span>.
          </p>
        </div>

        {/* Apple Liquid Glass Digital Pass */}
        <div
          id="ticket-pass-print"
          className="rounded-3xl liquid-glass-card border-2 border-dashed border-indigo-300/80 p-6 relative overflow-hidden shadow-inner"
        >
          {/* Ticket Header */}
          <div className="flex items-center justify-between border-b border-indigo-100/80 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/90 border border-white p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/college-logo.png"
                  alt="Panskura Banamali College"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">
                  Panskura Banamali College
                </div>
                <div className="text-sm font-extrabold text-slate-900">BCA Event Pass 2026</div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              CONFIRMED
            </div>
          </div>

          {/* 6-DIGIT PASS ID DISPLAY */}
          <div className="text-center my-4 liquid-glass-card rounded-2xl p-4 border-indigo-200/80 shadow-md">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Unique 6-Digit Entry ID
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-indigo-700 tracking-[0.25em] select-all drop-shadow-xs">
              {ticket.ticketId}
            </div>
            <div className="mt-2.5 flex items-center justify-center gap-2">
              <button
                onClick={copyTicketId}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle hover:bg-white text-indigo-700 text-xs font-bold transition-all no-print cursor-pointer active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy ID
              </button>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="space-y-2.5 text-xs font-medium">
            <div className="flex justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500">Attendee Name:</span>
              <span className="font-bold text-slate-900 text-right">{ticket.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500">Semester:</span>
              <span className="font-bold text-slate-900 text-right">{ticket.semester}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500">Phone:</span>
              <span className="font-mono text-slate-700 text-right">{ticket.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-black text-emerald-700 text-right">
                {formatCurrencyINR(ticket.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500">Payment ID:</span>
              <span className="font-mono text-[11px] text-slate-500 text-right truncate max-w-42.5">
                {ticket.paymentId}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Issued On:</span>
              <span className="text-slate-600 text-right">{ticket.timestamp}</span>
            </div>
          </div>

          {/* Ticket pass footer */}
          <div className="mt-4 pt-3.5 border-t border-indigo-100/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Show this pass at reception desk</span>
            <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold">
              <QrCode className="w-3.5 h-3.5" />
              Scan Ready
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 mt-6 no-print">
          <button
            onClick={handlePrint}
            className="apple-glass-btn flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save Pass
          </button>
          <button
            onClick={onClose}
            className="apple-glass-btn-secondary flex-1 inline-flex items-center justify-center px-5 py-3.5 rounded-2xl text-slate-700 font-bold text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

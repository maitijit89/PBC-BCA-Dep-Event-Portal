'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

// Target event date: Saturday, October 10, 2026 09:30:00 IST
const EVENT_DATE = new Date('2026-10-10T09:30:00+05:30').getTime();

export function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = EVENT_DATE - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Panskura Banamali College//BCA Department Event//EN',
      'BEGIN:VEVENT',
      'SUMMARY:BCA Annual Department Event 2026',
      'DESCRIPTION:Grand Annual BCA Department Event at Panskura Banamali College. Coding competitions, tech quiz, grand buffet feast, and award ceremony.',
      'LOCATION:College Auditorium, Panskura Banamali College, Purba Medinipur, West Bengal',
      'DTSTART:20261010T040000Z',
      'DTEND:20261010T113000Z',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'bca-department-event-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Event calendar invite (.ics) downloaded!');
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=BCA+Annual+Department+Event+2026&dates=20261010T040000Z/20261010T113000Z&details=Grand+Annual+BCA+Department+Event+at+Panskura+Banamali+College.+Competitions,+buffet+lunch,+and+awards.&location=Auditorium,+Panskura+Banamali+College`;

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-4 sm:p-5 rounded-3xl liquid-glass border border-white/80 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Countdown Info & Badges */}
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide border border-indigo-500/20 mb-1">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>Event Countdown</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 justify-center sm:justify-start">
            <span>Saturday, October 10, 2026</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-indigo-600 font-bold">09:30 AM IST</span>
          </div>
        </div>

        {/* Countdown Digits */}
        <div className="flex items-center gap-2">
          {/* Days */}
          <div className="flex flex-col items-center bg-white/90 border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-12.5 shadow-xs">
            <span className="text-lg sm:text-xl font-mono font-black text-slate-900 leading-tight">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Days</span>
          </div>

          <span className="text-sm font-bold text-slate-400">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center bg-white/90 border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-12.5 shadow-xs">
            <span className="text-lg sm:text-xl font-mono font-black text-slate-900 leading-tight">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Hours</span>
          </div>

          <span className="text-sm font-bold text-slate-400">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center bg-white/90 border border-slate-100 rounded-xl px-2.5 py-1.5 min-w-12.5 shadow-xs">
            <span className="text-lg sm:text-xl font-mono font-black text-slate-900 leading-tight">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Mins</span>
          </div>

          <span className="text-sm font-bold text-slate-400">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center bg-indigo-50/90 border border-indigo-100 rounded-xl px-2.5 py-1.5 min-w-12.5 shadow-xs">
            <span className="text-lg sm:text-xl font-mono font-black text-indigo-600 leading-tight">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600">Secs</span>
          </div>
        </div>

        {/* Add to Calendar Actions */}
        <div className="flex items-center gap-1.5">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs"
            title="Add to Google Calendar"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Google Cal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            onClick={handleDownloadICS}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Download Apple / Outlook iCal"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.ICS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

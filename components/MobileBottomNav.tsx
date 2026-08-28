'use client';

import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, UserPlus, Calendar, HelpCircle } from 'lucide-react';

export function MobileBottomNav() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'tracker', 'register', 'details', 'support'];
      const scrollPos = window.scrollY + window.innerHeight * 0.35;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 70;
      const elPos = el.getBoundingClientRect().top;
      const offsetPos = elPos + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPos,
        behavior: 'smooth',
      });
      setActiveSection(id);
    }
  };

  return (
    <nav
      aria-label="Mobile Web App Dock"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 transition-all duration-300"
    >
      <div className="bg-white/90 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-[0_12px_36px_-6px_rgba(15,23,42,0.2),0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1.5px_rgba(255,255,255,1)] p-1.5 flex items-center justify-around">
        {/* Home */}
        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'overview')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            activeSection === 'overview'
              ? 'text-indigo-600 bg-indigo-50/80 font-bold scale-[1.02]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Live Tracker */}
        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'tracker')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 relative cursor-pointer ${
            activeSection === 'tracker'
              ? 'text-indigo-600 bg-indigo-50/80 font-bold scale-[1.02]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <TrendingUp className="w-4.5 h-4.5 mb-0.5" />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[10px] tracking-tight">Tracker</span>
        </button>

        {/* Register (Prominent Center Button) */}
        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'register')}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 group-active:scale-95 transition-transform">
            <UserPlus className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-tight mt-0.5">Register</span>
        </button>

        {/* Schedule */}
        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'details')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            activeSection === 'details'
              ? 'text-indigo-600 bg-indigo-50/80 font-bold scale-[1.02]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Schedule</span>
        </button>

        {/* Helpdesk */}
        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'support')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
            activeSection === 'support'
              ? 'text-indigo-600 bg-indigo-50/80 font-bold scale-[1.02]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Help</span>
        </button>
      </div>
    </nav>
  );
}

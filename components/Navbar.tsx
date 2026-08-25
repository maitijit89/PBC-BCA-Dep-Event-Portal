'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 sm:py-3.5'
          : 'py-3 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 rounded-2xl sm:rounded-full px-3.5 sm:px-6 py-2.5 sm:py-3 ${
            scrolled
              ? 'bg-white/92 backdrop-blur-2xl shadow-[0_12px_36px_-10px_rgba(15,23,42,0.12),inset_0_1px_1.5px_rgba(255,255,255,1)] border border-white/90'
              : 'liquid-glass-subtle border-white/80'
          }`}
        >
          {/* Brand Logo & College Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0 border border-slate-100">
              <Image
                src="/college-logo.png"
                alt="Panskura Banamali College Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 truncate">
                  Panskura Banamali College
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/25 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live
                </span>
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 tracking-tight truncate">
                BCA Department Event 2026
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links (Apple Glass Segmented Pill) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/40 p-1.5 rounded-full border border-white/70 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
            <a
              href="#overview"
              onClick={(e) => handleNavClick(e, 'overview')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all duration-200"
            >
              Overview
            </a>
            <a
              href="#tracker"
              onClick={(e) => handleNavClick(e, 'tracker')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all duration-200 flex items-center gap-1.5"
            >
              Live Tracker
              <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/15 text-indigo-700 rounded-full font-extrabold border border-indigo-500/20">
                Live
              </span>
            </a>
            <a
              href="#register"
              onClick={(e) => handleNavClick(e, 'register')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all duration-200"
            >
              Register &amp; Pay
            </a>
            <a
              href="#details"
              onClick={(e) => handleNavClick(e, 'details')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all duration-200"
            >
              Schedule &amp; Perks
            </a>
            <a
              href="#support"
              onClick={(e) => handleNavClick(e, 'support')}
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-slate-700 hover:text-slate-950 hover:bg-white/80 transition-all duration-200"
            >
              Helpdesk
            </a>
          </nav>

          {/* Action Button (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="#register"
              onClick={(e) => handleNavClick(e, 'register')}
              className="apple-glass-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-xs font-bold transition-all cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Get Entry Pass</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/80 backdrop-blur-lg border border-white/90 text-slate-800 shadow-sm focus:outline-none touch-manipulation cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay + Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay to prevent tap-through */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden max-w-7xl mx-auto px-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200 relative z-50">
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-4 space-y-1.5 shadow-2xl border border-white/90">
              <a
                href="#overview"
                onClick={(e) => handleNavClick(e, 'overview')}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              >
                Overview
              </a>
              <a
                href="#tracker"
                onClick={(e) => handleNavClick(e, 'tracker')}
                className="flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              >
                <span>Live Fund Tracker</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-700 rounded-full font-extrabold border border-emerald-500/25">
                  Live
                </span>
              </a>
              <a
                href="#register"
                onClick={(e) => handleNavClick(e, 'register')}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/80 active:bg-indigo-100 transition-colors touch-manipulation cursor-pointer"
              >
                Student Registration
              </a>
              <a
                href="#details"
                onClick={(e) => handleNavClick(e, 'details')}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              >
                Schedule &amp; Perks
              </a>
              <a
                href="#support"
                onClick={(e) => handleNavClick(e, 'support')}
                className="block px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors touch-manipulation cursor-pointer"
              >
                Helpdesk
              </a>
              <div className="pt-2">
                <a
                  href="#register"
                  onClick={(e) => handleNavClick(e, 'register')}
                  className="apple-glass-btn w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg shadow-indigo-600/30 touch-manipulation cursor-pointer select-none"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Register &amp; Pay Now
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

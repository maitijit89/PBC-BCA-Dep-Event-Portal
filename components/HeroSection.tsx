"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Calendar,
  MapPin,
  ShieldCheck,
  Zap,
  Users,
  ArrowDown,
  CheckCircle2,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="overview"
      className="relative pt-28 pb-12 sm:pt-36 sm:pb-20 overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Top Tagline with College Logo (Liquid Glass Pill) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill mb-6 shadow-xs max-w-full">
          <div className="relative w-4.5 h-4.5 rounded-full overflow-hidden shrink-0 bg-white p-0.5 shadow-xs border border-slate-100">
            <Image
              src="/college-logo.png"
              alt="Panskura Banamali College Logo"
              width={18}
              height={18}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-700 truncate max-w-47.5 sm:max-w-none">
            BCA Department &bull; PBC
          </span>
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 font-extrabold border border-indigo-500/25 shrink-0">
            Freshers 2026
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
          Panskura Banamali College <br className="hidden sm:block" />
          <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-xs">
            BCA Annual Department Event
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xs sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed font-normal px-2">
          Join fellow programmers, tech innovators, and batchmates for an
          unforgettable day of coding challenges, tech quizzes, cultural
          performances, guest lectures, and grand department dining.
        </p>

        {/* Quick Meta Badges (Liquid Glass Chips) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-slate-700 text-[11px] sm:text-xs font-semibold hover:bg-white/80 transition-all">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Annual Gathering 2026</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-slate-700 text-xs font-semibold hover:bg-white/80 transition-all">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>College Auditorium</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-subtle text-slate-700 text-xs font-semibold hover:bg-white/80 transition-all">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Instant Digital Pass</span>
          </div>
        </div>

        {/* Dynamic Pricing Liquid Glass Interactive Preview Box */}
        <div className="max-w-lg mx-auto mb-8 p-3 rounded-3xl liquid-glass shadow-2xl">
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-left">
            {/* 1st Sem Card */}
            <div className="p-3.5 sm:p-5 rounded-2xl liquid-glass-card border-indigo-200/90 relative group hover:scale-[1.02] transition-all duration-300">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide mb-1.5 border border-indigo-500/20">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                1st Sem
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹100
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  / student
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-indigo-700 font-semibold mt-0.5">
                Welcome discount
              </p>
            </div>

            {/* 2nd - 8th Sem Card */}
            <div className="p-3.5 sm:p-5 rounded-2xl liquid-glass-card border-purple-200/90 relative group hover:scale-[1.02] transition-all duration-300">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide mb-1.5 border border-purple-500/20">
                <CheckCircle2 className="w-2.5 h-2.5 text-purple-600" />
                2nd to 8th Sem
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹250
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  / student
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-purple-700 font-semibold mt-0.5">
                Feast &amp; event kit
              </p>
            </div>
          </div>
        </div>

        {/* Apple Glass CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#register"
            className="apple-glass-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-white font-bold text-sm sm:text-base cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            Proceed to Registration
          </a>
          <a
            href="#tracker"
            className="apple-glass-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-slate-700 hover:text-slate-950 font-semibold text-sm sm:text-base"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            View Live Tracker
            <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </section>
  );
}

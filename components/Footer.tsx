"use client";

import React from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="liquid-glass-subtle border-t border-white/80 py-12 text-slate-500 text-xs relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200/60">
          {/* Logo & College Info */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full bg-white/90 border border-white p-0.5 shadow-md shadow-indigo-500/10 overflow-hidden flex items-center justify-center shrink-0">
              <Image
                src="/college-logo.png"
                alt="Panskura Banamali College"
                width={48}
                height={48}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                Department of Computer Application (BCA)
              </div>
              <div className="text-slate-500 font-medium mt-0.5">
                Panskura Banamali College (Autonomous) &bull; Purba Medinipur, West Bengal
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-slate-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} JitCoder. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Developed with{" "}
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by BCA Student
          </p>
        </div>
      </div>
    </footer>
  );
}

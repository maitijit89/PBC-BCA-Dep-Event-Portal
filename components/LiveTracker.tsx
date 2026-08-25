"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Users,
  TrendingUp,
  RefreshCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";
import { TrackerStats } from "@/lib/types";

export function LiveTracker() {
  const [stats, setStats] = useState<TrackerStats>({
    totalCollected: 0,
    totalRegistrations: 0,
    targetGoal: 60000,
    lastUpdated: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/tracker", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to fetch tracker stats:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;

    const runFetch = async () => {
      // Don't poll if document is hidden to save mobile battery & cellular data
      if (document.visibilityState === 'hidden') return;

      try {
        const res = await fetch('/api/tracker', { cache: 'no-store' });
        if (res.ok && isSubscribed) {
          const json = await res.json();
          if (json.success && json.data && isSubscribed) {
            setStats(json.data);
          }
        }
      } catch (err: unknown) {
        console.error('Failed to fetch tracker stats:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    runFetch();

    // Start polling interval
    intervalId = setInterval(runFetch, 20000);

    // Visibility change handler: pause when backgrounded, sync immediately when foregrounded
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runFetch();
        if (!intervalId) {
          intervalId = setInterval(runFetch, 20000);
        }
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const targetGoal = stats.targetGoal || 30000;
  const progressPercent = Math.min(
    100,
    Math.round((stats.totalCollected / targetGoal) * 100) || 0,
  );

  return (
    <section id="tracker" className="py-12 md:py-16 relative z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Liquid Glass Container */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Live Event Ledger Sync
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Total Collection &amp; Attendance
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Automatically polled and calculated from the official Google Sheet ledger
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                Last synced: {stats.lastUpdated}
              </span>
              <button
                onClick={() => fetchStats(true)}
                disabled={refreshing || loading}
                aria-label="Refresh collection tracker"
                className="apple-glass-btn-secondary flex items-center gap-2 px-4 py-2 rounded-full text-slate-700 text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`}
                />
                <span>{refreshing ? "Syncing..." : "Sync Live"}</span>
              </button>
            </div>
          </div>

          {/* 3 Liquid Glass Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 my-8">
            {/* Metric 1: Total Money Collected */}
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass-card border-indigo-200/80 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Total Collected
                </span>
                <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 border border-indigo-500/25 backdrop-blur-md">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-9 w-32 bg-slate-200/60 rounded-lg animate-pulse" />
                ) : (
                  formatCurrencyINR(stats.totalCollected)
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% verified Razorpay transactions
              </p>
            </div>

            {/* Metric 2: Registered Students */}
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass-card border-purple-200/80 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  Registered Students
                </span>
                <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-600 border border-purple-500/25 backdrop-blur-md">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-9 w-24 bg-slate-200/60 rounded-lg animate-pulse" />
                ) : (
                  `${stats.totalRegistrations} Students`
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Across 1st to 8th Semesters
              </p>
            </div>

            {/* Metric 3: Target Goal */}
            <div className="p-5 sm:p-6 rounded-3xl liquid-glass-card border-emerald-200/80 relative overflow-hidden group shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Department Goal
                </span>
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/25 backdrop-blur-md">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {loading ? (
                  <div className="h-9 w-28 bg-slate-200/60 rounded-lg animate-pulse" />
                ) : (
                  formatCurrencyINR(targetGoal)
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2.5 flex items-center gap-1.5 font-medium">
                <span className="font-bold text-emerald-600">
                  {progressPercent}%
                </span>{" "}
                of target budget collected
              </p>
            </div>
          </div>

          {/* Liquid Glass Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2.5">
              <span>Event Budget Progress</span>
              <span className="text-indigo-700 font-extrabold">
                {progressPercent}% Achieved
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-200/60 rounded-full overflow-hidden p-0.5 border border-white/80 backdrop-blur-md shadow-inner">
              <div
                className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-xs relative overflow-hidden"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

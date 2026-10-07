"use client";

// Metric cards summarizing organizational memory analytics
import React from "react";
import { HardDrive, Clock, Tag } from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface StatsCardsProps {
  totalCount: number;
  filteredCount: number;
  domainCounts: Record<string, number>;
  avgDurationSeconds: number;
  activeDomain?: string;
  onSelectDomain: (domain?: string) => void;
}

// Renders KPI stat cards across the top of the dashboard
export function StatsCards({
  totalCount,
  filteredCount,
  domainCounts,
  avgDurationSeconds,
  activeDomain,
  onSelectDomain,
}: StatsCardsProps) {
  const domains = Object.entries(domainCounts);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Memories</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{totalCount}</span>
          {filteredCount !== totalCount && (
            <span className="text-xs text-blue-600 font-medium">
              ({filteredCount} in view)
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Processed from audio recordings</p>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Duration</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {formatSeconds(avgDurationSeconds)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">Per recorded interaction</p>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs sm:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain Classification</span>
          </div>
          {activeDomain && (
            <button
              onClick={() => onSelectDomain(undefined)}
              className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 items-center">
          <button
            onClick={() => onSelectDomain(undefined)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              !activeDomain
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          {domains.map(([name, count]) => {
            const isSelected = activeDomain === name;
            return (
              <button
                key={name}
                onClick={() => onSelectDomain(isSelected ? undefined : name)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

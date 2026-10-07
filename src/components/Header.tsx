"use client";

// Navigation header with platform status and user roster trigger
import React from "react";
import { Database, Users, RefreshCw } from "lucide-react";

interface HeaderProps {
  businessId?: string;
  totalMemories?: number;
  usersCount?: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenUsers: () => void;
}

// Renders the main top bar with organization credentials and actions
export function Header({
  businessId,
  usersCount,
  isLoading,
  onRefresh,
  onOpenUsers,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-all shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">NeoCore Memory Platform</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                v2.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              Connected to api.neosapien.xyz
              {businessId && (
                <span className="text-slate-400">
                  Org: <span className="font-mono text-slate-600">{businessId.slice(0, 10)}...</span>
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenUsers}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            title="View Organization Users"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Team Roster</span>
            {typeof usersCount === "number" && (
              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono">
                {usersCount}
              </span>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-all"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Feed</span>
          </button>
        </div>
      </div>
    </header>
  );
}

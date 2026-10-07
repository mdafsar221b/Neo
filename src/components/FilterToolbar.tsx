"use client";

// Filter, search, and sort controls for memory list
import React from "react";
import { Search, ArrowUpDown, X, ArrowDown, ArrowUp } from "lucide-react";

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "created_at" | "updated_at" | "title";
  onSortByChange: (sort: "created_at" | "updated_at" | "title") => void;
  sortOrder: "asc" | "desc";
  onToggleSortOrder: () => void;
  archivedFilter: boolean | undefined;
  onArchivedFilterChange: (archived?: boolean) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

// Renders the search and filtering control strip
export function FilterToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  archivedFilter,
  onArchivedFilterChange,
  limit,
  onLimitChange,
}: FilterToolbarProps) {
  return (
    <div className="p-3 bg-white border border-slate-200/90 rounded-xl max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search titles, summaries, entities, notes..."
          className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 text-[11px] font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="created_at">Date Created</option>
            <option value="updated_at">Date Updated</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={onToggleSortOrder}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200/70 transition-colors"
            title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {sortOrder === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <span className="text-slate-500 text-[11px] font-medium">Status:</span>
          <select
            value={archivedFilter === undefined ? "all" : String(archivedFilter)}
            onChange={(e) => {
              const v = e.target.value;
              onArchivedFilterChange(v === "all" ? undefined : v === "true");
            }}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all">All</option>
            <option value="false">Active Only</option>
            <option value="true">Archived Only</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <span className="text-slate-500 text-[11px] font-medium">Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer font-mono"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}

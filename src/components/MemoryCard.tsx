"use client";

// Memory card list item
import React from "react";
import { MemoryItem } from "@/types/neocore";
import { formatDate, formatDuration } from "@/lib/utils";
import { Clock, Calendar, Users, ChevronRight, Archive } from "lucide-react";

interface MemoryCardProps {
  memory: MemoryItem;
  isSelected: boolean;
  onSelect: (memory: MemoryItem) => void;
}

// Renders an individual memory item card in the list
export function MemoryCard({ memory, isSelected, onSelect }: MemoryCardProps) {
  const domain = memory.domain || (memory.domains && memory.domains[0]) || "General";
  const duration = formatDuration(memory.started_at, memory.finished_at);
  const participantsCount = memory.participants?.length || 0;

  return (
    <div
      onClick={() => onSelect(memory)}
      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? "bg-blue-50/50 border-blue-500 shadow-sm ring-1 ring-blue-500/20"
          : "bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {domain}
          </span>
          {memory.archived && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Archive className="w-2.5 h-2.5" />
              Archived
            </span>
          )}
          {memory.status === "completed" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Completed
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{duration}</span>
        </div>
      </div>

      <h3 className={`text-xs font-semibold line-clamp-1 mb-1 ${isSelected ? "text-blue-900 font-bold" : "text-slate-900"}`}>
        {memory.title || "Untitled Memory"}
      </h3>

      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2.5">
        {memory.summary || "No summary available."}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          <span className="text-slate-500">{formatDate(memory.created_at)}</span>
        </div>

        <div className="flex items-center gap-2">
          {participantsCount > 0 && (
            <span className="flex items-center gap-1 text-slate-500">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{participantsCount}</span>
            </span>
          )}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-400"}`} />
        </div>
      </div>
    </div>
  );
}

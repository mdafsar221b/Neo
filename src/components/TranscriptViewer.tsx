"use client";

// Displays audio transcript turns with speaker identification and timestamps
import React, { useState } from "react";
import { TranscriptSegment } from "@/types/neocore";
import { formatSeconds } from "@/lib/utils";
import { User, Mic, Search, X } from "lucide-react";

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
}

// Renders speaker-by-speaker transcript segments
export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [filterText, setFilterText] = useState("");

  if (!transcript || transcript.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No audio transcript available for this memory.
      </div>
    );
  }

  const filteredSegments = filterText.trim()
    ? transcript.filter((seg) =>
        seg.text.toLowerCase().includes(filterText.toLowerCase()) ||
        seg.speaker.toLowerCase().includes(filterText.toLowerCase())
      )
    : transcript;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <span className="text-xs text-slate-600 font-semibold">
          {transcript.length} turns recorded
        </span>
        <div className="relative max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search within transcript..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
          {filterText && (
            <button
              onClick={() => setFilterText("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredSegments.map((segment, idx) => {
          const isUser = segment.is_user;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-colors ${
                isUser
                  ? "bg-blue-50/70 border-blue-200 text-slate-900 shadow-2xs"
                  : "bg-slate-50/80 border-slate-200 text-slate-800 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {isUser ? (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span className={`font-semibold text-[11px] ${isUser ? "text-blue-900" : "text-slate-800"}`}>
                    {segment.speaker || (isUser ? "Primary User" : `Speaker ${segment.speaker_id}`)}
                  </span>
                  {isUser && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-100 text-blue-800 border border-blue-200">
                      User
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-medium">
                  {formatSeconds(segment.start)} - {formatSeconds(segment.end)}
                </span>
              </div>
              <p className="leading-relaxed text-slate-700 pl-5 text-[11px]">
                {segment.text}
              </p>
            </div>
          );
        })}

        {filteredSegments.length === 0 && (
          <div className="py-6 text-center text-slate-400 text-xs">
            No matching transcript segments found for &quot;{filterText}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

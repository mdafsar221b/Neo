"use client";

// Full inspector panel for selected memory item
import React, { useState } from "react";
import { MemoryItem } from "@/types/neocore";
import { formatDate, formatDuration } from "@/lib/utils";
import { MomViewer } from "./MomViewer";
import { TranscriptViewer } from "./TranscriptViewer";
import {
  FileText,
  Mic,
  Tag,
  Code,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Building,
} from "lucide-react";

interface MemoryDetailProps {
  memory: MemoryItem | null;
}

// Detailed inspector view with multi-tab navigation
export function MemoryDetail({ memory }: MemoryDetailProps) {
  const [activeTab, setActiveTab] = useState<"mom" | "transcript" | "insights" | "json">("mom");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!memory) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-white border border-slate-200/90 rounded-xl text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Memory Selected</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select a conversation from the list to inspect its notes, transcript, and intelligence metadata.
        </p>
      </div>
    );
  }

  const copyMemoryId = () => {
    navigator.clipboard.writeText(memory.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(memory, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const domain = memory.domain || (memory.domains && memory.domains[0]) || "General";
  const duration = formatDuration(memory.started_at, memory.finished_at);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs flex flex-col h-full max-h-[85vh] overflow-hidden">
      {/* Detail Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {domain}
            </span>
            {memory.type && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                {memory.type}
              </span>
            )}
            {memory.status && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {memory.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMemoryId}
              className="flex items-center gap-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200 shadow-2xs transition-colors"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{memory.id.slice(0, 8)}...</span>
            </button>
          </div>
        </div>

        <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {memory.title || "Untitled Memory"}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(memory.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Duration: {duration}</span>
          </div>
          {memory.language && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Lang:</span>
              <span className="uppercase font-mono font-medium text-slate-700">{memory.language}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex items-center border-b border-slate-200 bg-white px-4 gap-1 text-xs">
        <button
          onClick={() => setActiveTab("mom")}
          className={`flex items-center gap-1.5 py-2.5 px-3 font-medium border-b-2 transition-all ${
            activeTab === "mom"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Meeting Notes (MoM)</span>
        </button>

        <button
          onClick={() => setActiveTab("transcript")}
          className={`flex items-center gap-1.5 py-2.5 px-3 font-medium border-b-2 transition-all ${
            activeTab === "transcript"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Transcript</span>
          {memory.transcript && (
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600 font-mono">
              {memory.transcript.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-1.5 py-2.5 px-3 font-medium border-b-2 transition-all ${
            activeTab === "insights"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Entities & Insights</span>
        </button>

        <button
          onClick={() => setActiveTab("json")}
          className={`flex items-center gap-1.5 py-2.5 px-3 font-medium border-b-2 transition-all ${
            activeTab === "json"
              ? "border-blue-600 text-blue-700 bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Raw JSON</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "mom" && (
          <div className="space-y-4">
            {memory.summary && (
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Executive Summary
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {memory.summary}
                </p>
              </div>
            )}

            {memory.custom_summary && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Custom Summary
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-normal">
                  {memory.custom_summary}
                </p>
              </div>
            )}

            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4">
              <MomViewer content={memory.mom} />
            </div>
          </div>
        )}

        {activeTab === "transcript" && (
          <TranscriptViewer transcript={memory.transcript || []} />
        )}

        {activeTab === "insights" && (
          <div className="space-y-4 text-xs">
            {/* Participants */}
            <div className="p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Participants ({memory.participants?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {memory.participants && memory.participants.length > 0 ? (
                  memory.participants.map((p, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium text-xs shadow-2xs"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None detected</span>
                )}
              </div>
            </div>

            {/* Mentioned Entities */}
            <div className="p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                Mentioned Entities ({memory.mentioned_entities?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {memory.mentioned_entities && memory.mentioned_entities.length > 0 ? (
                  memory.mentioned_entities.map((e, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 text-xs font-medium"
                    >
                      {e}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None detected</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Tags ({memory.tags?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {memory.tags && memory.tags.length > 0 ? (
                  memory.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-[11px] font-medium"
                    >
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No tags assigned</span>
                )}
              </div>
            </div>

            {/* Customer Details if available */}
            {memory.customer_details && (memory.customer_details.name || memory.customer_details.location) && (
              <div className="p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-700">Customer Details</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-xs">
                  {memory.customer_details.name && (
                    <div>Name: <span className="text-slate-900 font-medium">{memory.customer_details.name}</span></div>
                  )}
                  {memory.customer_details.type && (
                    <div>Type: <span className="text-slate-900">{memory.customer_details.type}</span></div>
                  )}
                  {memory.customer_details.contact_number && (
                    <div>Contact: <span className="text-slate-900 font-mono">{memory.customer_details.contact_number}</span></div>
                  )}
                  {memory.customer_details.location && (
                    <div>Location: <span className="text-slate-900">{memory.customer_details.location}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "json" && (
          <div className="relative">
            <button
              onClick={copyJson}
              className="absolute right-3 top-3 flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-md shadow-xs transition-colors z-10"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
            </button>
            <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[480px]">
              {JSON.stringify(memory, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

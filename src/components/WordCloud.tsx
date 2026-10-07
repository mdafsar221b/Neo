"use client";

// Interactive multi-mode word cloud visualization component
import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Building2, Tag, ShoppingBag, Target, FileText, X, ChevronDown, ChevronUp } from "lucide-react";

export type CloudMode = "entities" | "tags" | "keywords" | "products" | "competitors";

interface WordItem {
  text: string;
  count: number;
}

interface WordCloudData {
  totalSampled: number;
  entities: WordItem[];
  tags: WordItem[];
  keywords: WordItem[];
  products: WordItem[];
  competitors: WordItem[];
}

interface WordCloudProps {
  selectedWord?: string;
  onSelectWord: (word: string) => void;
  onClearWord: () => void;
}

// Renders an interactive word cloud widget with multiple extraction modes
export function WordCloud({ selectedWord, onSelectWord, onClearWord }: WordCloudProps) {
  const [data, setData] = useState<WordCloudData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<CloudMode>("entities");
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetches word cloud aggregates on mount
  useEffect(() => {
    async function loadCloud() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/wordcloud");
        if (res.ok) {
          const cloudData = await res.json();
          setData(cloudData);
        }
      } catch (err) {
        console.error("Failed to load word cloud data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCloud();
  }, []);

  const activeList = useMemo(() => {
    if (!data) return [];
    switch (mode) {
      case "entities":
        return data.entities || [];
      case "tags":
        return data.tags || [];
      case "keywords":
        return data.keywords || [];
      case "products":
        return data.products || [];
      case "competitors":
        return data.competitors || [];
      default:
        return [];
    }
  }, [data, mode]);

  const { minCount, maxCount } = useMemo(() => {
    if (!activeList || activeList.length === 0) return { minCount: 1, maxCount: 1 };
    const counts = activeList.map((item) => item.count);
    return {
      minCount: Math.min(...counts),
      maxCount: Math.max(...counts),
    };
  }, [activeList]);

  // Calculates font weight, text size, and padding based on frequency
  const getWordStyle = (count: number) => {
    const range = maxCount - minCount || 1;
    const normalized = (count - minCount) / range;

    if (normalized > 0.75) {
      return "text-sm md:text-base font-bold px-3 py-1.5 shadow-xs";
    }
    if (normalized > 0.4) {
      return "text-xs md:text-sm font-semibold px-2.5 py-1";
    }
    return "text-[11px] md:text-xs font-medium px-2 py-0.5 opacity-90";
  };

  // Resolves color styling for active mode
  const getThemeClasses = (isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1 border-transparent shadow-xs";
    }
    switch (mode) {
      case "entities":
        return "bg-indigo-50/80 text-indigo-900 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300";
      case "tags":
        return "bg-emerald-50/80 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300";
      case "products":
        return "bg-purple-50/80 text-purple-900 border-purple-200 hover:bg-purple-100 hover:border-purple-300";
      case "competitors":
        return "bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-100 hover:border-amber-300";
      case "keywords":
      default:
        return "bg-sky-50/80 text-sky-900 border-sky-200 hover:bg-sky-100 hover:border-sky-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 max-w-7xl mx-auto shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Conversation Intelligence Cloud</span>
              {selectedWord && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white flex items-center gap-1">
                  <span>&quot;{selectedWord}&quot;</span>
                  <button onClick={onClearWord} className="hover:text-slate-200" title="Clear filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any keyword to instantly filter the conversation feed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mode Switchers */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMode("entities")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "entities" ? "bg-white text-indigo-700 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span>Entities</span>
              {data && <span className="text-[10px] text-slate-400">({data.entities?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("tags")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "tags" ? "bg-white text-emerald-700 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>Tags</span>
              {data && <span className="text-[10px] text-slate-400">({data.tags?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("keywords")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "keywords" ? "bg-white text-sky-700 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3 h-3 text-sky-600" />
              <span>Concepts</span>
              {data && <span className="text-[10px] text-slate-400">({data.keywords?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("products")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "products" ? "bg-white text-purple-700 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-purple-600" />
              <span>Products</span>
              {data && <span className="text-[10px] text-slate-400">({data.products?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("competitors")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "competitors" ? "bg-white text-amber-700 shadow-2xs font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Target className="w-3 h-3 text-amber-600" />
              <span>Competitors</span>
              {data && <span className="text-[10px] text-slate-400">({data.competitors?.length || 0})</span>}
            </button>
          </div>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            title={isExpanded ? "Collapse Cloud" : "Expand Cloud"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-3">
          {isLoading ? (
            <div className="flex flex-wrap gap-2 py-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="h-7 bg-slate-100 rounded-lg w-20" />
              ))}
            </div>
          ) : activeList.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No items extracted in this category.
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 max-h-48 overflow-y-auto py-1">
              {activeList.map((item) => {
                const isSelected = selectedWord?.toLowerCase() === item.text.toLowerCase();
                const styleClasses = getWordStyle(item.count);
                const themeClasses = getThemeClasses(isSelected);

                return (
                  <button
                    key={item.text}
                    onClick={() => {
                      if (isSelected) {
                        onClearWord();
                      } else {
                        onSelectWord(item.text);
                      }
                    }}
                    className={`rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${styleClasses} ${themeClasses}`}
                    title={`${item.text}: ${item.count} occurrence${item.count > 1 ? "s" : ""}`}
                  >
                    <span>{item.text}</span>
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                        isSelected ? "bg-blue-700 text-white" : "bg-white/80 text-slate-600 border border-slate-200/60"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

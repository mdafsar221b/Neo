"use client";

// Graphical SVG Word Cloud component using d3-cloud layout
import React, { useState, useEffect, useMemo, useRef } from "react";
import cloud from "d3-cloud";
import { scaleSqrt } from "d3-scale";
import {
  Sparkles,
  Building2,
  Tag,
  ShoppingBag,
  Target,
  FileText,
  Layers,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type CloudMode = "all" | "entities" | "tags" | "keywords" | "products" | "competitors";

interface WordItem {
  text: string;
  count: number;
  category?: string;
}

interface PlacedWord extends cloud.Word {
  text: string;
  size: number;
  x: number;
  y: number;
  rotate: number;
  count: number;
  category?: string;
}

interface WordCloudData {
  totalSampled: number;
  all: WordItem[];
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

const PALETTE = [
  "#2563eb", // Blue
  "#0284c7", // Light Blue
  "#ea580c", // Orange
  "#059669", // Emerald
  "#d97706", // Amber
  "#7c3aed", // Purple
  "#dc2626", // Red
  "#0d9488", // Teal
  "#4338ca", // Indigo
  "#b45309", // Warm Brown
  "#c026d3", // Fuchsia
  "#16a34a", // Green
  "#e11d48", // Rose
];

// Returns a stable deterministic color for a given word
function getWordColor(word: string): string {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash << 5) - hash + word.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

// Renders an organic graphical word cloud packed via d3-cloud
export function WordCloud({ selectedWord, onSelectWord, onClearWord }: WordCloudProps) {
  const [data, setData] = useState<WordCloudData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<CloudMode>("all");
  const [isExpanded, setIsExpanded] = useState(true);
  const [layoutWords, setLayoutWords] = useState<PlacedWord[]>([]);
  const [hoveredWord, setHoveredWord] = useState<PlacedWord | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const width = 860;
  const height = 400;

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

  const rawList = useMemo(() => {
    if (!data) return [];
    switch (mode) {
      case "all":
        return data.all || [];
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

  // Runs d3-cloud layout packing algorithm
  useEffect(() => {
    if (!rawList || rawList.length === 0) {
      setLayoutWords([]);
      return;
    }

    const counts = rawList.map((w) => w.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // Scaling font sizes from 13px up to 52px
    const fontScale = scaleSqrt()
      .domain([minCount, maxCount])
      .range([13, 52]);

    const wordsToLayout = rawList.map((item) => ({
      text: item.text,
      size: Math.round(fontScale(item.count)),
      count: item.count,
      category: item.category,
    }));

    const layout = cloud<PlacedWord>()
      .size([width, height])
      .words(wordsToLayout as any)
      .padding(3)
      .rotate(() => 0)
      .font("-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif")
      .fontSize((d) => d.size || 14)
      .on("end", (outputWords) => {
        setLayoutWords(outputWords as PlacedWord[]);
      });

    layout.start();
  }, [rawList, width, height]);

  // Handles mouse movement over SVG for tooltip tracking
  const handleMouseMove = (e: React.MouseEvent, word: PlacedWord) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 12,
      });
      setHoveredWord(word);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white border border-slate-200/90 rounded-2xl p-4 max-w-7xl mx-auto shadow-xs transition-all overflow-hidden"
    >
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                Conversation Word Cloud
              </h3>
              {selectedWord && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
                  <span>&quot;{selectedWord}&quot;</span>
                  <button onClick={onClearWord} className="hover:text-slate-200" title="Clear filter">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Interactive topic and entity cloud from recorded meetings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Tabs */}
          <div className="flex items-center gap-0.5 bg-slate-100/80 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMode("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "all"
                  ? "bg-white text-blue-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3 h-3 text-blue-600" />
              <span>All Topics</span>
              {data && <span className="text-[10px] text-slate-400">({data.all?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("entities")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "entities"
                  ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3 h-3 text-indigo-600" />
              <span>Entities</span>
              {data && <span className="text-[10px] text-slate-400">({data.entities?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("tags")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "tags"
                  ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tag className="w-3 h-3 text-emerald-600" />
              <span>Tags</span>
              {data && <span className="text-[10px] text-slate-400">({data.tags?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("keywords")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "keywords"
                  ? "bg-white text-sky-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3 h-3 text-sky-600" />
              <span>Concepts</span>
              {data && <span className="text-[10px] text-slate-400">({data.keywords?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("products")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "products"
                  ? "bg-white text-purple-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShoppingBag className="w-3 h-3 text-purple-600" />
              <span>Products</span>
              {data && <span className="text-[10px] text-slate-400">({data.products?.length || 0})</span>}
            </button>

            <button
              onClick={() => setMode("competitors")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                mode === "competitors"
                  ? "bg-white text-amber-700 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
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

      {/* Cloud Visual Body */}
      {isExpanded && (
        <div className="pt-2 flex flex-col items-center justify-center">
          {isLoading ? (
            <div className="w-full h-80 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Synthesizing word cloud model...</p>
              </div>
            </div>
          ) : layoutWords.length === 0 ? (
            <div className="w-full h-64 flex items-center justify-center text-xs text-slate-400">
              No conversational terms found for this view.
            </div>
          ) : (
            <div className="w-full relative flex flex-col items-center justify-center py-2">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto max-h-[420px] select-none"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.02))" }}
              >
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                  {layoutWords.map((word, idx) => {
                    const isSelected = selectedWord?.toLowerCase() === word.text.toLowerCase();
                    const isHovered = hoveredWord?.text === word.text;
                    const wordColor = getWordColor(word.text);

                    return (
                      <text
                        key={`${word.text}-${idx}`}
                        textAnchor="middle"
                        transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                        style={{
                          fontSize: `${word.size}px`,
                          fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
                          fontWeight: word.size > 28 ? "700" : word.size > 18 ? "600" : "500",
                          fill: isSelected ? "#2563eb" : wordColor,
                          cursor: "pointer",
                          transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
                          opacity: hoveredWord && !isHovered && !isSelected ? 0.45 : 1,
                          textDecoration: isSelected ? "underline" : "none",
                        }}
                        onMouseEnter={(e) => handleMouseMove(e, word)}
                        onMouseMove={(e) => handleMouseMove(e, word)}
                        onMouseLeave={() => setHoveredWord(null)}
                        onClick={() => {
                          if (isSelected) {
                            onClearWord();
                          } else {
                            onSelectWord(word.text);
                          }
                        }}
                        className="hover:scale-110 origin-center"
                      >
                        {word.text}
                      </text>
                    );
                  })}
                </g>
              </svg>

              {/* Graphic Cloud Subtitle (Matching visual summary style) */}
              <div className="mt-1 text-center border-t border-slate-100 pt-2 w-full">
                <div className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                  Conversation Intelligence Summary
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sample Size = {data?.totalSampled || 100} Memories &bull; {layoutWords.length} Active Keywords
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Interactive Tooltip */}
      {hoveredWord && isExpanded && (
        <div
          className="pointer-events-none absolute z-30 transform -translate-x-1/2 -translate-y-full px-2.5 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs space-y-0.5 transition-opacity"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">&quot;{hoveredWord.text}&quot;</span>
            {hoveredWord.category && (
              <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-blue-300">
                {hoveredWord.category}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-300">
            {hoveredWord.count} mention{hoveredWord.count > 1 ? "s" : ""} across conversations
          </div>
          <div className="text-[9px] text-blue-400 font-medium">
            Click to filter conversation feed
          </div>
        </div>
      )}
    </div>
  );
}

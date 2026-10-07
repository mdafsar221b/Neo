"use client";

// Renders markdown formatted meeting notes (MoM)
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MomViewerProps {
  content: string;
}

// Custom rendered markdown viewer for conversation notes
export function MomViewer({ content }: MomViewerProps) {
  if (!content || !content.trim()) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        No structured meeting notes generated for this memory.
      </div>
    );
  }

  return (
    <div className="prose prose-slate max-w-none text-slate-700 text-xs leading-relaxed space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 mt-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-blue-800 mt-4 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-slate-800 mt-3 mb-1">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-4 space-y-1 text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 pl-1">{children}</li>
          ),
          p: ({ children }) => (
            <p className="text-slate-700 my-1.5">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          hr: () => <hr className="border-slate-200 my-3" />,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 pl-3 py-1 bg-blue-50/50 rounded-r text-slate-700 my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

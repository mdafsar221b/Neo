"use client";

// Main dashboard page integrating all memory views and controls
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MemoryItem, MemoryPagination, UserItem } from "@/types/neocore";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { FilterToolbar } from "@/components/FilterToolbar";
import { MemoryCard } from "@/components/MemoryCard";
import { MemoryDetail } from "@/components/MemoryDetail";
import { UsersModal } from "@/components/UsersModal";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  Filter,
} from "lucide-react";

interface StatsData {
  businessId: string;
  totalCount: number;
  activeUsersCount: number;
  domainCounts: Record<string, number>;
  avgDurationSeconds: number;
  users: UserItem[];
}

// Renders the single-page application dashboard
export default function DashboardPage() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [pagination, setPagination] = useState<MemoryPagination | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(undefined);

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "title">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [archivedFilter, setArchivedFilter] = useState<boolean | undefined>(undefined);
  const [limit, setLimit] = useState(20);

  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);

  // Fetches high level system statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to load statistics");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Fetches memory feed according to current pagination and filters
  const fetchMemories = useCallback(async (cursorParam?: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const params = new URLSearchParams();
      if (cursorParam) params.set("cursor", cursorParam);
      params.set("limit", limit.toString());
      params.set("sort_by", sortBy);
      params.set("sort_order", sortOrder);
      if (typeof archivedFilter === "boolean") {
        params.set("archived", String(archivedFilter));
      }

      const res = await fetch(`/api/memories?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch memories");
      }

      const data = await res.json();
      setMemories(data.items || []);
      setPagination(data.pagination || null);

      if (data.items && data.items.length > 0) {
        setSelectedMemory((prev) => {
          if (prev && data.items.some((item: MemoryItem) => item.id === prev.id)) {
            return data.items.find((item: MemoryItem) => item.id === prev.id);
          }
          return data.items[0];
        });
      } else {
        setSelectedMemory(null);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error connecting to NeoCore API");
    } finally {
      setIsLoading(false);
    }
  }, [limit, sortBy, sortOrder, archivedFilter]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Refetches feed when filter parameters change
  useEffect(() => {
    setCursorHistory([]);
    setCurrentCursor(undefined);
    fetchMemories(undefined);
  }, [fetchMemories]);

  // Moves to the next page of memories using cursor
  const handleNextPage = () => {
    if (pagination?.next_cursor) {
      setCursorHistory((prev) => [...prev, currentCursor || ""]);
      setCurrentCursor(pagination.next_cursor);
      fetchMemories(pagination.next_cursor);
    }
  };

  // Moves to the previous page of memories
  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const prevCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory((prev) => prev.slice(0, -1));
      const effectiveCursor = prevCursor || undefined;
      setCurrentCursor(effectiveCursor);
      fetchMemories(effectiveCursor);
    }
  };

  // Client-side search and domain filtering over fetched items
  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      if (selectedDomain) {
        const d = mem.domain || (mem.domains && mem.domains[0]) || "General";
        if (d !== selectedDomain) return false;
      }

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = (mem.title || "").toLowerCase().includes(q);
      const matchSummary = (mem.summary || "").toLowerCase().includes(q);
      const matchMom = (mem.mom || "").toLowerCase().includes(q);
      const matchParticipants = mem.participants?.some((p) => p.toLowerCase().includes(q));
      const matchEntities = mem.mentioned_entities?.some((e) => e.toLowerCase().includes(q));
      const matchTags = mem.tags?.some((t) => t.toLowerCase().includes(q));

      return matchTitle || matchSummary || matchMom || matchParticipants || matchEntities || matchTags;
    });
  }, [memories, selectedDomain, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        businessId={stats?.businessId}
        totalMemories={stats?.totalCount}
        usersCount={stats?.activeUsersCount}
        isLoading={isLoading}
        onRefresh={() => {
          fetchStats();
          fetchMemories(currentCursor);
        }}
        onOpenUsers={() => setIsUsersModalOpen(true)}
      />

      <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-7xl mx-auto w-full">
        {/* Analytics KPI banner */}
        <StatsCards
          totalCount={stats?.totalCount || 0}
          filteredCount={filteredMemories.length}
          domainCounts={stats?.domainCounts || {}}
          avgDurationSeconds={stats?.avgDurationSeconds || 0}
          activeDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
        />

        {/* Search & Filter Strip */}
        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          archivedFilter={archivedFilter}
          onArchivedFilterChange={setArchivedFilter}
          limit={limit}
          onLimitChange={setLimit}
        />

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-800 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => fetchMemories(currentCursor)}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Master-Detail Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Feed List (Left column: 5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700">
                Conversation Feed ({filteredMemories.length})
              </span>
              {selectedDomain && (
                <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Filtered by {selectedDomain}
                </span>
              )}
            </div>

            {isLoading && memories.length === 0 ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="p-4 rounded-xl bg-white border border-slate-200 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-50 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 rounded-xl text-center space-y-2 shadow-xs">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-semibold text-slate-700">No Memories Found</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  No records match your active query or domain filter.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[75vh] overflow-y-auto pr-1">
                {filteredMemories.map((mem) => (
                  <MemoryCard
                    key={mem.id}
                    memory={mem}
                    isSelected={selectedMemory?.id === mem.id}
                    onSelect={setSelectedMemory}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 shadow-xs">
                <span className="font-medium">
                  Showing {memories.length} of {pagination.total_count}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePreviousPage}
                    disabled={cursorHistory.length === 0 || isLoading}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!pagination.has_more || isLoading}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Memory Inspector (Right column: 7 cols on lg) */}
          <div className="lg:col-span-7 sticky top-20">
            <MemoryDetail memory={selectedMemory} />
          </div>
        </div>
      </main>

      {/* Users Modal */}
      <UsersModal
        isOpen={isUsersModalOpen}
        onClose={() => setIsUsersModalOpen(false)}
        users={stats?.users || []}
        isLoading={isStatsLoading}
      />
    </div>
  );
}

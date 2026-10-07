// API route for fetching paginated organization memories
import { NextRequest, NextResponse } from "next/server";
import { getOrgMemories } from "@/lib/neocore-client";
import { MemoryQueryFilters } from "@/types/neocore";

// Handles GET requests for memory feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: MemoryQueryFilters = {};

    const cursor = searchParams.get("cursor");
    if (cursor) filters.cursor = cursor;

    const limit = searchParams.get("limit");
    if (limit) filters.limit = parseInt(limit, 10);

    const sort_by = searchParams.get("sort_by") as MemoryQueryFilters["sort_by"];
    if (sort_by) filters.sort_by = sort_by;

    const sort_order = searchParams.get("sort_order") as MemoryQueryFilters["sort_order"];
    if (sort_order) filters.sort_order = sort_order;

    const archived = searchParams.get("archived");
    if (archived !== null) filters.archived = archived === "true";

    const start_ts = searchParams.get("start_ts");
    if (start_ts) filters.start_ts = start_ts;

    const end_ts = searchParams.get("end_ts");
    if (end_ts) filters.end_ts = end_ts;

    const result = await getOrgMemories(filters);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch memories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

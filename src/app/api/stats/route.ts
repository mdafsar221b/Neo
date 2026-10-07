// API route for system overview stats and metadata
import { NextResponse } from "next/server";
import { getOrgMemories, getOrganizationUsers, getBusinessId } from "@/lib/neocore-client";

export const dynamic = "force-dynamic";

// Calculates aggregate metrics for the dashboard header
export async function GET() {
  try {
    const [memoriesRes, usersRes, businessId] = await Promise.all([
      getOrgMemories({ limit: 100 }),
      getOrganizationUsers(),
      getBusinessId(),
    ]);

    const domainCounts: Record<string, number> = {};
    let totalDurationSeconds = 0;
    let validDurationCount = 0;

    for (const mem of memoriesRes.items) {
      const domainName = mem.domain || (mem.domains && mem.domains[0]) || "General";
      domainCounts[domainName] = (domainCounts[domainName] || 0) + 1;

      if (mem.started_at && mem.finished_at) {
        const start = new Date(mem.started_at).getTime();
        const end = new Date(mem.finished_at).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          totalDurationSeconds += Math.floor((end - start) / 1000);
          validDurationCount += 1;
        }
      }
    }

    const avgDurationSeconds = validDurationCount > 0
      ? Math.round(totalDurationSeconds / validDurationCount)
      : 0;

    const latestActivity = memoriesRes.items.length > 0 ? memoriesRes.items[0].created_at : null;

    return NextResponse.json({
      businessId,
      totalCount: memoriesRes.pagination.total_count,
      activeUsersCount: usersRes.total || usersRes.items.length,
      sampleSize: memoriesRes.items.length,
      domainCounts,
      avgDurationSeconds,
      latestActivity,
      users: usersRes.items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// API route for fetching single memory detail by ID
import { NextRequest, NextResponse } from "next/server";
import { getMemoryById } from "@/lib/neocore-client";

// Handles GET requests for single memory lookup
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const memoryId = params.id;
    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const memory = await getMemoryById(memoryId);
    return NextResponse.json(memory);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch memory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

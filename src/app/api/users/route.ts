// API route for fetching organization users
import { NextResponse } from "next/server";
import { getOrganizationUsers } from "@/lib/neocore-client";

// Handles GET requests for user roster
export async function GET() {
  try {
    const users = await getOrganizationUsers();
    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

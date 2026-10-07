// Server-side NeoCore API client with token caching and retry logic
import {
  AuthTokenResponse,
  MemoryItem,
  MemoryListResponse,
  MemoryQueryFilters,
  UserItem,
  UserListResponse,
} from "@/types/neocore";

const BASE_URL = process.env.NEOCORE_BASE_URL || "https://api.neosapien.xyz";
const API_KEY = process.env.NEOSAPIEN_API_KEY || "";

interface CachedToken {
  token: string;
  expiresAt: number;
  businessId: string;
}

let cachedToken: CachedToken | null = null;

// Exchanges API key for an access token or returns active cached token
export async function getAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 300 * 1000) {
    return cachedToken.token;
  }

  if (!API_KEY) {
    throw new Error("NEOSAPIEN_API_KEY environment variable is not configured");
  }

  const response = await fetch(`${BASE_URL}/auth/access-token`, {
    method: "POST",
    headers: {
      "X-Api-Key": API_KEY,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to authenticate with NeoCore API (${response.status}): ${errText}`);
  }

  const data: AuthTokenResponse = await response.json();
  const thirtyMinutesMs = 30 * 60 * 1000;

  cachedToken = {
    token: data.access_token,
    expiresAt: now + thirtyMinutesMs,
    businessId: data.business_id,
  };

  return data.access_token;
}

// Retrieves current business ID from token cache
export async function getBusinessId(): Promise<string> {
  if (!cachedToken) {
    await getAccessToken();
  }
  return cachedToken?.businessId || "";
}

// Executes an authorized request with automatic 401 retry
async function authorizedFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token = await getAccessToken();

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    token = await getAccessToken(true);
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`NeoCore API error (${response.status}) on ${endpoint}: ${errorBody}`);
  }

  return (await response.json()) as T;
}

// Lists organization memories with optional filtering and pagination
export async function getOrgMemories(filters: MemoryQueryFilters = {}): Promise<MemoryListResponse> {
  const query = new URLSearchParams();
  if (filters.cursor) query.set("cursor", filters.cursor);
  if (filters.limit) query.set("limit", filters.limit.toString());
  if (filters.sort_by) query.set("sort_by", filters.sort_by);
  if (filters.sort_order) query.set("sort_order", filters.sort_order);
  if (typeof filters.archived === "boolean") query.set("archived", String(filters.archived));
  if (filters.start_ts) query.set("start_ts", filters.start_ts);
  if (filters.end_ts) query.set("end_ts", filters.end_ts);

  const qs = query.toString();
  const endpoint = `/api/v1/memories/org_memories${qs ? `?${qs}` : ""}`;
  return authorizedFetch<MemoryListResponse>(endpoint);
}

// Fetches a single memory by ID
export async function getMemoryById(id: string): Promise<MemoryItem> {
  return authorizedFetch<MemoryItem>(`/api/v1/memories/${encodeURIComponent(id)}`);
}

// Lists all users in the organization
export async function getOrganizationUsers(): Promise<UserListResponse> {
  return authorizedFetch<UserListResponse>("/api/v1/users");
}

// Resolves a single user by ID
export async function getUserById(id: string): Promise<UserItem> {
  return authorizedFetch<UserItem>(`/api/v1/users/${encodeURIComponent(id)}`);
}

// NeoCore API v2.0.0 type definitions

export interface TranscriptSegment {
  text: string;
  speaker: string;
  speaker_id: number;
  is_user: boolean;
  person_id?: string | null;
  start: number;
  end: number;
}

export interface CustomerDetails {
  name?: string;
  contact_number?: string;
  type?: string;
  location?: string;
}

export interface MemoryItem {
  id: string;
  user_id: string;
  device_id?: string | null;
  title: string;
  summary: string;
  custom_summary?: string;
  transcript: TranscriptSegment[];
  mom: string;
  participants: string[];
  mentioned_entities: string[];
  tags: string[];
  domain?: string;
  domains?: string[];
  product?: string[];
  customer_details?: CustomerDetails;
  competitors_mentioned?: string[];
  feedbacks?: string[];
  archived: boolean;
  type?: string;
  status?: string;
  source?: string;
  emotions?: string[];
  language?: string | null;
  created_at: string;
  started_at: string;
  finished_at: string;
  updated_at?: string | null;
  coordinates?: unknown[];
  mavic_user_id?: string | null;
  mavic_outlet_id?: string | null;
}

export interface MemoryPagination {
  count: number;
  has_more: boolean;
  next_cursor?: string | null;
  total_count: number;
  per_page: number;
}

export interface MemoryListResponse {
  items: MemoryItem[];
  pagination: MemoryPagination;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  created_at?: string;
  provider?: string;
}

export interface UserListResponse {
  items: UserItem[];
  total: number;
  user_code_config?: {
    enabled: boolean;
    label: string;
  };
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  business_id: string;
}

export interface MemoryQueryFilters {
  cursor?: string;
  limit?: number;
  sort_by?: "created_at" | "updated_at" | "title";
  sort_order?: "asc" | "desc";
  archived?: boolean;
  start_ts?: string;
  end_ts?: string;
  search?: string;
  domain?: string;
}

export interface StatsOverview {
  totalCount: number;
  domainCounts: Record<string, number>;
  activeUsersCount: number;
  avgDurationSeconds: number;
  latestActivity: string | null;
}

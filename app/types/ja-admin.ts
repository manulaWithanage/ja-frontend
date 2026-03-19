// ─── JA Admin Shared Types ───────────────────────────────────
// These replace the MockClient / MockAssignment / MockStaff interfaces
// from the old _mock/data.ts file.

// ─── Client ──────────────────────────────────────────────────
export type ClientStatus = "active" | "inactive" | "pending" | "suspended";
export type PortalAccess = "configured" | "invited" | "never_set";

export type WorkType = "remote" | "hybrid" | "onsite" | "any";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  portal_access: PortalAccess;
  notes: string | null;
  invite_sent_at: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  // Optional profile fields
  current_title: string | null;
  industry: string | null;
  target_role: string | null;
  preferred_location: string | null;
  work_type: WorkType | null;
  linkedin_url: string | null;
  referral_source: string | null;
}

// ─── JA Staff ────────────────────────────────────────────────
export type StaffRole = "admin" | "member";
export type StaffStatus = "active" | "suspended" | "pending";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Job ─────────────────────────────────────────────────────
export type JobStatus = "queued" | "batch_active" | "applied" | "interviewing" | "offer" | "rejected";

export interface Job {
  id: string;
  client_id: string;
  job_title: string;
  company: string;
  location: string | null;
  apply_link: string | null;
  match_score: number;
  source: string | null;
  status: JobStatus;
  week_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────
export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalJobsThisWeek: number;
  pendingBatch: number;
}

// ─── JA Admin Mock Data ──────────────────────────────────────
// TODO: backend — replace all exports with real API calls

export type ClientStatus = "active" | "inactive" | "pending" | "suspended";
export type PortalAccess = "configured" | "invited" | "never_set";

export interface MockClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ClientStatus;
  createdAt: string;
  lastActive: string;
  assignedJobs: number;
  searchRuns: number;
  notes: string;
  // Portal login fields
  portal: {
    access: PortalAccess;
    lastLogin: string | null;
    tempPassword: string | null; // Only visible in admin for mock
    inviteSentAt: string | null;
  };
}

export interface MockAssignment {
  id: string;
  clientId: string;
  clientName: string;
  jobTitle: string;
  company: string;
  location: string;
  status: "assigned" | "applied" | "interviewing" | "offer" | "rejected";
  matchScore: number;
  assignedAt: string;
  applyLink: string;
  isArchived?: boolean;
  batchActive?: boolean;
  weekId?: string; // e.g. "2026-W11"
}

export interface MockSearchLog {
  id: string;
  clientId: string;
  clientName: string;
  runAt: string;
  durationSecs: number;
  config: {
    salaryMin: string;
    salaryMax: string;
    workType: string;
    experienceLevel: string;
    minMatchScore: number;
    maxResults: number;
    engines: { linkedin: boolean; jsearch: boolean; indeed: boolean };
  };
  resultsCount: number;
  assignedCount: number;
}

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "c1",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 415 555 0101",
    status: "active",
    createdAt: "2026-03-01",
    lastActive: "2026-03-18",
    assignedJobs: 5,
    searchRuns: 3,
    notes: "Senior frontend engineer. Targeting FAANG.",
    portal: { access: "configured", lastLogin: "2026-03-18T14:22:00Z", tempPassword: null, inviteSentAt: "2026-03-01" },
  },
  {
    id: "c2",
    name: "Sarah Mitchell",
    email: "sarah.m@email.com",
    phone: "+1 212 555 0182",
    status: "active",
    createdAt: "2026-03-05",
    lastActive: "2026-03-17",
    assignedJobs: 3,
    searchRuns: 2,
    notes: "Full-stack developer. Open to relocation.",
    portal: { access: "configured", lastLogin: "2026-03-17T09:45:00Z", tempPassword: null, inviteSentAt: "2026-03-05" },
  },
  {
    id: "c3",
    name: "Kevin Park",
    email: "k.park@email.com",
    phone: "+1 650 555 0133",
    status: "pending",
    createdAt: "2026-03-15",
    lastActive: "2026-03-15",
    assignedJobs: 0,
    searchRuns: 0,
    notes: "Just onboarded. Resume pending review.",
    portal: { access: "invited", lastLogin: null, tempPassword: "TJH@2026!", inviteSentAt: "2026-03-15" },
  },
  {
    id: "c4",
    name: "Aisha Okonkwo",
    email: "aisha.o@email.com",
    phone: "+1 312 555 0144",
    status: "active",
    createdAt: "2026-02-20",
    lastActive: "2026-03-16",
    assignedJobs: 8,
    searchRuns: 5,
    notes: "Data engineer, 4 yrs exp. 2 active interviews.",
    portal: { access: "configured", lastLogin: "2026-03-16T11:00:00Z", tempPassword: null, inviteSentAt: "2026-02-20" },
  },
  {
    id: "c5",
    name: "Luis Vargas",
    email: "l.vargas@email.com",
    phone: "+1 646 555 0155",
    status: "suspended",
    createdAt: "2026-02-01",
    lastActive: "2026-02-28",
    assignedJobs: 2,
    searchRuns: 1,
    notes: "On hold — client travelling.",
    portal: { access: "never_set", lastLogin: null, tempPassword: null, inviteSentAt: null },
  },
];

export const MOCK_ASSIGNMENTS: MockAssignment[] = [
  { id: "a1", clientId: "c1", clientName: "John Doe", jobTitle: "Senior Frontend Engineer", company: "Stripe", location: "Remote (US)", status: "assigned", matchScore: 96, assignedAt: "2026-03-17", applyLink: "#" },
  { id: "a2", clientId: "c1", clientName: "John Doe", jobTitle: "Staff Frontend Engineer", company: "Vercel", location: "Remote", status: "applied", matchScore: 94, assignedAt: "2026-03-14", applyLink: "#" },
  { id: "a3", clientId: "c1", clientName: "John Doe", jobTitle: "Senior Full Stack Developer", company: "Plaid", location: "San Francisco, CA", status: "interviewing", matchScore: 89, assignedAt: "2026-03-10", applyLink: "#" },
  { id: "a4", clientId: "c2", clientName: "Sarah Mitchell", jobTitle: "Full Stack Engineer", company: "Notion", location: "Remote", status: "assigned", matchScore: 91, assignedAt: "2026-03-16", applyLink: "#" },
  { id: "a5", clientId: "c2", clientName: "Sarah Mitchell", jobTitle: "Backend Engineer", company: "Linear", location: "Remote", status: "applied", matchScore: 85, assignedAt: "2026-03-12", applyLink: "#" },
  { id: "a6", clientId: "c4", clientName: "Aisha Okonkwo", jobTitle: "Data Engineer", company: "Databricks", location: "San Francisco, CA", status: "offer", matchScore: 93, assignedAt: "2026-03-08", applyLink: "#" },
  { id: "a7", clientId: "c4", clientName: "Aisha Okonkwo", jobTitle: "Senior Data Engineer", company: "Snowflake", location: "Remote", status: "interviewing", matchScore: 90, assignedAt: "2026-03-06", applyLink: "#" },
  { id: "a8", clientId: "c5", clientName: "Luis Vargas", jobTitle: "React Developer", company: "Shopify", location: "Remote", status: "rejected", matchScore: 72, assignedAt: "2026-02-25", applyLink: "#" },
];

export const MOCK_SEARCH_LOGS: MockSearchLog[] = [
  {
    id: "l1", clientId: "c1", clientName: "John Doe",
    runAt: "2026-03-18T16:23:00Z", durationSecs: 14,
    config: { salaryMin: "180000", salaryMax: "280000", workType: "remote", experienceLevel: "senior", minMatchScore: 80, maxResults: 25, engines: { linkedin: true, jsearch: true, indeed: true } },
    resultsCount: 7, assignedCount: 2,
  },
  {
    id: "l2", clientId: "c1", clientName: "John Doe",
    runAt: "2026-03-15T10:05:00Z", durationSecs: 11,
    config: { salaryMin: "150000", salaryMax: "250000", workType: "", experienceLevel: "senior", minMatchScore: 70, maxResults: 30, engines: { linkedin: true, jsearch: false, indeed: true } },
    resultsCount: 12, assignedCount: 3,
  },
  {
    id: "l3", clientId: "c2", clientName: "Sarah Mitchell",
    runAt: "2026-03-17T14:40:00Z", durationSecs: 9,
    config: { salaryMin: "120000", salaryMax: "200000", workType: "hybrid", experienceLevel: "mid", minMatchScore: 65, maxResults: 20, engines: { linkedin: true, jsearch: true, indeed: false } },
    resultsCount: 9, assignedCount: 2,
  },
  {
    id: "l4", clientId: "c4", clientName: "Aisha Okonkwo",
    runAt: "2026-03-16T08:15:00Z", durationSecs: 17,
    config: { salaryMin: "140000", salaryMax: "220000", workType: "remote", experienceLevel: "mid", minMatchScore: 75, maxResults: 25, engines: { linkedin: true, jsearch: true, indeed: true } },
    resultsCount: 11, assignedCount: 4,
  },
  {
    id: "l5", clientId: "c5", clientName: "Luis Vargas",
    runAt: "2026-02-27T19:50:00Z", durationSecs: 8,
    config: { salaryMin: "100000", salaryMax: "160000", workType: "", experienceLevel: "mid", minMatchScore: 60, maxResults: 15, engines: { linkedin: false, jsearch: true, indeed: true } },
    resultsCount: 5, assignedCount: 1,
  },
];

// ─── JA Staff Mock Data ───────────────────────────────────────
export type StaffRole = "admin" | "member";
export type StaffStatus = "active" | "suspended" | "pending";

export interface MockStaff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  lastLogin: string | null;
}

export const MOCK_STAFF: MockStaff[] = [
  {
    id: "s1",
    name: "JA Admin",
    email: "admin@jateam.com",
    role: "admin",
    status: "active",
    createdAt: "2025-10-01",
    lastLogin: "2026-03-18T14:22:00Z",
  },
  {
    id: "s2",
    name: "Emily Chen",
    email: "emily.c@jateam.com",
    role: "member",
    status: "active",
    createdAt: "2026-01-15",
    lastLogin: "2026-03-17T09:45:00Z",
  },
  {
    id: "s3",
    name: "Marcus Johnson",
    email: "marcus.j@jateam.com",
    role: "member",
    status: "suspended",
    createdAt: "2026-02-10",
    lastLogin: "2026-02-28T16:20:00Z",
  },
  {
    id: "s4",
    name: "Priya Patel",
    email: "priya.p@jateam.com",
    role: "member",
    status: "pending",
    createdAt: "2026-03-18",
    lastLogin: null,
  },
];


"use client";

import Link from "next/link";
import { MOCK_CLIENTS, MOCK_ASSIGNMENTS, MOCK_SEARCH_LOGS } from "../_mock/data";

const RECENT_ACTIVITY = [
  { time: "16:23", client: "John Doe", action: "AI Agent search run", detail: "7 results • 2 assigned", color: "violet" },
  { time: "15:01", client: "Aisha Okonkwo", action: "Job offer received", detail: "Databricks — Data Engineer", color: "emerald" },
  { time: "14:40", client: "Sarah Mitchell", action: "AI Agent search run", detail: "9 results • 2 assigned", color: "violet" },
  { time: "12:15", client: "Aisha Okonkwo", action: "Application submitted", detail: "Snowflake — Senior Data Engineer", color: "sky" },
  { time: "09:30", client: "John Doe", action: "Application submitted", detail: "Vercel — Staff Frontend Engineer", color: "sky" },
];

export default function JaAdminDashboard() {
  const totalClients = MOCK_CLIENTS.length;
  const activeClients = MOCK_CLIENTS.filter(c => c.status === "active").length;
  const openAssignments = MOCK_ASSIGNMENTS.filter(a => a.status === "assigned").length;
  const inPipeline = MOCK_ASSIGNMENTS.filter(a => ["applied", "interviewing", "offer"].includes(a.status)).length;
  const totalSearchRuns = MOCK_SEARCH_LOGS.length;
  const totalResults = MOCK_SEARCH_LOGS.reduce((acc, l) => acc + l.resultsCount, 0);

  const stats = [
    { label: "Total Clients", value: totalClients, sub: `${activeClients} active`, color: "violet", icon: "👥" },
    { label: "Open Assignments", value: openAssignments, sub: "Pending JA action", color: "sky", icon: "📋" },
    { label: "In Pipeline", value: inPipeline, sub: "Applied → Offer", color: "amber", icon: "🔄" },
    { label: "Search Runs", value: totalSearchRuns, sub: `${totalResults} total results`, color: "emerald", icon: "🔍" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">Overview of all client activity — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                ${s.color === "violet" ? "bg-violet-500/10 text-violet-400" :
                  s.color === "sky" ? "bg-sky-500/10 text-sky-400" :
                  s.color === "amber" ? "bg-amber-500/10 text-amber-400" :
                  "bg-emerald-500/10 text-emerald-400"}`}>
                {s.label}
              </span>
            </div>
            <div>
              <p className="text-3xl font-bold text-zinc-100">{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Client Snapshot */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-100">Client Snapshot</h2>
            <Link href="/ja-admin/clients" className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {MOCK_CLIENTS.map((client) => (
              <Link
                key={client.id}
                href={`/ja-admin/clients/${client.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/30 transition"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300">
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{client.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{client.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-zinc-400">{client.assignedJobs} jobs</span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider
                    ${client.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      client.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full
                      ${client.status === "active" ? "bg-emerald-400 animate-pulse" :
                        client.status === "pending" ? "bg-amber-400" : "bg-zinc-500"}`} />
                    {client.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-100">Recent Activity</h2>
            <span className="text-[10px] text-zinc-500">Today</span>
          </div>
          <div className="px-4 py-3 space-y-1">
            {RECENT_ACTIVITY.map((event, i) => (
              <div key={i} className="flex gap-3 rounded-xl px-3 py-3 hover:bg-zinc-800/30 transition">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <span className={`h-2 w-2 rounded-full
                    ${event.color === "violet" ? "bg-violet-400" :
                      event.color === "emerald" ? "bg-emerald-400" :
                      "bg-sky-400"}`} />
                  {i < RECENT_ACTIVITY.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}
                </div>
                <div className="flex-1 min-w-0 pb-2">
                  <p className="text-[11px] font-semibold text-zinc-200">{event.client}</p>
                  <p className="text-[10px] text-zinc-400">{event.action}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{event.detail}</p>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">{event.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

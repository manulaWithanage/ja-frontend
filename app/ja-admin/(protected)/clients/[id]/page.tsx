"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_CLIENTS, MOCK_SEARCH_LOGS } from "../../_mock/data";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile");

  const client = MOCK_CLIENTS.find((c) => c.id === id);
  const logs = MOCK_SEARCH_LOGS.filter((l) => l.clientId === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-zinc-400">Client not found.</p>
        <Link href="/ja-admin/clients" className="text-xs text-violet-400 hover:underline">← Back to clients</Link>
      </div>
    );
  }

  const portalStatusLabel = { configured: "Active", invited: "Invite Sent", never_set: "Not Set" }[client.portal.access];
  const portalStatusColor = { configured: "text-emerald-400", invited: "text-amber-400", never_set: "text-zinc-500" }[client.portal.access];

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/ja-admin/clients" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back to Clients
      </Link>

      {/* Header */}
      <div className="flex items-start gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-2xl font-bold text-violet-300">
          {client.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-100">{client.name}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{client.email} · {client.phone}</p>
          {client.notes && <p className="mt-1.5 text-xs text-zinc-500 italic">{client.notes}</p>}
        </div>
        <Link
          href={`/ja-admin/assignments?client=${client.name}`}
          className="shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20 transition"
        >
          View Jobs in Assignments →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-900/50 border border-zinc-800 p-1 w-fit">
        {(["profile", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-5 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
          >
            {tab === "profile" ? "Profile & Access" : `Search History (${logs.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Profile & Access */}
      {activeTab === "profile" && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Account Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100">Account Information</h2>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: client.name },
                { label: "Email", value: client.email },
                { label: "Phone", value: client.phone },
                { label: "Account Status", value: client.status.charAt(0).toUpperCase() + client.status.slice(1) },
                { label: "Member Since", value: client.createdAt },
                { label: "Last Active", value: client.lastActive },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{row.label}</span>
                  <span className="text-xs font-semibold text-zinc-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Access */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100">Portal Access</h2>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3 space-y-2.5">
              {[
                { label: "Access Status", value: portalStatusLabel, color: portalStatusColor },
                { label: "Last Login", value: client.portal.lastLogin ? new Date(client.portal.lastLogin).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never" },
                { label: "Invite Sent", value: client.portal.inviteSentAt ?? "Not yet" },
                { label: "Temp Password", value: client.portal.tempPassword ?? "—" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{row.label}</span>
                  <span className={`text-xs font-semibold ${(row as any).color ?? "text-zinc-200"}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button className="flex-1 rounded-xl bg-violet-500/10 border border-violet-500/20 py-2.5 text-xs font-bold text-violet-300 hover:bg-violet-500/20 transition">
                Reset Password
              </button>
              <button className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/30 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
                Resend Invite
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
              <div className="rounded-xl bg-zinc-800/50 px-3 py-3 text-center">
                <p className="text-xl font-bold text-zinc-100">{client.assignedJobs}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Jobs Assigned</p>
              </div>
              <div className="rounded-xl bg-zinc-800/50 px-3 py-3 text-center">
                <p className="text-xl font-bold text-zinc-100">{client.searchRuns}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Agent Searches</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Search History */}
      {activeTab === "history" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
              <p className="text-sm text-zinc-500">No search runs found for this client.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-zinc-700 transition">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-100">
                      {new Date(log.runAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      <span className="ml-2 text-zinc-500 font-normal text-xs">
                        at {new Date(log.runAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {log.durationSecs}s runtime · {log.resultsCount} results found · {log.assignedCount} assigned to tracker
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-[10px] font-bold text-violet-300">{log.resultsCount} results</span>
                    <span className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-[10px] font-bold text-sky-300">{log.assignedCount} assigned</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {[
                    { label: "Salary", value: `$${parseInt(log.config.salaryMin).toLocaleString()} — $${parseInt(log.config.salaryMax).toLocaleString()}` },
                    { label: "Work Type", value: log.config.workType || "Any" },
                    { label: "Experience", value: log.config.experienceLevel || "Any" },
                    { label: "Min Match", value: `${log.config.minMatchScore}%` },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg bg-zinc-800/50 px-3 py-2">
                      <p className="text-zinc-500 mb-0.5">{item.label}</p>
                      <p className="font-semibold text-zinc-200">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-1.5">
                  {Object.entries(log.config.engines).map(([engine, on]) => (
                    <span key={engine} className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${on ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-zinc-800 border-zinc-700 text-zinc-600 line-through"}`}>
                      {engine}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

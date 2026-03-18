"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_SEARCH_LOGS, MockSearchLog } from "../_mock/data";

export default function LogsPage() {
  const [logs] = useState<MockSearchLog[]>(MOCK_SEARCH_LOGS);
  const [clientFilter, setClientFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clients = [...new Set(logs.map((l) => l.clientName))];

  const filtered = clientFilter === "all"
    ? logs
    : logs.filter((l) => l.clientName === clientFilter);

  const totalResults = filtered.reduce((acc, l) => acc + l.resultsCount, 0);
  const totalAssigned = filtered.reduce((acc, l) => acc + l.assignedCount, 0);
  const avgDuration = filtered.length > 0 ? (filtered.reduce((acc, l) => acc + l.durationSecs, 0) / filtered.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Search Logs</h1>
          <p className="text-sm text-zinc-400 mt-1">AI Agent run history across all clients</p>
        </div>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Runs", value: filtered.length, color: "violet" },
          { label: "Total Results", value: totalResults, color: "sky" },
          { label: "Total Assigned", value: totalAssigned, color: "emerald" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
            <p className="text-2xl font-bold text-zinc-100">{s.value}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-zinc-900/60 border-b border-zinc-800 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
          <span>Client / Time</span>
          <span className="text-right">Results</span>
          <span className="text-right">Assigned</span>
          <span className="text-right">Duration</span>
          <span className="text-right">Engines</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-500">No logs found.</p>
          </div>
        ) : (
          filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            const activeEngines = Object.entries(log.config.engines).filter(([, v]) => v).map(([k]) => k);

            return (
              <div key={log.id} className="border-b border-zinc-800 last:border-0">
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 text-left hover:bg-zinc-800/30 transition"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/ja-admin/clients/${log.clientId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-bold text-violet-300 hover:text-violet-200 transition"
                    >
                      {log.clientName}
                    </Link>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(log.runAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" "}at{" "}
                      {new Date(log.runAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-zinc-200 self-center">{log.resultsCount}</span>
                  <span className="text-sm font-bold text-emerald-400 self-center">{log.assignedCount}</span>
                  <span className="text-sm text-zinc-400 self-center">{log.durationSecs}s</span>
                  <div className="flex items-center gap-1 self-center">
                    {activeEngines.map((e) => (
                      <span key={e} className="rounded bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 text-[9px] font-bold text-violet-400 uppercase">
                        {e.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </button>

                {/* Expanded config */}
                {isExpanded && (
                  <div className="px-5 pb-5 bg-zinc-900/30 border-t border-zinc-800/50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mt-4 mb-3">Search Configuration</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: "Salary Range", value: `$${parseInt(log.config.salaryMin).toLocaleString()} — $${parseInt(log.config.salaryMax).toLocaleString()}` },
                        { label: "Work Type", value: log.config.workType || "Any" },
                        { label: "Experience Level", value: log.config.experienceLevel || "Any" },
                        { label: "Min Match Score", value: `${log.config.minMatchScore}%` },
                        { label: "Max Results", value: String(log.config.maxResults) },
                        { label: "LinkedIn", value: log.config.engines.linkedin ? "✓ On" : "✗ Off" },
                        { label: "JSearch", value: log.config.engines.jsearch ? "✓ On" : "✗ Off" },
                        { label: "Indeed", value: log.config.engines.indeed ? "✓ On" : "✗ Off" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-zinc-800/50 border border-zinc-700/50 px-3 py-2.5">
                          <p className="text-[10px] text-zinc-500 mb-0.5">{item.label}</p>
                          <p className={`text-xs font-semibold ${item.value.startsWith("✓") ? "text-emerald-400" : item.value.startsWith("✗") ? "text-zinc-600" : "text-zinc-200"}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="text-[11px] text-zinc-600 text-center">Avg run duration: {avgDuration}s · Showing {filtered.length} entries</p>
    </div>
  );
}

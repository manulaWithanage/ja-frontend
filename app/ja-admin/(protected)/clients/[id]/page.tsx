"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { jaApi } from "../../../../lib/jaApi";
import type { Client } from "../../../../types/ja-admin";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile">("profile");

  useEffect(() => {
    async function load() {
      try {
        const data = await jaApi.get<Client>(`/clients/${id}`);
        setClient(data);
      } catch (err) {
        console.error("Failed to load client:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded bg-zinc-800 animate-pulse" />
        <div className="h-32 rounded-2xl border border-zinc-800 bg-zinc-900/40 animate-pulse" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-zinc-400">Client not found.</p>
        <Link href="/ja-admin/clients" className="text-xs text-violet-400 hover:underline">← Back to clients</Link>
      </div>
    );
  }

  const portalLabels: Record<string, string> = { configured: "Active", invited: "Invite Sent", never_set: "Not Set" };
  const portalColors: Record<string, string> = { configured: "text-emerald-400", invited: "text-amber-400", never_set: "text-zinc-500" };
  const portalStatusLabel = portalLabels[client.portal_access] || "Unknown";
  const portalStatusColor = portalColors[client.portal_access] || "text-zinc-500";

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
          <p className="text-sm text-zinc-400 mt-0.5">{client.email} · {client.phone || "—"}</p>
          {client.notes && <p className="mt-1.5 text-xs text-zinc-500 italic">{client.notes}</p>}
        </div>
        <Link
          href={`/ja-admin/assignments?client=${client.name}`}
          className="shrink-0 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-xs font-bold text-violet-300 hover:bg-violet-500/20 transition"
        >
          View Jobs in Pipeline →
        </Link>
      </div>

      {/* Tab bar (only profile for now, search history removed) */}
      <div className="flex gap-1 rounded-xl bg-zinc-900/50 border border-zinc-800 p-1 w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className="rounded-lg px-5 py-2 text-xs font-bold bg-violet-500 text-white shadow-lg shadow-violet-500/20"
        >
          Profile & Access
        </button>
      </div>

      {/* Profile & Access */}
      {activeTab === "profile" && (
        <div className="grid gap-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
          {/* Account Info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 lg:col-start-1 lg:row-start-1">
            <h2 className="text-sm font-bold text-zinc-100">Account Information</h2>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: client.name },
                { label: "Email", value: client.email },
                { label: "Phone", value: client.phone || "—" },
                { label: "Account Status", value: client.status.charAt(0).toUpperCase() + client.status.slice(1) },
                { label: "Member Since", value: new Date(client.created_at || "").toLocaleDateString() },
                { label: "Last Updated", value: new Date(client.updated_at || "").toLocaleDateString() },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{row.label}</span>
                  <span className="text-xs font-semibold text-zinc-200 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Portal Access */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 lg:col-start-2 lg:row-start-1">
            <h2 className="text-sm font-bold text-zinc-100">Portal Access</h2>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3 space-y-2.5">
              {[
                { label: "Access Status", value: portalStatusLabel, color: portalStatusColor },
                { label: "Last Login", value: client.last_login ? new Date(client.last_login).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never" },
                { label: "Invite Sent", value: client.invite_sent_at ? new Date(client.invite_sent_at).toLocaleDateString() : "Not yet" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{row.label}</span>
                  <span className={`text-xs font-semibold ${"color" in row ? row.color : "text-zinc-200"}`}>{row.value}</span>
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
          </div>

          {/* Job Profile & Preferences */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4 lg:col-span-2 lg:row-start-2">
            <h2 className="text-sm font-bold text-zinc-100">Job Profile & Preferences</h2>
            <div className="grid gap-x-12 gap-y-3 sm:grid-cols-2">
              {[
                { label: "Current / Last Title", value: client.current_title },
                { label: "Target Role", value: client.target_role },
                { label: "Industry", value: client.industry },
                { label: "Preferred Location", value: client.preferred_location },
                { label: "Work Type", value: client.work_type ? client.work_type.charAt(0).toUpperCase() + client.work_type.slice(1) : null },
                { label: "Referral Source", value: client.referral_source ? client.referral_source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">{row.label}</span>
                  <span className="text-sm font-medium text-zinc-200">{row.value || <span className="text-zinc-600 italic text-xs">Not specified</span>}</span>
                </div>
              ))}
              
              <div className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2 sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">LinkedIn Profile</span>
                <span className="text-sm font-medium text-zinc-200">
                  {client.linkedin_url ? (
                    <a href={client.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">
                      {client.linkedin_url}
                    </a>
                  ) : (
                    <span className="text-zinc-600 italic text-xs">Not specified</span>
                  )}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_CLIENTS, MockClient, PortalAccess } from "../_mock/data";

// ─── Portal Access Badge ──────────────────────────────────────
const ACCESS_STYLES: Record<PortalAccess, { badge: string; dot: string; label: string }> = {
  configured: { badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300", dot: "bg-emerald-400 animate-pulse", label: "Portal Active" },
  invited: { badge: "bg-amber-500/10 border-amber-500/20 text-amber-300", dot: "bg-amber-400", label: "Invite Sent" },
  never_set: { badge: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400", dot: "bg-zinc-500", label: "No Access" },
};

const STATUS_STYLES = {
  active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  inactive: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  suspended: "bg-red-500/10 border-red-500/20 text-red-400",
};

// ─── View Credentials Modal ────────────────────────────────────
function ViewCredentialsModal({ client, onClose }: { client: MockClient; onClose: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const password = client.portal.tempPassword ?? "(not set)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Portal Credentials</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">{client.name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-3">
          {/* Username */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Username / Email</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-zinc-100">{client.email}</code>
              <button
                onClick={() => navigator.clipboard.writeText(client.email)}
                className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1.5">Password</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-zinc-100 tracking-widest">
                {showPassword ? password : "•".repeat(Math.min(password.length, 12))}
              </code>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition"
                >
                  {showPassword ? "Hide" : "Reveal"}
                </button>
                {showPassword && (
                  <button
                    onClick={() => navigator.clipboard.writeText(password)}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-200 transition"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          </div>

          {client.portal.lastLogin && (
            <p className="text-[10px] text-zinc-600 text-center">
              Last login: {new Date(client.portal.lastLogin).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <button onClick={onClose} className="mt-5 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Set Password Modal ───────────────────────────────────────
function SetPasswordModal({ client, onClose, onSave }: {
  client: MockClient;
  onClose: () => void;
  onSave: (id: string, password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError("Must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    // TODO: backend — PATCH /api/ja-admin/clients/:id/credentials
    onSave(client.id, password);
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Set Portal Password</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For: {client.name} · {client.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition p-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-semibold text-emerald-300">Password set successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "password", label: "New Password", value: password, set: setPassword },
              { key: "confirm", label: "Confirm Password", value: confirm, set: setConfirm },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">{f.label}</label>
                <input
                  type="password"
                  required
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
            ))}

            {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
              <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">Set Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Create Client Modal ──────────────────────────────────────
function CreateClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: MockClient) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: backend — POST /api/ja-admin/clients
    const newClient: MockClient = {
      id: `c${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      notes: form.notes,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
      assignedJobs: 0,
      searchRuns: 0,
      portal: {
        access: form.password ? "invited" : "never_set",
        lastLogin: null,
        tempPassword: form.password || null,
        inviteSentAt: form.password ? new Date().toISOString().split("T")[0] : null,
      },
    };
    onAdd(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-zinc-100">Create New Client</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "name", label: "Full Name", placeholder: "John Doe", type: "text", full: true },
              { key: "email", label: "Email", placeholder: "john@email.com", type: "email", full: true },
              { key: "phone", label: "Phone", placeholder: "+1 415 555 0100", type: "text", full: false },
              { key: "password", label: "Temp Password", placeholder: "TJH@2026!", type: "password", full: false },
            ].map((f) => (
              <div key={f.key} className={`space-y-1.5 ${f.full ? "col-span-2" : "col-span-1"}`}>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{f.label}</label>
                <input
                  type={f.type}
                  required={f.key === "name" || f.key === "email"}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Internal Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Background, target roles, special requirements..."
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none resize-none transition focus:border-violet-500/40"
            />
          </div>

          <p className="text-[10px] text-zinc-600">Setting a temp password will mark portal as "Invite Sent". Leave blank to configure later.</p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients] = useState<MockClient[]>(MOCK_CLIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive" | "suspended">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [passwordModal, setPasswordModal] = useState<MockClient | null>(null);
  const [credentialsModal, setCredentialsModal] = useState<MockClient | null>(null);
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const filtered = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSetPassword = (id: string, password: string) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, portal: { ...c.portal, access: "invited", tempPassword: password, inviteSentAt: new Date().toISOString().split("T")[0] } } : c));
  };

  const handleSendInvite = (id: string) => {
    // TODO: backend — POST /api/ja-admin/clients/:id/send-invite
    setInviteSent(id);
    setTimeout(() => setInviteSent(null), 2500);
  };

  const handleToggleSuspend = (id: string) => {
    // TODO: backend — PATCH /api/ja-admin/clients/:id/status
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "suspended" ? "active" : "suspended" } : c));
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} onAdd={(c) => setClients((p) => [c, ...p])} />}
      {passwordModal && <SetPasswordModal client={passwordModal} onClose={() => setPasswordModal(null)} onSave={handleSetPassword} />}
      {credentialsModal && <ViewCredentialsModal client={credentialsModal} onClose={() => setCredentialsModal(null)} />}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            Client Accounts
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-full">{clients.length} total</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage client portal accounts and access credentials</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Create Account
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Portal Active", value: clients.filter(c => c.portal.access === "configured").length, color: "emerald" },
          { label: "Invite Sent", value: clients.filter(c => c.portal.access === "invited").length, color: "amber" },
          { label: "No Access", value: clients.filter(c => c.portal.access === "never_set").length, color: "zinc" },
          { label: "Suspended", value: clients.filter(c => c.status === "suspended").length, color: "red" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-100">{s.value}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-64 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-50 placeholder-zinc-600 outline-none focus:border-violet-500/40 transition"
        />
        <div className="flex gap-1 rounded-xl bg-zinc-900/50 border border-zinc-800 p-1">
          {(["all", "active", "pending", "inactive", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center">
            <p className="text-sm text-zinc-500">No clients found.</p>
          </div>
        ) : (
          filtered.map((client) => {
            const access = ACCESS_STYLES[client.portal.access];
            const statusStyle = STATUS_STYLES[client.status] || STATUS_STYLES.inactive;
            const isSuspended = client.status === "suspended";

            return (
              <div key={client.id} className={`group rounded-2xl border p-5 transition ${isSuspended ? "border-red-500/10 bg-red-500/5" : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"}`}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${isSuspended ? "bg-red-500/10 text-red-400" : "bg-violet-500/15 text-violet-300"}`}>
                    {client.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="text-sm font-bold text-zinc-100">{client.name}</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                        {client.status}
                      </span>
                      {/* Portal access badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${access.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${access.dot}`} />
                        {access.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{client.email} · {client.phone}</p>
                    {client.notes && <p className="mt-0.5 text-[11px] text-zinc-600 italic truncate max-w-lg">{client.notes}</p>}
                  </div>

                  {/* Right: last login */}
                  <div className="shrink-0 text-right">
                    {client.portal.lastLogin ? (
                      <>
                        <p className="text-[10px] font-semibold text-zinc-300">Last login</p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(client.portal.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" "}{new Date(client.portal.lastLogin).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </>
                    ) : (
                      <p className="text-[10px] text-zinc-600">Never logged in</p>
                    )}
                    <p className="text-[10px] text-zinc-600 mt-1">Created {client.createdAt}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-800/50 pt-3">
                  {/* View Credentials — primary action */}
                  {client.portal.access !== "never_set" && (
                    <button
                      onClick={() => setCredentialsModal(client)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-[11px] font-bold text-violet-300 hover:bg-violet-500/20 transition"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                      View Credentials
                    </button>
                  )}

                  <button
                    onClick={() => setPasswordModal(client)}
                    className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    {client.portal.access === "never_set" ? "Set Password" : "Reset Password"}
                  </button>

                  <button
                    onClick={() => handleSendInvite(client.id)}
                    className={`rounded-xl border px-4 py-2 text-[11px] font-bold transition ${
                      inviteSent === client.id
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    {inviteSent === client.id ? "✓ Invite Sent!" : "Send Invite"}
                  </button>

                  <Link
                    href={`/ja-admin/clients/${client.id}`}
                    className="rounded-xl border border-zinc-800 bg-zinc-800/30 px-4 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    View Profile →
                  </Link>

                  <button
                    onClick={() => handleToggleSuspend(client.id)}
                    className={`ml-auto rounded-xl border px-4 py-2 text-[11px] font-bold transition ${
                      isSuspended
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                        : "border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    {isSuspended ? "Reinstate" : "Suspend"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MOCK_STAFF, MockStaff, StaffRole } from "../_mock/data";

const STATUS_STYLES = {
  active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  suspended: "bg-red-500/10 border-red-500/20 text-red-400",
};

// ─── Set Password Modal ───────────────────────────────────────
function ResetPasswordModal({ staff, onClose, onSave }: {
  staff: MockStaff;
  onClose: () => void;
  onSave: (id: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    // TODO: backend — PATCH /api/ja-admin/team/:id/credentials
    onSave(staff.id);
    setSuccess(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Reset Password</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For: {staff.name} · {staff.email}</p>
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
            <p className="text-sm font-semibold text-emerald-300">Password reset successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "password", label: "New Temporary Password", value: password, set: setPassword },
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

// ─── Create Staff Modal ──────────────────────────────────────
function CreateStaffModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: MockStaff) => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "member" as StaffRole });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: backend — POST /api/ja-admin/team
    const newStaff: MockStaff = {
      id: `s${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      lastLogin: null,
    };
    onAdd(newStaff);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-zinc-100">Add Team Member</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Full Name</label>
            <input required placeholder="e.g. Jane Smith" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/40" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Email Address</label>
            <input type="email" required placeholder="name@jateam.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-50 placeholder-zinc-600 outline-none transition focus:border-violet-500/40" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Access Level</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as StaffRole }))} className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2.5 text-sm text-zinc-50 outline-none transition focus:border-violet-500/40 appearance-none cursor-pointer">
              <option value="member">Staff Member (Processing/Standard access)</option>
              <option value="admin">Administrator (Full control)</option>
            </select>
          </div>

          <p className="text-[10px] text-zinc-500 mt-2 border border-zinc-800/60 bg-zinc-900/40 p-2 rounded-lg">An invite link will be automatically sent to the email address provided.</p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800/50 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">Send Invite</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TeamAccessPage() {
  const [team, setTeam] = useState<MockStaff[]>(MOCK_STAFF);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
  
  const [showCreate, setShowCreate] = useState(false);
  const [passwordModal, setPasswordModal] = useState<MockStaff | null>(null);

  const filtered = team.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleSuspend = (id: string) => {
    // TODO: backend — PATCH /api/ja-admin/team/:id/status
    setTeam((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === "suspended" ? "active" : "suspended" } : s));
  };

  const handleCreate = (newStaff: MockStaff) => {
    setTeam((prev) => [newStaff, ...prev]);
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      {showCreate && <CreateStaffModal onClose={() => setShowCreate(false)} onAdd={handleCreate} />}
      {passwordModal && <ResetPasswordModal staff={passwordModal} onClose={() => setPasswordModal(null)} onSave={() => {}} />}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
            Team Access
            <span className="text-xs font-normal text-zinc-500 bg-zinc-800/80 px-2 py-0.5 rounded-full">{team.length} members</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage internal JA staff accounts and access privileges.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6m6-6v12" /></svg>
          Add Team Member
        </button>
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
          {(["all", "active", "pending", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Team Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-bold">Staff Member</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Last Login</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500 italic">No staff members found.</td>
              </tr>
            ) : filtered.map((staff) => {
              const statusStyle = STATUS_STYLES[staff.status];
              const isSuspended = staff.status === "suspended";
              const isAdmin = staff.role === "admin";

              return (
                <tr key={staff.id} className={`transition ${isSuspended ? "bg-red-500/5 opacity-80" : "hover:bg-zinc-900/50"}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isAdmin ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-violet-500/15 text-violet-300 border border-violet-500/20"}`}>
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200">{staff.name}</p>
                        <p className="text-[11px] text-zinc-500">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Admin
                      </span>
                    ) : (
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold">Member</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${statusStyle}`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px]">
                    {staff.lastLogin ? (
                      <div>
                        <p className="text-zinc-300">{new Date(staff.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        <p className="text-zinc-600">{new Date(staff.lastLogin).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setPasswordModal(staff)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                      >
                        Reset PW
                      </button>
                      <button 
                        onClick={() => handleToggleSuspend(staff.id)}
                        className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold transition ${
                          isSuspended 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" 
                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                        }`}
                      >
                        {isSuspended ? "Reinstate" : "Suspend"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MOCK_CLIENTS, MOCK_ASSIGNMENTS, MockAssignment } from "../_mock/data";

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  applied: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  interviewing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  offer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/10 border-red-500/20 text-red-400",
};

// Mock current week identifier
const CURRENT_WEEK_ID = "2026-W12";
const PAST_WEEKS = [
  { id: "2026-W11", label: "Mar 8 – Mar 14 (Week 11)" },
  { id: "2026-W10", label: "Mar 1 – Mar 7 (Week 10)" },
];

function getClientLimit(createdAt: string) {
  const createdDate = new Date(createdAt);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return createdDate < threeMonthsAgo ? 80 : 60;
}

// ─── Add Manual Job Modal ──────────────────────────────────────
function AddManualJobModal({ 
  clientId, clientName, onClose, onAdd 
}: { 
  clientId: string; clientName: string; onClose: () => void; onAdd: (job: MockAssignment) => void 
}) {
  const [form, setForm] = useState({ title: "", company: "", location: "", link: "", status: "applied" as any });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: MockAssignment = {
      id: `manual_${Date.now()}`,
      clientId,
      clientName,
      jobTitle: form.title,
      company: form.company,
      location: form.location,
      status: form.status,
      matchScore: 99, // Manual jobs are perfect matches
      assignedAt: new Date().toISOString().split("T")[0],
      applyLink: form.link,
      batchActive: form.status === "assigned",
      weekId: CURRENT_WEEK_ID,
    };
    onAdd(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Add Manual Job</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">For {clientName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Job Title</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Company</label>
              <input required value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Vercel" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Location</label>
              <input required value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="e.g. Remote" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Apply Link</label>
            <input type="url" required value={form.link} onChange={e => setForm(f => ({...f, link: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50" placeholder="https://" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Starting Status</label>
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50 appearance-none">
              <option value="assigned">Active Batch (Needs Applying)</option>
              <option value="applied">Applied (Already applied)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-700 font-bold text-xs text-zinc-400 hover:text-zinc-200 transition">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white hover:bg-violet-500 transition">Add Job</button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────
export default function AssignmentsPipelinePage() {
  const searchParams = useSearchParams();
  const defaultClientParam = searchParams.get("client");

  // Mock initial data setup — injecting current week to non-archived items
  const [assignments, setAssignments] = useState<MockAssignment[]>(
    MOCK_ASSIGNMENTS.map(a => ({ ...a, weekId: a.weekId || (a.isArchived ? "2026-W11" : CURRENT_WEEK_ID) }))
  );
  
  const initialClient = defaultClientParam 
    ? MOCK_CLIENTS.find(c => c.name.toLowerCase() === defaultClientParam.toLowerCase()) 
    : MOCK_CLIENTS[0];
    
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClient?.id || null);
  const [selectedWeek, setSelectedWeek] = useState<string>(CURRENT_WEEK_ID);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedClient = useMemo(() => MOCK_CLIENTS.find(c => c.id === selectedClientId), [selectedClientId]);

  // Derived state for the selected client + week
  const clientJobs = useMemo(() => {
    if (!selectedClientId) return [];
    return assignments.filter(a => a.clientId === selectedClientId);
  }, [assignments, selectedClientId]);

  const activeWeekJobs = clientJobs.filter(a => a.weekId === selectedWeek);
  const limit = selectedClient ? getClientLimit(selectedClient.createdAt) : 60;

  // Breakdown for CURRENT WEEK view
  const queuedJobs = activeWeekJobs.filter(a => a.status === "assigned" && !a.batchActive);
  const batchJobs = activeWeekJobs.filter(a => a.batchActive);
  const completedJobs = activeWeekJobs.filter(a => 
    ["applied", "interviewing", "offer", "rejected"].includes(a.status) && !a.batchActive
  );

  // Actions
  const addToBatch = (id: string) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, batchActive: true } : a));
  const removeFromBatch = (id: string) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, batchActive: false } : a));
  const markApplied = (id: string) => setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: "applied", batchActive: false } : a));
  
  // Weekly Sweep puts everything completed this week into "archived" state but keeps weekId
  const archiveCompletedBatch = () => {
    setAssignments(prev => prev.map(a => 
      (a.clientId === selectedClientId && a.weekId === selectedWeek && ["applied", "interviewing", "offer", "rejected"].includes(a.status) && !a.batchActive)
        ? { ...a, isArchived: true }
        : a
    ));
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {showAddModal && selectedClient && (
        <AddManualJobModal 
          clientId={selectedClient.id} 
          clientName={selectedClient.name} 
          onClose={() => setShowAddModal(false)}
          onAdd={(job) => setAssignments(p => [job, ...p])}
        />
      )}

      {/* ─── Left Pane: Client List ────────────────────────────── */}
      <div className="w-80 shrink-0 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/40">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest mb-1.5">Weekly Tracker</h2>
          <p className="text-[10px] text-zinc-500">Select a client to process their jobs.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {MOCK_CLIENTS.map(client => {
            const isSelected = client.id === selectedClientId;
            const cLimit = getClientLimit(client.createdAt);
            const cJobsThisWeek = assignments.filter(a => a.clientId === client.id && a.weekId === CURRENT_WEEK_ID);
            const isVeteran = cLimit === 80;
            const progressPct = Math.min(100, (cJobsThisWeek.length / cLimit) * 100);

            return (
              <button
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`w-full text-left rounded-xl p-3 transition ${
                  isSelected ? "bg-violet-500/10 border border-violet-500/30" : "border border-transparent hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold ${isSelected ? "text-violet-300" : "text-zinc-200"}`}>{client.name}</span>
                  {isVeteran && <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded">Veteran +</span>}
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1">
                  <span>{cJobsThisWeek.length} queued this week</span>
                  <span>Max {cLimit} / wk</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${progressPct > 90 ? "bg-red-500" : isSelected ? "bg-violet-500" : "bg-zinc-600"}`} 
                    style={{ width: `${progressPct}%` }} 
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right Pane: Active Workflow ───────────────────────── */}
      <div className="flex-1 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <svg className="h-12 w-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p>Select a client from the left pane to view their pipeline.</p>
          </div>
        ) : (
          <>
            {/* Header / Week Selector */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                    {selectedClient.name}'s Pipeline
                  </h1>
                  <p className="text-[11px] text-zinc-400 mt-1.5">Track and manage weekly application flow.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddModal(true)} className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-[11px] font-bold text-zinc-300 hover:text-white transition">
                    ➕ Add Manual Job
                  </button>
                  <select 
                    value={selectedWeek} 
                    onChange={e => setSelectedWeek(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-4 py-2 outline-none focus:border-violet-500 transition appearance-none cursor-pointer"
                  >
                    <option value={CURRENT_WEEK_ID}>Mar 15 – Mar 21 (Current Week)</option>
                    {PAST_WEEKS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                  </select>
                </div>
              </div>

              {selectedWeek === CURRENT_WEEK_ID && (
                <div className="flex justify-between items-center pt-2">
                  <div className="flex gap-6">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Limit: <span className="text-zinc-200 ml-1">{limit} jobs</span></div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-violet-400/80">Batch Size: <span className="text-violet-300 ml-1">{batchJobs.length} / 15</span></div>
                  </div>
                  <button 
                    onClick={archiveCompletedBatch}
                    disabled={completedJobs.length === 0}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                      completedJobs.length > 0
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Mark Week Complete ({completedJobs.length})
                  </button>
                </div>
              )}
            </div>

            {/* Workflow Columns */}
            {selectedWeek === CURRENT_WEEK_ID ? (
              <div className="flex-1 overflow-hidden flex gap-4 p-4">
                {/* 1. Queued */}
                <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">1. Queued</h3>
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{queuedJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {queuedJobs.length === 0 ? <p className="text-[11px] text-zinc-500 text-center py-10 italic">Queue is empty.</p> : queuedJobs.map(job => (
                      <div key={job.id} className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 hover:border-zinc-700 transition">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-zinc-200">{job.jobTitle}</h4>
                          <span className="text-[10px] font-bold text-emerald-400/80">{job.matchScore}%</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mb-2">{job.company} · {job.location}</p>
                        <div className="flex gap-2">
                          <a href={job.applyLink} target="_blank" rel="noreferrer" className="flex-1 text-center rounded border border-zinc-700/50 bg-zinc-800/50 py-1 text-[9px] font-bold text-zinc-400 hover:text-zinc-200">View Link</a>
                          <button onClick={() => addToBatch(job.id)} disabled={batchJobs.length >= 15} className="flex-1 rounded bg-violet-500/15 border border-violet-500/20 py-1 text-[9px] font-bold text-violet-300 hover:bg-violet-500/30 disabled:opacity-50 transition">→ Add to Batch</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Active Batch */}
                <div className="flex-1 flex flex-col rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden ring-1 ring-violet-500/10 shadow-lg shadow-violet-500/5">
                  <div className="p-3 border-b border-violet-500/20 bg-violet-500/10 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-violet-300 uppercase tracking-wider">2. Active Batch</h3>
                    <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{batchJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {batchJobs.length === 0 ? <p className="text-[10px] text-violet-500/50 text-center py-10 italic">No active batch.</p> : batchJobs.map(job => (
                      <div key={job.id} className="rounded-xl border border-violet-500/20 bg-zinc-950/50 p-3 shadow-sm">
                        <h4 className="text-xs font-bold text-zinc-100 mb-0.5">{job.jobTitle}</h4>
                        <p className="text-[10px] text-zinc-400 mb-3">{job.company} · {job.location}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => removeFromBatch(job.id)} className="shrink-0 p-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                          <a href={job.applyLink} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-lg border border-zinc-700 bg-zinc-800 py-1.5 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700">Apply ↗</a>
                          <button onClick={() => markApplied(job.id)} className="flex-1 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 py-1.5 text-[10px] font-bold text-white shadow shadow-violet-500/20 hover:from-violet-400 hover:to-purple-500 transition">✓ Mark Applied</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Applied */}
                <div className="flex-1 flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/20 overflow-hidden">
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"><svg className="h-3.5 w-3.5 text-emerald-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>3. Applied</h3>
                    <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{completedJobs.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {completedJobs.length === 0 ? <p className="text-[11px] text-zinc-600 text-center py-10 italic">Empty.</p> : completedJobs.map(job => (
                      <div key={job.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 hover:border-zinc-700 transition">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-zinc-200">{job.jobTitle}</h4>
                          <span className={`inline-flex items-center px-1.5 text-[9px] font-bold uppercase tracking-wider rounded border ${STATUS_COLORS[job.status] || STATUS_COLORS.applied}`}>{job.status}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{job.company}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Past Week View (Read Only Archive focus) */
              <div className="flex-1 overflow-y-auto p-6">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                  <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Applied Jobs this Week ({activeWeekJobs.filter(a => a.isArchived).length})
                  </h3>
                  
                  {activeWeekJobs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 italic text-sm">No record found for this week.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {activeWeekJobs.filter(a => a.isArchived || a.status !== "assigned").map(job => (
                        <div key={job.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-zinc-200">{job.jobTitle}</h4>
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_COLORS[job.status] || STATUS_COLORS.applied}`}>{job.status}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mb-1">{job.company} · {job.location}</p>
                          <p className="text-[10px] text-zinc-500">Applied Link: <a href={job.applyLink} target="_blank" rel="noreferrer" className="text-violet-400 hover:underline px-1 py-0.5 ml-1 bg-violet-500/10 rounded">Source ↗</a></p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

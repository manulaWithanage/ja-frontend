"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { jaApi } from "../../../lib/jaApi";
import type { Client, Job, JobStatus } from "../../../types/ja-admin";
import { SkeletonBox } from "../../../components/Skeleton";

const STATUS_COLORS: Record<string, string> = {
  queued: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  assigned: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  batch_active: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  applied: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  interviewing: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  offer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/10 border-red-500/20 text-red-400",
};

/** Returns the ISO 8601 week number and year */
function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return { year: date.getUTCFullYear(), week: Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7) };
}

function toWeekId(d: Date): string {
  const { year, week } = getISOWeek(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Simplified Components ──────────────────────────────────────

function JobCard({ job, onStatusChange, onArchiveRequest, isCompact = false, isArchived = false, onRestore }: { job: Job; onStatusChange?: (id: string, s: JobStatus) => void; onArchiveRequest?: (job: Job) => void; isCompact?: boolean; isArchived?: boolean; onRestore?: (id: string) => void }) {
  const isClientReq = job.source === "client_selected";
  const isClientHandled = job.handled_by === "client";

  return (
    <div className={`group relative ${isCompact ? 'h-[140px]' : 'h-[180px]'} shrink-0 flex flex-col rounded-2xl border transition-all duration-300 ${
      isArchived ? "bg-zinc-950/20 border-zinc-900 opacity-60 hover:opacity-100 grayscale hover:grayscale-0" :
      isClientHandled ? "bg-amber-500/[0.03] border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]" :
      isClientReq ? "bg-sky-500/[0.03] border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.05)]" : "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700"
    } p-4`}>
      {/* Absolute Archive/Restore Button */}
      {!isArchived && onArchiveRequest && (
        <button onClick={() => onArchiveRequest(job)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-20" title="Archive Job">
           <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}

      {isArchived && onRestore && (
        <button onClick={() => onRestore(job.id)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl z-20" title="Restore Job">
           <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      )}

      {/* Header Info */}
      <div className={`${isCompact ? 'h-10' : 'h-14'} flex justify-between items-start gap-3`}>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            {isClientHandled ? (
              <span className="text-[6px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20">⚠ Client Handled</span>
            ) : job.handled_by === "ja_team" && (job.status === "assigned" || job.status === "batch_active" || job.status === "applied") ? (
              <span className="text-[6px] font-black uppercase tracking-widest text-violet-400 bg-violet-400/10 px-1 py-0.5 rounded border border-violet-400/20 tracking-[0.2em]">JA Team Handled</span>
            ) : isClientReq && (
              <span className="text-[6px] font-black uppercase tracking-widest text-sky-400 bg-sky-400/10 px-1 py-0.5 rounded border border-sky-400/20">Client Pick</span>
            )}
            <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{timeAgo(job.created_at)}</span>
          </div>
          <h4 className={`${isCompact ? 'text-[11px]' : 'text-[13px]'} font-bold text-zinc-100 truncate tracking-tight`}>{job.job_title}</h4>
          <p className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-medium text-zinc-500 truncate`}>{job.company}</p>
        </div>
      </div>

      {/* Description Area */}
      {!isCompact && (
        <div className="h-10 my-2">
          <p className="text-[10px] leading-relaxed text-zinc-600 line-clamp-2">
            {job.description || "No description provided for this role."}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex items-center gap-2">
        {!isArchived ? (
          <>
            {job.apply_link && (
              <a href={job.apply_link} target="_blank" rel="noreferrer" className="flex-none w-8 h-7 flex items-center justify-center rounded-xl bg-zinc-950/50 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all" title="View Link">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
            
            {onStatusChange && (
              <>
                {job.status === "queued" && (
                  <button onClick={() => onStatusChange(job.id, "assigned")} className="flex-1 h-7 rounded-xl bg-white text-black text-[8px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-lg shadow-white/5">
                    PUSH TO PROCESS
                  </button>
                )}
                
                {(job.status === "assigned" || job.status === "batch_active") && (
                  <>
                    <button onClick={() => onStatusChange(job.id, "queued")} className="flex-none w-8 h-7 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="Return to Queue">
                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <button onClick={() => onStatusChange(job.id, "applied")} className="flex-1 h-7 rounded-xl bg-violet-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/10">
                      Confirm Applied
                    </button>
                  </>
                )}

                {["applied", "interviewing", "offer", "rejected"].includes(job.status) && (
                  <>
                    <button onClick={() => onStatusChange(job.id, "assigned")} className="flex-none w-8 h-7 flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all" title="Back to Process">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className={`flex-1 h-7 flex items-center justify-center rounded-xl text-[8px] font-black uppercase tracking-widest border border-zinc-800 ${STATUS_COLORS[job.status]}`}>
                      {job.status}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex-1 h-7 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
            Archived Role
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function AssignmentsPipelinePage() {
  const searchParams = useSearchParams();
  const defaultClientParam = searchParams.get("client");

  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [archivedJobs, setArchivedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>(toWeekId(new Date()));
  const [showAllWeeks, setShowAllWeeks] = useState(true);
  const [isJobsLoading, setIsJobsLoading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"queue" | "process" | "applied">("queue");
  const [clientSearch, setClientSearch] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");
  const [bundleIdInput, setBundleIdInput] = useState("");
  const [isSavingBundle, setIsSavingBundle] = useState(false);
  const [jobToArchive, setJobToArchive] = useState<Job | null>(null);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await jaApi.get<{ clients: Client[] }>("/clients");
      const clientsList = data.clients || [];
      setClients(clientsList);
      if (clientsList.length > 0) {
        const match = defaultClientParam ? clientsList.find(c => c.name.toLowerCase() === defaultClientParam.toLowerCase()) : null;
        setSelectedClientId(match?.id || clientsList[0].id);
      }
    } finally { setLoading(false); }
  }, [defaultClientParam]);

  const loadJobs = useCallback(async (clientId: string, weekId: string, allWeeks: boolean) => {
    setIsJobsLoading(true);
    try {
      // Active jobs
      let query = `/jobs?clientId=${clientId}&client_id=${clientId}`;
      if (!allWeeks) {
        query += `&weekId=${weekId}&week_id=${weekId}`;
      }
      const data = await jaApi.get<{ jobs: Job[] }>(query);
      setJobs(data.jobs || []);

      // Archived jobs
      let archQuery = `/jobs?clientId=${clientId}&client_id=${clientId}&is_archived=true`;
      if (!allWeeks) {
        archQuery += `&weekId=${weekId}&week_id=${weekId}`;
      }
      const archData = await jaApi.get<{ jobs: Job[] }>(archQuery);
      setArchivedJobs(archData.jobs || []);
    } catch { 
      setJobs([]); 
      setArchivedJobs([]); 
    } finally {
      setIsJobsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { 
    if (selectedClientId) loadJobs(selectedClientId, selectedWeek, showAllWeeks); 
  }, [selectedClientId, selectedWeek, showAllWeeks, loadJobs]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);
  const currentBundleId = useMemo(() => jobs.find(j => j.bundle_id)?.bundle_id || null, [jobs]);

  useEffect(() => { if (currentBundleId) setBundleIdInput(currentBundleId); }, [currentBundleId]);

  const filteredArchivedJobs = useMemo(() => {
    if (!archiveSearch) return archivedJobs;
    const q = archiveSearch.toLowerCase();
    return archivedJobs.filter(j => j.job_title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
  }, [archivedJobs, archiveSearch]);

  const updateJobStatus = async (id: string, status: JobStatus) => {
    try {
      await jaApi.patch(`/jobs/${id}`, { status });
      setJobs(prev => prev.map(j => {
        if (j.id === id) {
          const handled_by = (status === "assigned" || status === "batch_active" || status === "applied") ? "ja_team" : j.handled_by;
          return { ...j, status, handled_by };
        }
        return j;
      }));
    } catch (err) { console.error(err); }
  };

  const archiveJob = async () => {
    if (!jobToArchive) return;
    try {
      await jaApi.patch(`/jobs/${jobToArchive.id}`, { is_archived: true });
      setJobs(prev => prev.filter(j => j.id !== jobToArchive.id));
      setArchivedJobs(prev => [...prev, { ...jobToArchive, is_archived: true }]);
      setJobToArchive(null);
    } catch (err) { console.error(err); }
  };

  const restoreJob = async (id: string) => {
    try {
      await jaApi.patch(`/jobs/${id}`, { is_archived: false });
      const job = archivedJobs.find(j => j.id === id);
      if (job) {
        setArchivedJobs(prev => prev.filter(j => j.id !== id));
        setJobs(prev => [...prev, { ...job, is_archived: false }]);
      }
    } catch (err) { console.error(err); }
  };

  const saveBundle = async () => {
    if (!selectedClientId || !bundleIdInput) return;
    setIsSavingBundle(true);
    try {
      const activeIds = jobs.filter(j => j.status === "assigned" || j.status === "batch_active").map(j => j.id);
      await jaApi.patch(`/jobs/bundle`, { client_id: selectedClientId, week_id: selectedWeek, bundle_id: bundleIdInput, job_ids: activeIds });
      loadJobs(selectedClientId, selectedWeek, showAllWeeks);
    } finally { setIsSavingBundle(false); }
  };

  const bulkApply = async () => {
    if (!selectedClientId || processingJobs.length === 0) return;
    if (!confirm(`Are you sure you want to mark all ${processingJobs.length} roles as Applied?`)) return;
    
    setIsJobsLoading(true);
    try {
      await Promise.all(processingJobs.map(j => 
        jaApi.patch(`/jobs/${j.id}`, { status: "applied" })
      ));
      loadJobs(selectedClientId, selectedWeek, showAllWeeks);
    } catch (err) {
      console.error("Bulk apply failed", err);
    } finally {
      setIsJobsLoading(false);
    }
  };

  const pushAll = async () => {
    const qIds = jobs.filter(j => j.status === "queued").map(j => j.id);
    setJobs(prev => prev.map(j => qIds.includes(j.id) ? { ...j, status: "assigned" } : j));
    qIds.forEach(id => jaApi.patch(`/jobs/${id}`, { status: "assigned" }));
  };

  if (loading) return <div className="p-8 space-y-4"><SkeletonBox className="h-12 w-64 rounded-2xl" /><div className="grid grid-cols-3 gap-6"><SkeletonBox className="h-96 rounded-3xl" /><SkeletonBox className="h-96 rounded-3xl" /><SkeletonBox className="h-96 rounded-3xl" /></div></div>;

  const queuedJobs = jobs.filter(j => j.status === "queued");
  const processingJobs = jobs.filter(j => j.status === "assigned" || j.status === "batch_active");
  const completedJobs = jobs.filter(j => ["applied", "interviewing", "offer", "rejected"].includes(j.status));

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-2 md:p-4 select-none animate-in fade-in duration-700 relative overflow-hidden">
      
      {/* ─── Archive Vault Drawer ────────────────────────────── */}
      <div className={`fixed top-0 right-0 h-screen w-80 bg-zinc-950/95 backdrop-blur-2xl border-l border-zinc-800/60 z-[110] transition-transform duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col ${showArchiveDrawer ? "translate-x-0" : "translate-x-full"}`}>
         <div className="p-6 border-b border-zinc-800/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </div>
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Archive Vault</h3>
            </div>
            <button onClick={() => setShowArchiveDrawer(false)} className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-all">
               <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>
         <div className="p-4 border-b border-zinc-800/20 shrink-0">
            <div className="relative">
               <input type="text" placeholder="Search archive..." value={archiveSearch} onChange={e => setArchiveSearch(e.target.value)} className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-xl px-4 py-2 text-[10px] font-medium text-zinc-300 focus:outline-none focus:border-zinc-700 transition-all" />
               <div className="absolute right-3 top-2.5 text-zinc-600">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {filteredArchivedJobs.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
                  <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest">{archiveSearch ? "No matches found" : "Vault is empty"}</p>
               </div>
            )}
            {filteredArchivedJobs.map(j => <JobCard key={j.id} job={j} isArchived onRestore={restoreJob} />)}
         </div>
         <div className="p-6 bg-zinc-900/50 border-t border-zinc-800/40">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Select a role to restore it to the pipeline.</p>
         </div>
      </div>

      {/* ─── Archive Confirmation Modal ───────────────────────── */}
      {jobToArchive && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-[400px] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                 <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Disrupt Workflow?</h3>
              <p className="text-[12px] text-zinc-500 leading-relaxed mb-8">
                  Archiving <span className="text-zinc-100 font-bold">&quot;{jobToArchive.job_title}&quot;</span> will move it to the Vault. {jobToArchive.status !== 'queued' && "Since this role is already in progress, this action may disrupt current bundling and analytics."}
              </p>
              <div className="flex w-full gap-3">
                 <button onClick={() => setJobToArchive(null)} className="flex-1 h-12 rounded-2xl bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">Cancel</button>
                 <button onClick={archiveJob} className="flex-1 h-12 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">Archive Role</button>
              </div>
           </div>
        </div>
      )}

      {/* ─── Left Pane: Client Feed ────────────────────────────── */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/60 rounded-[2rem] overflow-hidden max-h-[300px] lg:max-h-none">
        <div className="p-5 border-b border-zinc-800/40 hidden lg:block">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">Pipeline Feed</h2>
          <div className="relative">
            <input type="text" placeholder="Search clients..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full bg-zinc-950/40 border border-zinc-800/50 rounded-xl px-4 py-2 text-[11px] font-medium text-zinc-300 focus:outline-none focus:border-zinc-700 transition-all" />
          </div>
        </div>
        
        {/* Mobile Client Scroller */}
        <div className="lg:hidden flex overflow-x-auto p-4 gap-3 custom-scrollbar snap-x">
          {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(client => {
            const isSelected = client.id === selectedClientId;
            return (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className={`flex-none snap-center flex items-center gap-3 px-4 py-2 rounded-xl transition-all border ${isSelected ? "bg-white text-black border-white shadow-lg shadow-white/5" : "bg-zinc-900/50 border-zinc-800 text-zinc-500"}`}>
                <div className="text-[11px] font-black whitespace-nowrap tracking-tight">{client.name}</div>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:block flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase())).map(client => {
            const isSelected = client.id === selectedClientId;
            return (
              <button key={client.id} onClick={() => setSelectedClientId(client.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group ${isSelected ? "bg-white/5 border border-white/10 shadow-2xl" : "hover:bg-zinc-800/30 border border-transparent"}`}>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-[10px] font-black ${isSelected ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"}`}>{getInitials(client.name)}</div>
                <div className="text-left"><p className={`text-[12px] font-bold tracking-tight ${isSelected ? "text-white" : "text-zinc-400"}`}>{client.name}</p><p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">15/wk Limit</p></div>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-zinc-800/40 hidden lg:block">
           <button onClick={() => setShowArchiveDrawer(true)} className="w-full h-12 flex items-center justify-center gap-3 rounded-2xl bg-zinc-950/50 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span className="text-[10px] font-black uppercase tracking-widest">View Archives</span>
           </button>
        </div>
      </div>

      {/* ─── Right Pane: Workflow Workspace ────────────────────── */}
      <div className="flex-1 flex flex-col bg-zinc-900/10 border border-zinc-800/30 rounded-[2.5rem] overflow-hidden">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 border-b border-zinc-800/30 bg-zinc-900/20 shrink-0">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center text-xs md:text-lg font-black text-white shadow-2xl">{getInitials(selectedClient.name)}</div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight leading-none mb-1 md:mb-2">{selectedClient.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-lg md:rounded-xl p-0.5 md:p-1">
                      <button onClick={() => setShowAllWeeks(true)} className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${showAllWeeks ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}>History</button>
                      <button onClick={() => setShowAllWeeks(false)} className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${!showAllWeeks ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}>Weekly</button>
                    </div>

                    {!showAllWeeks && (
                      <div className="flex items-center bg-zinc-950/50 border border-zinc-800 rounded-lg p-0.5 animate-in slide-in-from-left-2 duration-300">
                        <button 
                          onClick={() => {
                            const currentD = new Date(selectedWeek.replace("-W", "-T") + "-1");
                            currentD.setDate(currentD.getDate() - 7);
                            setSelectedWeek(toWeekId(currentD));
                          }}
                          className="p-1 hover:text-white text-zinc-600 transition-colors"
                        >
                          <svg className="w-2 h-2 md:w-2.5 md:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-[8px] md:text-[9px] font-black text-zinc-300 uppercase tracking-widest px-1 md:px-2">W{selectedWeek.split("-W")[1]}</span>
                        <button 
                          onClick={() => {
                            const currentD = new Date(selectedWeek.replace("-W", "-T") + "-1");
                            currentD.setDate(currentD.getDate() + 7);
                            setSelectedWeek(toWeekId(currentD));
                          }}
                          className="p-1 hover:text-white text-zinc-600 transition-colors"
                        >
                          <svg className="w-2 h-2 md:w-2.5 md:h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    )}

                    <div className="h-3 w-[1px] bg-zinc-800 hidden md:block" />
                    <span className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase tracking-widest">{isJobsLoading ? "..." : `${jobs.length} Roles`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <button className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700/50 shadow-lg">Add Job</button>
              </div>
            </div>

            {/* Mobile Tab Navigator */}
            <div className="lg:hidden flex border-b border-zinc-800/40 bg-zinc-950/20 px-2">
               <button onClick={() => setMobileTab("queue")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${mobileTab === "queue" ? "border-zinc-100 text-white" : "border-transparent text-zinc-600"}`}>Queue ({queuedJobs.length})</button>
               <button onClick={() => setMobileTab("process")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${mobileTab === "process" ? "border-violet-500 text-violet-400" : "border-transparent text-zinc-600"}`}>Process ({processingJobs.length})</button>
               <button onClick={() => setMobileTab("applied")} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${mobileTab === "applied" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-600"}`}>Applied ({completedJobs.length})</button>
            </div>

            {/* Workflow Grid */}
            <div className="flex-1 relative overflow-hidden min-h-0">
               {/* Loading Overlay */}
               {isJobsLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                     <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                           <div className="w-12 h-12 rounded-2xl border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                           <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-violet-500/10 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.4em] animate-pulse">Syncing Pipeline</p>
                     </div>
                  </div>
               )}

               <div className={`h-full grid grid-cols-1 lg:grid-cols-3 overflow-hidden bg-gradient-to-b from-transparent to-black/10 transition-all duration-500 ${isJobsLoading ? "opacity-30 scale-[0.99] blur-[1px]" : "opacity-100 scale-100 blur-0"}`}>


              
              {/* 1. QUEUE */}
              <div className={`flex flex-col p-4 md:p-6 space-y-4 border-r border-zinc-800/20 overflow-hidden min-h-0 relative ${mobileTab === 'queue' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex items-center justify-between px-2 shrink-0">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.5)]" /><h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em]">QUEUE</h3></div>
                  <button onClick={pushAll} className="text-[8px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-all">Bulk Push →</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-12 custom-scrollbar [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
                  {queuedJobs.map(j => <JobCard key={j.id} job={j} onStatusChange={updateJobStatus} onArchiveRequest={setJobToArchive} />)}
                  {queuedJobs.length === 0 && <div className="h-40 border-2 border-dashed border-zinc-900/50 rounded-3xl flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Queue is Clear</div>}
                </div>
                <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest opacity-40">
                  <span>QUEUE</span>
                  <span>{queuedJobs.length} roles</span>
                </div>
              </div>

              {/* 2. IN PROCESS */}
              <div className={`flex flex-col p-4 md:p-6 space-y-4 border-r border-zinc-800/20 bg-zinc-950/[0.05] overflow-hidden min-h-0 relative ${mobileTab === 'process' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex items-center justify-between px-2 shrink-0">
                  <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" /><h3 className="text-[10px] font-black text-violet-400 uppercase tracking-[0.25em]">IN PROCESS</h3></div>
                  {processingJobs.length > 0 && (
                    <button 
                      onClick={bulkApply}
                      className="text-[8px] font-black text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-all bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20"
                    >
                      Bulk Apply →
                    </button>
                  )}
                </div>
                
                {/* Master Bundle Preparation Card */}
                <div className={`flex flex-col flex-1 min-h-0 rounded-[2rem] transition-all duration-500 border ${processingJobs.length > 0 ? "bg-zinc-900/30 border-violet-500/20 shadow-2xl" : "bg-transparent border-dashed border-zinc-800/40"}`}>
                   <div className="p-5 border-b border-zinc-800/40 shrink-0">
                      <div className="flex items-center justify-between mb-3">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">BUNDLE PREPARATION</span>
                         <span className="text-[8px] font-black text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full">{processingJobs.length} Roles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={bundleIdInput} onChange={e => setBundleIdInput(e.target.value.toUpperCase())} placeholder="BUNDLE ID" className="flex-1 h-10 bg-zinc-950/40 border border-zinc-800 rounded-xl px-4 text-[12px] font-black text-violet-400 uppercase tracking-widest outline-none focus:border-violet-500/50 transition-all" />
                        <button onClick={saveBundle} disabled={isSavingBundle || !bundleIdInput} className="h-10 px-6 rounded-xl bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20">{isSavingBundle ? "..." : "CREATE BUNDLE"}</button>
                      </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2 pb-12 custom-scrollbar [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
                      {processingJobs.map(j => <JobCard key={j.id} job={j} onStatusChange={updateJobStatus} onArchiveRequest={setJobToArchive} isCompact />)}
                      {processingJobs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-30">
                           <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                           <p className="text-[9px] font-black uppercase tracking-widest">No roles in bundle</p>
                        </div>
                      )}
                   </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 px-8 flex justify-between items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest opacity-40">
                  <span>IN PROCESS</span>
                  <span>{processingJobs.length} in bundle</span>
                </div>
              </div>

              {/* 3. APPLIED */}
              <div className={`flex flex-col p-4 md:p-6 space-y-4 overflow-hidden min-h-0 relative ${mobileTab === 'applied' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex items-center gap-3 px-2 shrink-0"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.25em]">APPLIED</h3></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-12 custom-scrollbar [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
                  {completedJobs.map(j => <JobCard key={j.id} job={j} onStatusChange={updateJobStatus} onArchiveRequest={setJobToArchive} />)}
                  {completedJobs.length === 0 && <div className="h-40 border-2 border-dashed border-zinc-900/50 rounded-3xl flex items-center justify-center text-[10px] font-bold text-zinc-700 uppercase tracking-widest">Awaiting Results</div>}
                </div>
                <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest opacity-40">
                  <span>APPLIED</span>
                  <span>{completedJobs.length} sent</span>
                </div>
              </div>

            </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 animate-pulse">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <p className="text-xs font-black uppercase tracking-[0.3em]">Select a Client</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jaApi } from "../../../lib/jaApi";
import type { DashboardStats, Client } from "../../../types/ja-admin";
import { SkeletonBox } from "../../../components/Skeleton";
import { ActivityEvent } from "../../../types/ja-admin";

function CompactStat({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub: string }) {
  const accentColors: Record<string, string> = {
    violet: "text-violet-400 bg-violet-400/5 border-violet-400/10",
    sky: "text-sky-400 bg-sky-400/5 border-sky-400/10",
    amber: "text-amber-400 bg-amber-400/5 border-amber-400/10",
    emerald: "text-emerald-400 bg-emerald-400/5 border-emerald-400/10",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800/40 bg-zinc-900/20 group/stat hover:bg-zinc-900/40 transition-all duration-300">
      <div className={`w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center text-lg ${accentColors[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
           <span className="text-xl font-bold text-white tracking-tight">{value}</span>
           <span className="text-[9px] font-medium text-zinc-600 truncate">{sub}</span>
        </div>
      </div>
    </div>
  );
}

export default function JaAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, clientsRes, activityRes] = await Promise.allSettled([
          jaApi.get<DashboardStats>("/dashboard/stats"),
          jaApi.get<{ clients: Client[] }>("/clients"),
          jaApi.get<{ activity: ActivityEvent[] }>("/dashboard/activity?limit=8")
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value);
        if (clientsRes.status === "fulfilled") setClients((clientsRes.value.clients || []).slice(0, 8));
        if (activityRes.status === "fulfilled") setRecentActivities(activityRes.value.activity || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-full space-y-6 animate-in fade-in duration-500 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><SkeletonBox className="h-20 rounded-xl" /> <SkeletonBox className="h-20 rounded-xl" /> <SkeletonBox className="h-20 rounded-xl" /> <SkeletonBox className="h-20 rounded-xl" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><SkeletonBox className="h-[600px] lg:col-span-2 rounded-2xl" /><SkeletonBox className="h-[600px] rounded-2xl" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col space-y-6 animate-in fade-in duration-700 select-none">
      
      {/* Top Bar: Navigation & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
         <div className="space-y-1">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
               <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Command Center</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Operations Dashboard</h1>
         </div>
         
         <div className="flex items-center gap-4">
            <Link href="/ja-admin/search" className="px-5 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all">
               Global Search
            </Link>
            <div className="w-[1px] h-8 bg-zinc-800/50 hidden md:block" />
            <div className="text-right hidden md:block">
               <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Server Status</p>
               <p className="text-[11px] font-bold text-emerald-400">Synced & Active</p>
            </div>
         </div>
      </div>

      {/* Stats Grid - High Density */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <CompactStat label="Portfolio" value={stats?.totalClients ?? 0} icon="👥" color="violet" sub={`${stats?.activeClients ?? 0} Active`} />
         <CompactStat label="Volume" value={stats?.totalJobsThisWeek ?? 0} icon="📈" color="sky" sub="Jobs this week" />
         <CompactStat label="Attention" value={stats?.pendingBatch ?? 0} icon="⚡" color="amber" sub="Pending actions" />
         <CompactStat label="Network" value={stats?.activeClients ?? 0} icon="🛡️" color="emerald" sub="Portals online" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Performance Table & Mobile Cards */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
           <div className="bg-zinc-900/20 border border-zinc-800/40 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-zinc-800/40 flex items-center justify-between bg-zinc-900/10">
                 <div className="flex items-center gap-3">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Client Management</h2>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-500">Live</span>
                 </div>
                 <Link href="/ja-admin/clients" className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                   Registry Full View →
                 </Link>
              </div>
              
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="border-b border-zinc-800/40 bg-zinc-950/20">
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">Member</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">Identity</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">Portal State</th>
                          <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                       {clients.map((client) => (
                         <tr key={client.id} className="group/row hover:bg-zinc-800/20 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800/50 text-[13px] font-bold text-violet-400 group-hover/row:scale-110 transition-transform duration-300">
                                {client.name.charAt(0)}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="min-w-0">
                                 <p className="text-[13px] font-bold text-zinc-100 group-hover/row:text-white transition-colors">{client.name}</p>
                                 <p className="text-[11px] font-medium text-zinc-600 truncate">{client.email}</p>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] border-white/5
                                ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  client.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                  client.status === 'pending' ? 'bg-amber-400' : 'bg-zinc-600'}`} />
                                {client.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Link href={`/ja-admin/clients/${client.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                              </Link>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Mobile Card Feed */}
              <div className="md:hidden divide-y divide-zinc-800/30">
                 {clients.map((client) => (
                   <div key={client.id} className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-lg font-black text-violet-400">
                            {client.name.charAt(0)}
                         </div>
                         <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white truncate">{client.name}</h3>
                            <p className="text-[11px] text-zinc-500 truncate mb-1.5">{client.email}</p>
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border border-white/5
                               ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                               {client.status}
                            </span>
                         </div>
                      </div>
                      <Link href={`/ja-admin/clients/${client.id}`} className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 text-zinc-400">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </Link>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Operational Activity */}
        <div className="lg:col-span-4 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl overflow-hidden">
           <div className="px-6 py-5 border-b border-zinc-800/40 bg-zinc-900/10">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Activity Log</h2>
           </div>
           
           <div className="p-4 space-y-1 overflow-y-auto max-h-[600px] custom-scrollbar">
              {recentActivities.map((event, i) => (
                <div key={i} className="group/log relative flex gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-zinc-800/30 border border-transparent hover:border-zinc-800/50">
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center">
                     <div className={`h-2 w-2 rounded-full ring-4 ring-zinc-950/50
                       ${event.color === 'violet' ? 'bg-violet-500' : 
                         event.color === 'emerald' ? 'bg-emerald-500' : 'bg-sky-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[12px] font-bold text-zinc-200 truncate">{event.client}</p>
                        <span className="text-[9px] font-bold text-zinc-600 tabular-nums uppercase tracking-widest">{event.time}</span>
                     </div>
                     <p className="text-[11px] font-semibold text-zinc-500 leading-tight mb-1">{event.action}</p>
                     <p className="text-[10px] font-medium text-zinc-700 leading-relaxed italic truncate" title={event.detail}>{event.detail}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}

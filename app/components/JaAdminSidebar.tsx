"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearJaToken, getJaUser } from "../lib/jaAuth";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function JaAdminSidebar({ isOpen = false, onClose = () => { } }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getJaUser());
  }, []);

  const handleLogout = () => {
    clearJaToken();
    router.push("/ja-admin/login");
  };

  const navItems = [
    {
      href: "/ja-admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      href: "/ja-admin/assignments",
      label: "Client Pipeline",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      href: "/ja-admin/bundles",
      label: "Bundle Search",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 7.5v6m3-3h-6" />
        </svg>
      ),
    },
    ...(user?.role === "admin" ? [
      {
        href: "/ja-admin/search",
        label: "JA Search",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        ),
      },
      {
        href: "/ja-admin/clients",
        label: "Client Accounts",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        href: "/ja-admin/team",
        label: "Team Access",
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    ] : []),
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-72 flex-col border-r border-zinc-800/30 bg-zinc-950/50 backdrop-blur-3xl transition-all duration-500 lg:static lg:translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.4)] ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Identity Section - JA Internal Branding */}
        <div className="relative p-8 pt-12 mb-4 group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-500/[0.05] to-transparent pointer-events-none" />
          
          <div className="relative flex flex-col items-center gap-8">
            {/* Staff Logo with Violet Glow */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-zinc-900 border border-zinc-800/50 group-hover:scale-105 transition-all duration-700">
               <div className="absolute inset-0 bg-gradient-to-br from-violet-500/15 to-transparent" />
               <Image src="/logo.svg" alt="Logo" width={48} height={48} className="h-12 w-12 relative z-10 brightness-110" />
               <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-violet-500/30 blur-2xl rounded-full animate-pulse" />
            </div>
            
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-white tracking-tight leading-none">JA Internal Portal</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-400/90">The Job Helpers</p>
              </div>
              
              {/* Elegant Inline Identity Pill */}
              <div className="mt-6 px-5 py-2.5 rounded-full bg-zinc-900/60 border border-zinc-800/40 flex items-center gap-3 shadow-lg backdrop-blur-md group-hover:border-violet-500/30 transition-all duration-300">
                 <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] shrink-0" />
                 <div className="flex items-baseline gap-2">
                    <p className="text-[13px] font-semibold text-zinc-100 tracking-tight truncate max-w-[100px]" title={user?.name}>
                      {user?.name?.split(" ")[0] || "Staff"}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-400/60 border-l border-zinc-800/50 pl-2">
                      {user?.role || "JA"}
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Divider Line */}
        <div className="px-10 mb-4">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-3 custom-scrollbar">
          <p className="px-5 text-[9px] font-medium text-zinc-600 uppercase tracking-[0.4em] mb-4">Operations Hub</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-4 rounded-2xl px-6 py-4 text-[12px] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${isActive
                    ? "bg-zinc-900/60 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-xl"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/30"
                  }`}
              >
                {isActive && (
                  <div className="absolute left-[-2px] top-4 bottom-4 w-[3px] bg-violet-400 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                )}
                
                <span className={`transition-all duration-300 ${isActive ? "text-violet-400 scale-110" : "text-zinc-600 group-hover:text-zinc-400"
                  }`}>
                  {item.icon}
                </span>
                
                <span className="relative z-10">{item.label}</span>

                {isActive && (
                  <div className="absolute inset-0 bg-violet-500/[0.02] rounded-2xl pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="mt-auto px-6 py-8 border-t border-zinc-800/30">
          <div className="flex flex-col gap-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600 transition-all duration-300 hover:bg-red-500/5 hover:text-red-400 active:scale-95"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/40 group-hover:border-red-500/30 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

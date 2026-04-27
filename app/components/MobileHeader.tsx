"use client";

import React from "react";
import Image from "next/image";

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function MobileHeader({ onMenuClick, title = "Job Application Hub" }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/60 dark:border-zinc-800/80 bg-background/90 px-4 backdrop-blur-sm lg:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 transition hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 active:scale-95"
          aria-label="Open Menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.2)] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <Image src="/logo.svg" alt="Logo" width={28} height={28} className="h-full w-full object-cover" />
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{title}</span>
      </div>
    </div>
  );
}

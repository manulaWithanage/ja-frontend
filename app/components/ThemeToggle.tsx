"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full bg-slate-200 dark:bg-zinc-800 p-1 transition-all duration-500 shadow-inner border border-slate-300 dark:border-zinc-800 group"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute h-8 w-8 rounded-full bg-white dark:bg-zinc-700 shadow-md transition-all duration-500 flex items-center justify-center z-10 ${
          isDark ? "translate-x-10" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-emerald-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </div>
      <div className="flex w-full justify-between px-2 text-[8px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 transition-opacity">
        <span className={`${isDark ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ml-1`}>Dark</span>
        <span className={`${isDark ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 mr-1`}>Light</span>
      </div>
    </button>
  );
}

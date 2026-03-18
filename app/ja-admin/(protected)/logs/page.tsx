"use client";

export default function LogsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-3">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/50 text-2xl">
        🔍
      </div>
      <h1 className="text-xl font-bold text-zinc-100">Search Logs</h1>
      <p className="text-sm text-zinc-400 max-w-sm text-center">
        Search logs will be available once the AI Agent search feature is integrated.
      </p>
    </div>
  );
}

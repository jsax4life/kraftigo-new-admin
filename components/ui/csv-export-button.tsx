"use client";

import { useState } from "react";

type CsvExportButtonProps = {
  label?: string;
  onExport: () => Promise<void>;
  disabled?: boolean;
};

export function CsvExportButton({
  label = "Download CSV",
  onExport,
  disabled = false
}: CsvExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={async () => {
          setIsLoading(true);
          setError(null);
          try {
            await onExport();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Export failed");
          } finally {
            setIsLoading(false);
          }
        }}
        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 disabled:opacity-50"
      >
        {isLoading ? "Downloading…" : label}
      </button>
      {error ? (
        <span className="max-w-xs text-right text-[10px] text-rose-300">
          {error}
        </span>
      ) : null}
    </div>
  );
}

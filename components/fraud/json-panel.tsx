"use client";

type JsonPanelProps = {
  title: string;
  data: unknown;
  maxHeightClass?: string;
};

export function JsonPanel({
  title,
  data,
  maxHeightClass = "max-h-72"
}: JsonPanelProps) {
  if (data == null) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </h3>
        <p className="text-xs text-slate-500">No data</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      <pre
        className={`overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-[10px] leading-relaxed text-slate-300 ${maxHeightClass}`}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

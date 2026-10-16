type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
};

export function StatCard({ label, value, hint, href }: StatCardProps) {
  const inner = (
    <>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-slate-500">{hint}</p> : null}
    </>
  );

  const className =
    "rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700";

  if (href) {
    return (
      <a href={href} className={`block ${className}`}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

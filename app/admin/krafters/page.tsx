import { Suspense } from "react";
import KraftersPageContent from "./krafters-content";

function KraftersFallback() {
  return (
    <div className="space-y-4 pb-12 font-sans bg-white text-black">
      <h1 className="text-2xl font-garet font-bold">Krafter Management</h1>
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}

export default function KraftersPage() {
  return (
    <Suspense fallback={<KraftersFallback />}>
      <KraftersPageContent />
    </Suspense>
  );
}

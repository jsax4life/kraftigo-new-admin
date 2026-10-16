"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import type { AdminDispute } from "@/types/disputes-admin";

function statusBadge(status?: string | null) {
  if (!status) return <span className="text-slate-500">—</span>;
  const upper = status.toUpperCase();
  const tone =
    upper === "RESOLVED"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : upper === "RESOLVING"
        ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
        : "border-amber-500/40 bg-amber-500/10 text-amber-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${tone}`}
    >
      {status}
    </span>
  );
}

export const disputeColumns: ColumnDef<AdminDispute>[] = [
  {
    accessorKey: "id",
    header: "Dispute",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-slate-300">
        {row.original.id.slice(0, 8)}…
      </span>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusBadge(row.original.status)
  },
  {
    accessorKey: "bookingId",
    header: "Booking",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-slate-400">
        {row.original.bookingId?.slice(0, 8) ?? "—"}…
      </span>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Opened",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
        : "—"
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/admin/disputes/${row.original.id}`}
        className="text-emerald-400 hover:text-emerald-300"
      >
        Review
      </Link>
    )
  }
];

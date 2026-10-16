"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminBooking } from "@/types/admin-bookings";
import { entityLabel } from "@/lib/merge-profiles";

function statusBadge(status?: string | null) {
  if (!status) return <span className="text-slate-500">—</span>;
  return (
    <span className="inline-flex rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-200">
      {status}
    </span>
  );
}

function partyCell(booking: AdminBooking, kind: "customer" | "artisan") {
  const entity =
    kind === "customer"
      ? booking.customer
      : (booking.artisan ?? booking.krafter);
  return entityLabel(entity);
}

function categoryCell(booking: AdminBooking) {
  const cat = booking.category ?? booking.serviceCategory;
  if (!cat) return "—";
  if (typeof cat.name === "string") return cat.name;
  if (typeof cat.label === "string") return cat.label;
  return entityLabel(cat);
}

export const adminBookingColumns: ColumnDef<AdminBooking>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] text-slate-400">
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
    accessorKey: "jobTitle",
    header: "Job",
    cell: ({ row }) => row.original.jobTitle ?? "—"
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => partyCell(row.original, "customer")
  },
  {
    id: "artisan",
    header: "Krafter",
    cell: ({ row }) => partyCell(row.original, "artisan")
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => categoryCell(row.original)
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
        : "—"
  }
];

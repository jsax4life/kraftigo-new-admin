"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { KrafterLocationCell } from "@/components/krafters/krafter-location-cell";
import type { AdminUserWithProfile } from "@/types/admin-users";
import { profileDisplayName } from "@/lib/merge-profiles";

function statusBadge(status?: string) {
  if (!status) return <span className="text-slate-500">—</span>;
  const normalized = status.toUpperCase();
  const active =
    normalized === "ACTIVE"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : "border-slate-600 bg-slate-900 text-slate-300";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] ${active}`}
    >
      {status}
    </span>
  );
}

const baseColumns: ColumnDef<AdminUserWithProfile>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium text-slate-50">
        {profileDisplayName(row.original, row.original.profile)}
      </span>
    )
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—"
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => <KrafterLocationCell user={row.original} />
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => statusBadge(row.original.status)
  },
  {
    id: "roles",
    header: "Roles",
    cell: ({ row }) =>
      row.original.roles?.length ? row.original.roles.join(", ") : "—"
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short"
          })
        : "—"
  }
];

export const adminUserColumns: ColumnDef<AdminUserWithProfile>[] = baseColumns;

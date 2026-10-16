"use client";

import React, { useMemo, useState } from "react";
import { Info, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { usersAdminService } from "@/services/users-admin.service";
import { profileDisplayName } from "@/lib/merge-profiles";

const PAGE_SIZE = 20;

const highValueCustomers = [
  { id: 1, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
  { id: 2, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
  { id: 3, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const listParams = { page, limit: PAGE_SIZE };

  const { data, isLoading, isError, error, isFetching } = useAdminCustomers(listParams);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter((c) => {
      const name = profileDisplayName(c, c.profile).toLowerCase();
      const email = (c.email ?? "").toLowerCase();
      const country = (c.location?.country ?? c.nationality ?? "").toLowerCase();
      const id = c.id.toLowerCase();
      return name.includes(q) || email.includes(q) || country.includes(q) || id.includes(q);
    });
  }, [data?.items, search]);

  const totalCount = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Customer Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            Oversee and manage all platform participants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => usersAdminService.exportCustomersCsv()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Export <Image src="/export.svg" alt="Export" width={16} height={16} />
          </button>
          <button className="rounded-lg bg-[#FF6600] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors">
            Add new user
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Total Users
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : totalCount.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            New Signups
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">1,054</div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Active Users
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : filteredItems.length.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            AVG lifetime Value
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">£290.50</div>
        </div>
      </div>

      {/* High Value Customers */}
      <div>
        <h2 className="mb-4 text-xl font-garet font-[850] text-black">High Value Customers</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {highValueCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center gap-4 rounded-xl bg-[#0000FF33] p-5">
              <Image
                src="/images/login.jpg"
                alt={customer.name}
                height={100}
                width={100}
                className="rounded-full w-14 h-14 object-cover"
              />
              <div>
                <div className="text-[12px] font-semibold text-[#000000CC]">{customer.name}</div>
                <div className="text-[11px] font-medium text-[#000000CC] mb-1">{customer.location}</div>
                <div className="text-[12px] font-extrabold text-black">{customer.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <h2 className="text-xl font-garet font-[850] text-black">Customers</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => usersAdminService.exportCustomersCsv()}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-black hover:opacity-80"
            >
              Export <Image src="/export.svg" alt="Export" width={16} height={16} />
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-black">
              This Month <ChevronDown className="h-3 w-3" />
            </button>
            <div className="relative flex items-center ml-2">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone number, or user ID"
                className="w-80 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading customers…</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">
            Failed to load customers: {error?.message ?? "Unknown error"}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined / Active</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((customer, index) => {
                  const displayName = profileDisplayName(customer, customer.profile);
                  const country = customer.location?.country || customer.nationality || "—";
                  const joined = customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString()
                    : "—";

                  return (
                    <tr
                      key={customer.id}
                      className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                    >
                      <td className="px-6 py-4 font-medium text-black">{displayName}</td>
                      <td className="px-6 py-4 text-black">{country}</td>
                      <td className="px-6 py-4 text-black">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            customer.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {customer.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-black">{joined}</td>
                      <td className="px-6 py-4 text-black">{customer.email ?? "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="font-bold text-[12px] text-[#FF6600] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-[11px]">
          <div className="font-bold text-black">
            Showing {filteredItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = page === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={isFetching}
                  className={`flex h-6 w-8 sm:w-12 items-center justify-center rounded font-medium transition-colors ${
                    isActive
                      ? "bg-[#FF6600] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || isFetching}
              className="flex h-6 w-8 sm:w-12 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages || isFetching}
              className="flex h-6 w-8 sm:w-12 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Restricted Profiles CTA */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-garet font-[850] text-black">Restricted Profiles</h2>
          <div>
            <p className="text-[13px] text-slate-700 font-medium">View all restricted accounts</p>
            <div className="text-[14px] font-extrabold text-black">34 Accounts Flagged</div>
          </div>
        </div>
        <Link
          href="/admin/restricted"
          className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors"
        >
          View Restricted List
        </Link>
      </div>
    </div>
  );
}

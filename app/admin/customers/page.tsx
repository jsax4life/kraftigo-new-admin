"use client";

import React from "react";
import { Info, ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const highValueCustomers = [
  { id: 1, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
  { id: 2, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
  { id: 3, name: "Natalie Gates", location: "Lagos Nigeria", value: "$34,345.00" },
];

const customersData = [
  { id: 1, name: "Natelie Gates", country: "DE", bookings: 12, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 2, name: "Natelie Gates", country: "", bookings: 323, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 3, name: "Natelie Gates", country: "DE", bookings: 433, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 4, name: "Natelie Gates", country: "NED", bookings: 32, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 5, name: "Natelie Gates", country: "DE", bookings: 1, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 6, name: "Natelie Gates", country: "NED", bookings: 11, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 7, name: "Natelie Gates", country: "DE", bookings: 434, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 8, name: "Natelie Gates", country: "NED", bookings: 23, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 9, name: "Natelie Gates", country: "DE", bookings: 22, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
  { id: 10, name: "Natelie Gates", country: "NED", bookings: 44, lastActive: "18/09/2016, 21:30 PM", email: "Natalie@zoho.de" },
];

export default function CustomersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Customer Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">Oversee and manage all platform participants.</p>
        </div>
        <button className="rounded-lg bg-[#FF6600] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors">
          Add new user
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Total Users
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">433,082</div>
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
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">1,284</div>
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
              <Image src="/images/login.jpg" alt={customer.name} height={100} width={100} className="rounded-full w-14 h-14 object-cover" />
              <div>
                <div className="text-[12px] font-semibold text-[#000000CC]">{customer.name}</div>
                <div className="text-[11px] font-medium text[#000000CC] mb-1">{customer.location}</div>
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
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-black">
              Export <Image src="/export.svg" alt="Export" width={16} height={16} />
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-black">
              Import <Image src="/import.svg" alt="Export" width={16} height={16} />
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-black">
              This Month <ChevronDown className="h-3 w-3" />
            </button>
            <div className="relative flex items-center ml-2">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone number, or user ID"
                className="w-80 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400"
              />
              <div className="absolute right-2 text-slate-300 text-[10px] bg-white border border-slate-200 rounded px-1.5 leading-tight">
                /
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Country</th>
                <th className="px-6 py-4 font-medium text-center">Total Bookings</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {customersData.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={`${index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}`}
                >
                  <td className="px-6 py-4 font-medium text-black">{customer.name}</td>
                  <td className="px-6 py-4 text-black">{customer.country}</td>
                  <td className="px-6 py-4 text-black text-center">{customer.bookings}</td>
                  <td className="px-6 py-4 text-black">{customer.lastActive}</td>
                  <td className="px-6 py-4 text-black">{customer.email}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/customers/${customer.id}`} className="font-bold text-[12px] text-[#FF6600] hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-[11px]">
          <div className="font-bold text-black">Showing 1-10 of 300</div>
          <div className="flex items-center gap-1">
            <button className="flex h-6 w-16 items-center justify-center rounded bg-[#FF6600] font-medium text-white">1</button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">2</button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">3</button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">4</button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">5</button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Restricted Profiles CTA */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3 ">
          <h2 className="text-xl font-garet font-[850] text-black">Restricted Profiles</h2>
          <div>
            <p className=" text-[13px] text-slate-700 font-medium">View all restricted accounts</p>
            <div className=" text-[14px] font-extrabold text-black">34 Accounts Flagged</div>
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

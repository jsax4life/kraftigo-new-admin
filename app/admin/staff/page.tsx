"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, Upload } from "lucide-react";

const staffData = [
    { id: 1, name: "Natelie Gates", email: "Natalie@zoho.de", role: "SUPER ADMIN", status: "Active" },
    { id: 2, name: "Natelie Gates", email: "Natalie@zoho.de", role: "OPERATIONS", status: "Inactive" },
    { id: 3, name: "Natelie Gates", email: "Natalie@zoho.de", role: "SUPPORT", status: "Active" },
    { id: 4, name: "Natelie Gates", email: "Natalie@zoho.de", role: "ADMIN", status: "Active" },
    { id: 5, name: "Natelie Gates", email: "Natalie@zoho.de", role: "ACCOUNTING", status: "Active" },
    { id: 6, name: "Natelie Gates", email: "Natalie@zoho.de", role: "SUPER ADMIN", status: "Active" },
];

const getRoleStyle = (role: string) => {
    switch (role) {
        case "SUPER ADMIN":
            return "bg-[#FF6600] text-white";
        case "OPERATIONS":
            return "bg-[#FFD600] text-black";
        case "SUPPORT":
            return "bg-[#0000FF] text-white";
        case "ADMIN":
            return "bg-[#9747FF] text-white";
        case "ACCOUNTING":
            return "bg-[#16A34A] text-white";
        default:
            return "bg-slate-200 text-slate-800";
    }
};

export default function StaffPage() {
    return (
        <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-garet font-[850] text-black">Staff Management</h1>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                        Oversee and manage all platform participants.
                    </p>
                </div>
                <Link href="/admin/staff/new" className="rounded-lg bg-[#FF6600] px-6 py-3 text-sm font-bold text-white hover:bg-[#e65c00] transition-colors">
                    Add new Staff
                </Link>
            </div>

            {/* Table Section */}
            <div className="space-y-4">
                {/* Table Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h2 className="text-xl font-garet font-[850] text-black">Verification Queue</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="flex items-center gap-1.5 rounded-lg bg-[#F6F6F6] px-4 py-2 text-[11px] hover:bg-slate-100 transition-colors">
                            Export List <Image src='/export.svg' alt="Export" width={16} height={16} />
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-[#F6F6F6] px-4 py-2 text-[11px] hover:bg-slate-100 transition-colors">
                            This Month <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="flex items-center gap-1.5 rounded-lg bg-[#F6F6F6] px-4 py-2 text-[11px] hover:bg-slate-100 transition-colors">
                            Active Recently <ChevronDown className="h-3 w-3" />
                        </button>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-48 rounded-lg border border-[#0000001A] bg-white py-2 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000033]">
                                /
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#F6F6F6] text-[11px] text-[#00000066]">
                                <tr>
                                    <th className="px-6 py-5 font-medium">Staff Name</th>
                                    <th className="px-6 py-5 font-medium">Email</th>
                                    <th className="px-6 py-5 font-medium text-center">Role</th>
                                    <th className="px-6 py-5 font-medium">Status</th>
                                    <th className="px-6 py-5 font-medium text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#0000000D]">
                                {staffData.map((staff, index) => (
                                    <tr
                                        key={staff.id}
                                        className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-[#DFDFDF]' : 'bg-[#F6F6F6]'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                                                    <Image src="/images/login.jpg" alt={staff.name} layout="fill" objectFit="cover" />
                                                </div>
                                                <div className="font-bold text-black text-[13px]">{staff.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-black text-[13px]">{staff.email}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-[12px] uppercase tracking-wider ${getRoleStyle(staff.role)}`}>
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-black text-[13px]">{staff.status}</td>
                                        <td className="px-8 py-4 text-right">
                                            <Link
                                                href={`/admin/staff/${staff.id}`}
                                                className="text-[13px] font-extrabold text-[#FF6600] hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
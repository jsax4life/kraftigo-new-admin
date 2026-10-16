"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  Hourglass
} from "lucide-react";
import { ProfileLogsModal } from "@/components/ui/profile-logs-modal";
import { RestrictAccountModal } from "@/components/ui/restrict-account-modal";

// Mock Data
const restrictedUsers = [
  {
    id: 1,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Terms Violation",
    reasons: ["Off platform payment solicitation detected"],
    status: "Permanent Restriction",
    statusColor: "text-[#C80A0A]",
    action: "Lift Restriction",
  },
  {
    id: 2,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Suspicious Activity",
    reasons: [
      "Multiple failed login attempts from unknown IPS",
      "Multiple failed login attempts from unknown IPS",
      "Multiple failed login attempts from unknown IPS"
    ],
    status: "System Flagged",
    statusColor: "text-slate-900",
    action: "Restrict",
  },
  {
    id: 3,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Poor Ratings",
    reasons: ["3 Consecutive jobs rated under 2.0 stars"],
    status: "48H Ban",
    statusColor: "text-[#FF8D28]",
    action: "Restrict"
  },
  {
    id: 4,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Terms Violation",
    reasons: ["Off platform payment solicitation detected"],
    status: "48H Ban",
    statusColor: "text-[#FF8D28]",
    action: "Restrict"
  },
  {
    id: 5,
    name: "Natelie Gates",
    type: "Customer",
    reasonTitle: "Suspicious Activity",
    reasons: ["Multiple failed login attempts from unknown IPS"],
    status: "48H Ban",
    statusColor: "text-[#FF8D28]",
    action: "Lift Restriction"
  },
  {
    id: 6,
    name: "Natelie Gates",
    type: "Customer",
    reasonTitle: "Poor Ratings",
    reasons: ["3 Consecutive jobs rated under 2.0 stars"],
    status: "3 Month Ban",
    statusColor: "text-[#C80A0A]",
    action: "Lift Restriction"
  },
  {
    id: 7,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Terms Violation",
    reasons: ["Off platform payment solicitation detected"],
    status: "3 Month Ban",
    statusColor: "text-[#C80A0A]",
    action: "Lift Restriction"
  },
  {
    id: 8,
    name: "Natelie Gates",
    type: "Krafter",
    reasonTitle: "Suspicious Activity",
    reasons: ["Multiple failed login attempts from unknown IPS"],
    status: "3 Month Ban",
    statusColor: "text-[#C80A0A]",
    action: "Lift Restriction"
  },
  {
    id: 9,
    name: "Natelie Gates",
    type: "Customer",
    reasonTitle: "Poor Ratings",
    reasons: ["3 Consecutive jobs rated under 2.0 stars"],
    status: "System Flagged",
    statusColor: "text-[#FF8D28]",
    action: "Restrict"
  },
  {
    id: 10,
    name: "Natelie Gates",
    type: "Customer",
    reasonTitle: "Poor Ratings",
    reasons: ["3 Consecutive jobs rated under 2.0 stars"],
    status: "Admin Flagged",
    statusColor: "text-[#FF8D28]",
    action: "Restrict"
  }
];

export default function RestrictedListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("1 Month");



  const toggleDropdown = (id: number) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-[#0B0B0B66]">
          <span className="text-slate-500">User Management</span>
          <span>/</span>
          <span className="text-slate-800">Restricted List</span>
        </div>

        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline w-fit">
          <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
        </button>
      </div>

      <h1 className="text-2xl font-garet font-bold">Restricted Users</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">System Flagged</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">184</span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Currently Restricted</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">1,284</span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Resolved Today</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">29</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#F6F6F6] rounded-2xl border border-[#0000001A] overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-bold">Restricted List</h2>
          <div className="flex items-center gap-3 text-xs">
            <button className="flex items-center gap-1.5 hover:text-slate-900">
              Export List <Image src="/export.svg" alt="Download" width={14} height={14} />
            </button>
            <select className="bg-transparent border-none outline-none cursor-pointer">
              <option>All Time</option>
            </select>
            <select className="bg-transparent border-none outline-none cursor-pointer">
              <option>All</option>
            </select>
            <div className="flex items-center gap-2 bg-white border border-[#0000001A] rounded-lg px-3 py-1.5 ml-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none w-24 sm:w-32 text-slate-700 placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 font-medium">/</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse min-w-[800px]">
            <thead className="text-[#00000066] text-[12px]">
              <tr>
                <th className="font-medium px-6 py-4 w-[15%]">Krafter</th>
                <th className="font-medium px-6 py-4 w-[10%]">Type of User</th>
                <th className="font-medium px-6 py-4 w-[45%]">Flag Reason</th>
                <th className="font-medium px-6 py-4 w-[15%]">Status</th>
                <th className="font-medium px-6 py-4 w-[15%] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0000001A]">
              {restrictedUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className={`cursor-pointer hover:bg-slate-100 transition-colors ${index % 2 === 0 ? "bg-[#DFDFDF]" : "bg-[#F6F6F6]"}`}
                  onClick={() => {
                    setSelectedUser(user);
                    setIsProfileModalOpen(true);
                  }}
                >
                  <td className="px-6 py-4 font-medium text-slate-900 align-top pt-5">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 align-top pt-5">
                    <span className={`px-1 py-1 rounded-[6px] text-[10px] font-bold text-white ${user.type === "Krafter" ? "bg-[#0000FF]" : "bg-[#FF6600]"
                      }`}>
                      {user.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top pt-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-[#C80A0A]">{user.reasonTitle}</span>
                      <ul className="list-disc list-outside pl-4 text-slate-800 space-y-1 text-xs">
                        {user.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top pt-5">
                    <span className={user.statusColor}>{user.status}</span>
                  </td>
                  <td className="px-6 py-4 align-top pt-5 text-right relative">
                    <div className="flex items-center justify-end gap-5">
                      <Image src="/glass.svg" alt="glass" width={17} height={17} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user.action === "Restrict") toggleDropdown(user.id);
                        }}
                        className={`font-bold ${user.action === "Restrict" ? "text-[#FF1E1E]" : "text-slate-900"} hover:opacity-80 transition-opacity whitespace-nowrap text-xs`}
                      >
                        {user.action}
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    {activeDropdown === user.id && (
                      <div className="absolute right-6 top-10 w-44 bg-[#F8F8F8] border border-[#0000001A] shadow-lg rounded-xl z-10 flex flex-col overflow-hidden text-left">
                        <div className="px-4 py-3  font-bold text-xs">
                          Select Duration
                        </div>
                        {["24 Hours", "48 Hours", "1 week", "2 weeks", "1 Month", "3 Months", "Permanent Restriction"].map((dur, i) => (
                          <button 
                            key={i} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDuration(dur);
                              setSelectedUser(user);
                              setIsRestrictModalOpen(true);
                              setActiveDropdown(null);
                            }}
                            className="px-4 py-2.5 text-xs hover:bg-slate-100 transition-colors text-left border-b border-[#0000000D] last:border-0"
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#0000001A] px-6 py-3 text-[11px]">
          <div className="font-bold text-black text-[12px]">Showing 1-10 of 300</div>
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

      <ProfileLogsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
      />

      <RestrictAccountModal
        isOpen={isRestrictModalOpen}
        onClose={() => setIsRestrictModalOpen(false)}
        user={selectedUser}
        duration={selectedDuration}
        onConfirm={() => {
          console.log(`Restricted ${selectedUser?.name} for ${selectedDuration}`);
        }}
      />
    </div>
  );
}

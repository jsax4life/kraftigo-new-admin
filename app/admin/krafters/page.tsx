"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { KrafterVerificationModal } from "@/components/ui/krafter-verification-modal";
import { RejectApplicationModal } from "@/components/ui/reject-application-modal";

// Mock Data
const metrics = [
  { title: "Total Krafters", value: "4.82%", info: "Total krafters on platform" },
  { title: "Completion Rate", value: "94%", info: "Job completion rate" },
  { title: "Active Users", value: "1,284", info: "Currently active users" },
  { title: "Probation Alerts", value: "29", info: "Users on probation" },
];

const topKrafters = Array(3).fill({
  name: "Natalie Gates",
  role: "Plumber",
  krafts: 16,
  earnings: "$34,345.00",
  avatar: "/images/login.jpg"
});

const directoryData = [
  { id: 1, name: "Natalie Gates", bookings: 45, status: "Verified", email: "Natalie@zoho.de", krafts: 45 },
  { id: 2, name: "Natalie Gates", bookings: 23, status: "Restricted", email: "Natalie@zoho.de", krafts: 23 },
  { id: 3, name: "Natalie Gates", bookings: 12, status: "Verified", email: "Natalie@zoho.de", krafts: 12 },
  { id: 4, name: "Natalie Gates", bookings: 53, status: "Verified", email: "Natalie@zoho.de", krafts: 53 },
  { id: 5, name: "Natalie Gates", bookings: 3434, status: "Verified", email: "Natalie@zoho.de", krafts: 3434 },
  { id: 6, name: "Natalie Gates", bookings: 53, status: "Restricted", email: "Natalie@zoho.de", krafts: 53 },
  { id: 7, name: "Natalie Gates", bookings: 23, status: "Verified", email: "Natalie@zoho.de", krafts: 23 },
  { id: 8, name: "Natalie Gates", bookings: 3, status: "Restricted", email: "Natalie@zoho.de", krafts: 3 },
  { id: 9, name: "Natalie Gates", bookings: 0, status: "Verified", email: "Natalie@zoho.de", krafts: 0 },
  { id: 10, name: "Natalie Gates", bookings: 0, status: "Restricted", email: "Natalie@zoho.de", krafts: 0 },
];

const queueData = [
  { id: 1, name: "Natalie Gates", skills: "Plumbing, Electrical, Cooking, Gardening", avatar: "/images/login.jpg" },
  { id: 2, name: "Natalie Gates", skills: "Plumbing, Electrical, Cooking, Gardening", avatar: "/images/login.jpg" },
  { id: 3, name: "Natalie Gates", skills: "Plumbing, Electrical, Cooking, Gardening", avatar: "/images/login.jpg" },
  { id: 4, name: "Natalie Gates", skills: "Master Plumber", avatar: "/images/login.jpg" },
  { id: 5, name: "Natalie Gates", skills: "Master Plumber", avatar: "/images/login.jpg" },
];

export default function KraftersPage() {
  const [directorySearch, setDirectorySearch] = useState("");
  const [queueSearch, setQueueSearch] = useState("");
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedKrafter, setSelectedKrafter] = useState<any>(null);

  return (
    <div className="space-y-5 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-garet font-bold">Krafter Management</h1>
          <p className="text-sm mt-1">
            Oversee and manage all platform participants.
          </p>
        </div>
        <button className="bg-[#FF6600] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E65C00] transition-colors shadow-sm">
          Export Report
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-[#F6F6F6] rounded-2xl p-3.5 border border-[#0000001A] flex flex-col gap-2">
            <div className="flex items-center justify-between ">
              <span className="text-xs font-medium uppercase">{metric.title}</span>
              <Info className="h-4 w-4" />
            </div>
            <span className="text-lg font-mabry font-bold text-slate-900">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Top Krafters */}
      <div>
        <h2 className="text-xl font-garet font-bold text-slate-900 mb-4 mt-12">Top Krafters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {topKrafters.map((krafter, idx) => (
            <div key={idx} className="bg-[#FF66001A] rounded-2xl p-4 border border-orange-100 flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
                <Image src={krafter.avatar} alt={krafter.name} fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{krafter.name}</span>
                <span className="text-xs underline decoration-slate-400">{krafter.role}</span>
                <span className="text-[11px] mt-1">
                  {krafter.krafts} Krafts • {krafter.earnings}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Krafter Directory Table */}
      <div className="bg-[#F6F6F6] rounded-2xl border border-[#0000001A] overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-bold">Krafter Directory</h2>
          <div className="flex items-center gap-3 text-xs">
            <button className="flex items-center gap-1.5  hover:text-slate-900">
              Export List <Image src="/export.svg" alt="Download" width={14} height={14} />
            </button>
            <select className="bg-transparent border-none outline-none cursor-pointer">
              <option>This Month</option>
            </select>
            <select className="bg-transparent border-none outline-none cursor-pointer">
              <option>All</option>
            </select>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ml-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                className="bg-transparent outline-none w-24 sm:w-32 text-slate-700 placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 font-medium">/</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-[#00000066] border-b border-slate-200/60 text-xs">
              <tr>
                <th className="font-medium px-6 py-4">Krafter</th>
                <th className="font-medium px-6 py-4">Total Bookings</th>
                <th className="font-medium px-6 py-4">Status</th>
                <th className="font-medium px-6 py-4">Email</th>
                <th className="font-medium px-6 py-4">Krafts Registered</th>
                <th className="font-medium px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {directoryData.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    ${row.status === 'Restricted' ? 'bg-[#FF1E1E4D]' : 'bg-[#DFDFDF]'}
                  `}
                >
                  <td className="px-6 py-6 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="px-6 py-6 whitespace-nowrap">{row.bookings}</td>
                  <td className="px-6 py-6 whitespace-nowrap">{row.status}</td>
                  <td className="px-6 py-6 whitespace-nowrap">{row.email}</td>
                  <td className="px-6 py-6 whitespace-nowrap">{row.krafts}</td>
                  <td className="px-6 py-6 whitespace-nowrap text-right font-bold hover:underline cursor-pointer">
                    <Link href={`/admin/krafters/${row.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-[#F8F9FA] border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
          <span>Showing 1–10 of 300</span>
          <div className="flex items-center gap-1">
            <button className="h-6 w-16 rounded flex items-center justify-center bg-[#FF6600] text-white">1</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">2</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">3</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">4</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">5</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Krafter Verification Queue */}
      <div className="bg-[#F6F6F6] rounded-2xl border border-[#0000001A] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <h2 className="text-lg font-bold font-garet text-slate-900">Krafter Verification Queue</h2>
          <div className="flex items-center gap-3 text-xs">
            <button className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium">
              Export List
              <Image src="/export.svg" alt="Download" width={14} height={14} />
            </button>
            <select className="bg-transparent border-none text-slate-600 font-medium outline-none cursor-pointer">
              <option>This Month</option>
            </select>
            <select className="bg-transparent border-none text-slate-600 font-medium outline-none cursor-pointer">
              <option>All</option>
            </select>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 ml-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="bg-transparent outline-none w-24 sm:w-32 text-slate-700 placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 font-medium">/</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="px-6 py-3 text-xs font-medium text-[#00000066]">
            Name
          </div>
          <div className="divide-y divide-slate-100">
            {queueData.map((item) => (
              <div key={item.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    <span className="text-xs mt-0.5">{item.skills}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-8 w-8 rounded-lg bg-[#FF6600] flex items-center justify-center text-white hover:bg-[#E65C00] transition-colors shadow-sm">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </button>
                  <button 
                    className="h-8 w-8 rounded-lg bg-[#0000FF] flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => {
                      setSelectedKrafter(item);
                      setIsVerificationModalOpen(true);
                    }}
                  >
                    <Image src="/file.svg" alt="Download" width={16} height={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
          <span>Showing 1–10 of 300</span>
          <div className="flex items-center gap-1">
            <button className="h-6 w-16 rounded flex items-center justify-center bg-[#FF6600] text-white">1</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">2</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">3</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">4</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">5</button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="h-6 w-16 rounded flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Restricted Profiles */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col sm:flex-row items-end justify-between gap-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Restricted Profiles</h2>
          <div>
            <p className="text-sm">View all restricted accounts</p>
            <p className="text-sm font-bold">34 Accounts Flagged</p>
          </div>
        </div>
        <Link href="/admin/restricted" className="rounded-lg bg-[#FF6600] px-4 py-3 text-sm font-medium text-white hover:bg-[#E65C00] transition-colors shadow-sm self-start sm:self-end text-center">
          View Restricted List
        </Link>
      </div>

      <KrafterVerificationModal 
        isOpen={isVerificationModalOpen} 
        onClose={() => setIsVerificationModalOpen(false)} 
        onReject={() => {
          setIsVerificationModalOpen(false);
          setIsRejectModalOpen(true);
        }}
        krafter={selectedKrafter} 
      />

      <RejectApplicationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        krafter={selectedKrafter}
        onConfirm={(reason, comments) => {
          console.log("Rejected with reason:", reason, "Comments:", comments);
        }}
      />
    </div>
  );
}

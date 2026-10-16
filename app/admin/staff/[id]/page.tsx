"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, ChevronDown, User } from "lucide-react";
import { ActionModal } from "@/components/ui/action-modal";

export default function StaffDetailsPage({ params }: { params: { id: string } }) {
  const [activeModal, setActiveModal] = React.useState<'reset' | 'delete' | null>(null);
  const [isEmptyState, setIsEmptyState] = React.useState(false);

  const activityLogs = [
    {
      id: 1,
      type: "Approved Krafter",
      details: "Approved Krafter #KFT837386 from pending queue",
      date: "Oct 24, 2023 • 14:22",
    },
    {
      id: 2,
      type: "Changed username",
      details: "Changed from 'sarah_m' to 'sarah.mitchell'.",
      date: "Oct 21, 2023 • 09:15",
    },
    {
      id: 3,
      type: "Changed username",
      details: "Changed from 'serah_m' to 'sarah.mitchell'.",
      date: "Oct 21, 2023 • 09:15",
    },
    {
      id: 4,
      type: "Cancelled booking",
      details: "Booking #ORD-1224 cancelled. Reason: Schedule conflict. Full refund issued.",
      date: "Oct 18, 2023 • 18:45",
    },
    {
      id: 5,
      type: "Reset User Password",
      details: "Reset User #KFT837386 password",
      date: "Oct 15, 2023 • 11:30",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 font-sans bg-white text-black mt-4">
      {/* Breadcrumb & Back */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#0B0B0B66]">
          <Link href="/admin/staff" className="hover:text-slate-800">Staff</Link>
          <span>/</span>
          <span className="text-black">Staff Details</span>
        </div>
        <div className="flex items-center justify-between">
          <Link href="/admin/staff" className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline">
            <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
          </Link>
          <button
            onClick={() => setIsEmptyState(!isEmptyState)}
            className="rounded-lg border border-[#0000001A] px-3 py-1 text-xs font-semibold hover:bg-slate-50"
          >
            {isEmptyState ? "Show Populated State" : "Show Empty State"}
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 py-4 relative">
        <div className="flex items-center gap-5">
          <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#F6F6F6]">
            <User className="h-10 w-10 text-[#00000066]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-garet font-[850] text-black">Natalie Gates</h1>
              <Image src="/edit.svg" alt="Edit" width={16} height={16} className="cursor-pointer hover:opacity-80" />
            </div>
            <div className="mt-1 text-[13px] font-medium text-[#00000099]">Staff ID</div>
            <div className="text-[13px] font-bold text-black mt-0.5">KRFTST37367</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModal('reset')}
            className={`rounded-xl px-5 py-3 text-xs font-bold text-white transition-colors ${isEmptyState ? 'bg-[#FF6600] hover:bg-[#e65c00]' : 'bg-[#0000FF] hover:bg-blue-700'}`}
          >
            {isEmptyState ? 'Activate User' : 'Reset Password'}
          </button>
          <button
            onClick={() => setActiveModal('delete')}
            className="rounded-xl bg-[#FF3B3B1A] px-5 py-3 text-xs font-bold text-[#FF3B3B] hover:bg-[#FFD6D6] transition-colors"
          >
            Delete Staff
          </button>
        </div>

        {/* Modals */}
        <ActionModal
          isOpen={activeModal === 'reset'}
          onClose={() => setActiveModal(null)}
          title="Initiate Send Password reset?"
          description="This will delete existing password and prompt them to create a new one"
          primaryButtonText="Reset Password"
          primaryButtonAction={() => setActiveModal(null)}
        />

        <ActionModal
          isOpen={activeModal === 'delete'}
          onClose={() => setActiveModal(null)}
          title="Delete Staff?"
          titleClasses="text-[#FF3B3B]"
          description="This will delete all history and data connected to this staff account. This action cannot be undone"
          primaryButtonText="Delete Staff"
          primaryButtonAction={() => setActiveModal(null)}
          primaryButtonClasses="bg-[#FF3B3B1A] text-[#FF3B3B] hover:bg-[#FFD6D6]"
          countdownSeconds={5}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">Email Address</div>
          <div className="text-[13px] font-bold text-black">Nataliegateslongemail@Kraftigo.de</div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">Role</div>
          <div className="text-[13px] font-bold text-black">Support</div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">Last Active</div>
          <div className="text-[13px] font-bold text-black">{isEmptyState ? 'Inactive' : '2026-04-23, 21:36:41'}</div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-[850] text-black">Activity Logs</h2>
          <div className={`${isEmptyState ? 'opacity-20 flex items-center gap-3' : 'flex items-center gap-3'}`}>
            <button className="flex items-center gap-1.5 rounded-lg bg-[#FF66001A] px-3 py-2 text-[11px] font-semibold text-black hover:bg-[#FFE5D6] transition-colors">
              Export Logs <Image src="/export.svg" alt="Export" width={16} height={16} />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-[#FF66001A] px-3 py-2 text-[11px] font-semibold text-black hover:bg-[#FFE5D6] transition-colors">
              All time <ChevronDown className="h-3 w-3 text-[#00000066]" />
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-[#FF66001A] px-3 py-2 text-[11px] font-semibold text-black hover:bg-[#FFE5D6] transition-colors">
              Activity Type <ChevronDown className="h-3 w-3 text-[#00000066]" />
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-44 rounded-lg bg-[#FF66001A] py-2 pl-8 pr-6 text-[11px] outline-none placeholder:text-[#00000066] text-black"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000066]">
                /
              </div>
            </div>
          </div>
        </div>

        {isEmptyState ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Image src="/empty.svg" alt="Empty logs" width={141} height={192} />
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#0000000D] py-3 last:border-0 hover:bg-[#00000005] rounded-lg transition-colors -mx-3 px-3">
                  <div>
                    <div className="text-[14px] font-bold text-black mb-1">{log.type}</div>
                    <div className="text-[13px] font-medium text-[#45464D]">{log.details}</div>
                  </div>
                  <div className="text-[11px] font-medium text-[#00000080] whitespace-nowrap mt-2 sm:mt-0 pt-0.5">
                    {log.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <div className="font-bold text-black text-[12px]">Showing 1-10 of 300</div>
              <div className="flex items-center gap-1">
                <button className="flex h-6 w-16 items-center justify-center rounded bg-[#FF6600] font-medium text-white shadow-sm hover:opacity-90">1</button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] font-medium text-slate-600 hover:bg-slate-50">2</button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] font-medium text-slate-600 hover:bg-slate-50">3</button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] font-medium text-slate-600 hover:bg-slate-50">4</button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] font-medium text-slate-600 hover:bg-slate-50">5</button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-[#0000001A] text-slate-600 hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

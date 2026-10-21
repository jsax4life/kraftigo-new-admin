"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  Info,
  Search,
  MapPin,
  Banknote,
  AlertOctagon,
  XCircle,
  CreditCard

} from "lucide-react";
import { ActionModal } from "@/components/ui/action-modal";

export default function KrafterDetailsPage() {
  const [activitySearch, setActivitySearch] = useState("");
  const [activeModal, setActiveModal] = useState<'reset' | 'delete' | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [accountStatus, setAccountStatus] = useState<'active' | 'flagged' | 'restricted'>('flagged'); // Set to flagged for demo



  const activityLogs = [
    {
      id: 1,
      type: "Booked House Cleaner",
      details: "Transaction ID: #KRT-9981-XC. Processed via Visa ending in 4242.",
      date: "Oct 24, 2023 • 14:22",
      icon: <Image src="/book.svg" alt="Book" width={35} height={35} />
    },
    {
      id: 2,
      type: "Changed username",
      details: "Changed from 'sarah_m' to 'sarah.mitchell'. Action performed by User.",
      date: "Oct 21, 2023 • 09:15",
      icon: <Image src="/change.svg" alt="Change" width={35} height={35} />
    },
    {
      id: 3,
      type: "Admin Changed username",
      details: "Changed from 'serah_m' to 'sarah.mitchell'. Action performed by Adams Hassan.",
      date: "Oct 21, 2023 • 09:15",
      icon: <Image src="/sheild.svg" alt="Shield" width={35} height={35} />
    },
    {
      id: 4,
      type: "Cancelled booking",
      details: "Booking #ORD-1224 cancelled. Reason: Schedule conflict. Full refund issued.",
      date: "Oct 18, 2023 • 18:45",
      icon: <Image src="/cancel.svg" alt="Cancel" width={35} height={35} />
    },
    {
      id: 5,
      type: "Password changed",
      details: "Security update triggered via email verification. Session logout enforced.",
      date: "Oct 15, 2023 • 11:30",
      icon: <Image src="/pass.svg" alt="Pass" width={35} height={35} />
    }
  ];


  return (
    <div className="space-y-6 pb-10 max-w-5xl">
      {/* Breadcrumbs & Back */}
      <div className="flex flex-col gap-4">
        <div className="text-xs text-[#0B0B0B66] flex items-center gap-2">
          <span>Krafters</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Krafter details</span>
        </div>
        <Link href="/admin/krafters" className="inline-flex items-center  gap-1 text-sm font-bold text-[#FF6600] hover:underline">
          <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0">
            <Image src="/images/login.jpg" alt="Natalie Gates" fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-garet font-bold text-slate-900">Natalie Gates</h1>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map(i => <Star key={i} className="h-4 w-4 fill-[#FF6600] text-[#FF6600]" />)}
                {[1, 2].map(i => <Star key={`e${i}`} className="h-4 w-4 fill-slate-200 text-slate-200" />)}
              </div>
            </div>
            <div>
              <div className="mt-1 flex items-center gap-3 text-[15px] text-[#00000080]">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Frankfurt, Germany.</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex w-fit rounded-full bg-[#FFF0E5] px-2 py-1 text-[11px] text-[#FF6600] mt-1">Verified</span>
                <span className="inline-flex items-center gap-1 w-fit rounded-full bg-[#0000FF1A] px-2 py-1 text-[11px] text-[#0000FF] mt-1">
                  <span>Krafter LVL 1</span>
                  <Image src="/badge.svg" alt="Badge" width={15} height={15} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-4">
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <div className="flex flex-col md:items-end gap-0.5">
              <span className="text-slate-500">Account Creation Date</span>
              <span>2026-04-20, 21:30:41</span>
            </div>
            <div className="flex flex-col md:items-end gap-0.5">
              <span className="text-slate-500">Last Active</span>
              <span>2026-04-20, 21:30:41</span>
            </div>
          </div>
          <div className="flex gap-2 relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'admin' ? null : 'admin')}
              className="flex items-center gap-1 rounded-lg bg-[#0000FF] px-4 py-3 text-xs font-bold text-white hover:bg-[#0000FF33] hover:text-[#0000FF] transition-colors"
            >
              Admin Actions <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'restrict' ? null : 'restrict')}
              className="rounded-lg bg-[#C80A0A1A] px-4 py-3 text-xs font-bold text-[#C80A0A] hover:bg-[#FFD6D6] transition-colors"
            >
              {accountStatus === 'restricted' ? 'Unrestrict Account' : 'Restrict Account'}
            </button>

            {/* Modals */}
            <ActionModal
              isOpen={activeModal === 'reset'}
              onClose={() => setActiveModal(null)}
              title="Initiate Send Password reset?"
              description="This will delete existing password and prompt them to create a new one"
              primaryButtonText="Reset Password"
              primaryButtonAction={() => setActiveModal(null)}
              primaryButtonClasses="bg-[#FF66001A] text-[#FF6600] hover:bg-[#FFE5D6]"
            />

            <ActionModal
              isOpen={activeModal === 'delete'}
              onClose={() => setActiveModal(null)}
              title="Delete Account?"
              titleClasses="text-[#FF3B3B]"
              description="This will delete all history and data connected to this account. This action cannot be undone"
              primaryButtonText="Delete Account"
              primaryButtonAction={() => setActiveModal(null)}
              primaryButtonClasses="bg-[#FF3B3B1A] text-[#FF3B3B] hover:bg-[#FFD6D6]"
              countdownSeconds={5}
            />

            {/* Admin Actions Dropdown */}
            {activeDropdown === 'admin' && (
              <div className="absolute right-[140px] top-12 w-44 rounded-lg border border-[#0000001A] bg-[#F6F6F6] shadow-lg overflow-hidden z-10 ">
                <div className="flex flex-col text-[13px] font-medium text-[#000000CC] ">
                  <button className="px-4 py-2 text-center border-b border-[#0000001A] hover:bg-slate-50">Move Account Data</button>
                  <button
                    onClick={() => {
                      setActiveModal('reset');
                      setActiveDropdown(null);
                    }}
                    className="px-4 py-2 text-center border-b border-[#0000001A] hover:bg-slate-50"
                  >
                    Send Password reset
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal('delete');
                      setActiveDropdown(null);
                    }}
                    className="px-4 py-2 text-center hover:bg-slate-50 border-t border-slate-100 text-red-600"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Restrict Account Dropdown */}
            {activeDropdown === 'restrict' && (
              <div className="absolute right-0 top-12 w-48 rounded-lg border border-[#0000001A] bg-[#F6F6F6] shadow-lg z-10">
                <div className="px-4 pb-4 pt-2 font-extrabold text-[13px] text-black">Select Duration</div>
                <div className="flex flex-col text-[13px] font-medium text-[#000000CC]">
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">Flag Account</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">24 Hours</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">48 Hours</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">1 week</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">2 weeks</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">1 Month</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">3 Months</button>
                  <button className="px-4 py-2 text-left hover:bg-slate-50 border-t border-[#0000001A]">Permanent Restriction</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {accountStatus === 'flagged' && (
        <div className="flex items-center justify-between rounded-lg border border-[#FFAE00] bg-[#FFAE001A] p-4">
          <div className="flex items-center gap-1">
            <Image src="/flag.svg" alt="Flag" width={20} height={20} />
            <span className="text-sm text-[#FFAE00] mt-0.5">
              This account has been flagged for receiving 3 consecutive under 2.0 stars
            </span>
          </div>
          <button className="text-sm font-bold text-[#FFAE00] hover:underline">
            view
          </button>
        </div>
      )}

      {accountStatus === 'restricted' && (
        <div className="flex items-center justify-between rounded-lg border border-[#C80A0A] bg-[#C80A0A1A] p-4">
          <div className="flex items-center gap-1">
            <Image src="/x.svg" alt="Flag" width={20} height={20} />
            <span className="text-sm text-[#C80A0A] mt-0.5">
              This account has been restricted for 2 weeks for <span className="font-bold">Terms Violation</span>
            </span>
          </div>
          <button className="text-sm font-bold text-[#C80A0A] hover:underline">
            view
          </button>
        </div>
      )}

      {/* Account Information */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
        <h2 className="text-lg font-garet font-bold text-slate-900">Account Information</h2>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="rounded-xl p-4 border border-[#0000001A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase">Total Bookings</span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl font-mabry font-bold text-slate-900">142</span>
              <span className="text-xs font-bold text-slate-900 underline cursor-pointer">View Bookings</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="rounded-xl p-4 border border-[#0000001A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase">Total Spend</span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl font-mabry font-bold text-slate-900">£7,572,090</span>
              <span className="text-xs font-bold text-slate-900 underline cursor-pointer">View History</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="rounded-xl p-4 border border-[#0000001A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase">Total Earnings</span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl font-mabry font-bold text-slate-900">£7,572,090</span>
              <span className="text-xs font-bold text-slate-900 underline cursor-pointer">View History</span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="rounded-xl p-4 border border-[#0000001A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase">Krafter Bookings</span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl font-mabry font-bold text-slate-900">142</span>
              <span className="text-xs font-bold text-slate-900 underline cursor-pointer">View Bookings</span>
            </div>
          </div>
          {/* Card 5 */}
          <div className="rounded-xl p-4 border border-[#0000001A] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase">Completion Rate</span>
              <Info className="h-4 w-4" />
            </div>
            <div className="flex items-end justify-between mt-2">
              <span className="text-xl font-mabry font-bold text-slate-900">45%</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mt-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              Email Address <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-900">sarah.mitchell@executive.io</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6600] text-white uppercase tracking-wide">
                Verified
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              Phone Number <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <span className="text-sm text-slate-900">+44 7927 443</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              Verified Address <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <span className="text-sm text-slate-900">455 E Illinois St, Chicago, IL 60611</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              User ID
            </div>
            <span className="text-sm text-slate-900">EF10AD00D-019-4F4A</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <hr className="bg-[#EEDDEEDD] h-[1px] mb-4" />
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
            User Bio <Image src="/edit.svg" alt="Edit" width={13} height={13} />
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            I have six years of experience cleaning houses. My priority is to bring a good service and leave everything very
            clean✨. I am a reliable person, I will ensure that your apartment is left very clean and I am always open to
            suggestions🙏
          </p>
        </div>


        <div className="flex justify-end mt-2">
          <button className="bg-[#A0A0A0] text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-slate-500 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Work & Eligibility */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
        <h2 className="text-lg font-garet font-bold text-slate-900">Work & Eligibility</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              Occupation <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <span className="text-sm text-slate-900">Student</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              Languages Spoken <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">English</span>
              <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">Spanish</span>
              <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">French</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
              What makes you unique? <Image src="/edit.svg" alt="Edit" width={13} height={13} />
            </div>
            <p className="text-sm ">
              Blah Blah about my physique and a very long text that spans the three pages.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button className="bg-[#A0A0A0] text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-slate-500 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Skills and Pricing */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-4">
        <h2 className="text-lg font-garet font-bold text-slate-900">Skills and Pricing</h2>

        <div className="flex flex-col gap-3">
          {[
            { skill: "Yard work", rate: "24$ Per Hour", },
            { skill: "Yard work", rate: "24$ Flat Rate" },
            { skill: "Yard work", rate: "24$ Flat Rate" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 w-full">
              <div className="bg-[#FF66001A] rounded-xl px-5 py-3 flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FF6600]"></div>
                  <span className="text-sm  text-slate-900">{item.skill}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">{item.rate}</span>
                </div>
              </div>
              <button className="h-11 w-11 rounded-lg  bg-[#FF66001A] flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 transition-colors">
                <Image src="/more.svg" alt="More" width={18} height={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-2">
          <button className="bg-[#A0A0A0] text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-slate-500 transition-colors">
            Save
          </button>
        </div>
      </div>

      {/* Proof of work */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-4">
        <h2 className="text-lg font-garet font-bold text-slate-900">Proof of work</h2>
        <div className="grid grid-cols-2 md:grid-cols- lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200">
                {/* using the login image as placeholder for proof of work */}
                <Image src="/images/login.jpg" alt="Proof of work" fill className="object-cover" />
              </div>
              <span className="text-xs">IMG_00{idx}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-4">
        <h2 className="text-lg font-garet font-bold text-slate-900">Uploaded Documents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            "Bank statement",
            "tax clearance/certificate",
            "tax clearance/certificate",
            "Company logo"
          ].map((title, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 group cursor-pointer">
                <Image src="/images/login.jpg" alt={title} fill className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute bottom-3 right-3 h-8 w-8 rounded bg-red-600 flex items-center justify-center text-white shadow-sm">
                  <span className="text-[10px] font-bold">PDF</span>
                </div>
                <span className="absolute bottom-3 left-3 text-white font-bold text-sm z-10">{title}</span>
              </div>
              <span className="text-[14px]  truncate px-1">{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-garet font-bold text-slate-900">Payment Methods</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Visa **** 4242</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-medium">Default</span>
            </div>
            <div className="flex items-center gap-3">
              <Banknote className="h-5 w-5 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">Deutsche Bank AG **** 9901</span>
            </div>
          </div>
        </div>
        <button className="bg-[#A0A0A0] text-white px-4 py-3 rounded-lg text-sm font-bold hover:bg-slate-500 transition-colors self-end">
          View payment history
        </button>
      </div>

      {/* Activity Logs */}
      <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 ">
          <h2 className="text-xl font-garet font-[850] text-black">Activity Logs</h2>
          <div className={`${isEmptyState ? 'opacity-20 flex items-center gap-3' : 'flex items-center gap-3'}`}>
            <button className="flex items-center gap-1.5 rounded bg-[#FF66001A] px-3 py-1.5 text-[11px] font-semibold text-black">
              Export Logs <Image src="/export.svg" alt="Export" width={16} height={16} />
            </button>
            <button className="flex items-center gap-1.5 rounded bg-[#FF66001A] px-3 py-1.5 text-[11px] font-semibold text-black">
              All time <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1.5 rounded bg-[#FF66001A] px-3 py-1.5 text-[11px] font-semibold text-black">
              Activity Type <ChevronDown className="h-3 w-3" />
            </button>
            <div className="relative flex items-center ml-2">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#00000033]" />
              <input
                type="text"
                placeholder="Search"
                className="w-48 rounded bg-[#FF66001A] py-1.5 pl-8 pr-2 text-[11px] outline-none placeholder:text-[#00000033] text-[#00000066]"
              />
            </div>
          </div>
        </div>

        {activityLogs.length > 0 ? (
          <>
            <div className="">
              {activityLogs.map((log, index) => (
                <div key={log.id} className="flex gap-3 px-6 py-2.5">
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="z-10">{log.icon}</div>
                    {index !== activityLogs.length - 1 && (
                      <div className="absolute top-[35px] bottom-[-24px] w-[1px] bg-[#E6E8EA] z-0" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="font-bold text-black text-[13px]">{log.type}</div>
                    <div className="mt-1 text-[12px] ">{log.details}</div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-500 whitespace-nowrap mt-1">
                    {log.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#0000001A] px-6 py-3 text-[11px]">
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Image src="/empty.svg" alt="Empty logs" width={141} height={192} />
          </div>
        )}
      </div>


    </div >
  );
}

"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  Info,
  MapPin,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ActionModal } from "@/components/ui/action-modal";
import { BookingHistoryModal } from "@/components/ui/booking-history-modal";

const initialActivityLogs = [
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

const initialPaymentMethods = [
  { name: "Visa •••• 4242", isDefault: true },
  { name: "Deutsche Bank AG •••• 9901", isDefault: false }
];

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [isEmptyState, setIsEmptyState] = React.useState(false);
  const [activeModal, setActiveModal] = React.useState<'reset' | 'delete' | null>(null);
  const [accountStatus, setAccountStatus] = React.useState<'active' | 'flagged' | 'restricted'>('flagged');
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  const activityLogs = isEmptyState ? [] : initialActivityLogs;
  const paymentMethods = isEmptyState ? [] : initialPaymentMethods;
  const totalBookings = isEmptyState ? 0 : 142;
  const totalSpend = isEmptyState ? '0' : '£7,572,090';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 font-sans bg-white text-black">

      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0B0B0B66] mb-4">
            <Link href="/admin/customers" className="hover:text-slate-800 transition-colors">Customers</Link>
            <span>/</span>
            <span className="text-slate-800">Customer details</span>
          </div>
          <Link href="/admin/customers" className="inline-flex items-center  gap-1 text-sm font-bold text-[#FF6600] hover:underline">
            <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
          </Link>
        </div>

        {/* Toggle Empty State Button */}
        <button
          onClick={() => setIsEmptyState(!isEmptyState)}
          className="rounded-lg border border-[#0000001A] px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isEmptyState ? 'Show Populated State' : 'Show Empty State'}
        </button>
      </div>

      {/* Profile Header */}
      <div className="flex flex-wrap items-start justify-between gap-6 pt-2">
        <div className="flex gap-4">
          {
            isEmptyState ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-200 shadow-sm border border-[#0000001A]">
                <Image src="/pic.svg" alt="Natalie Gates" layout="fill" objectFit="cover" />
              </div>
            ) : (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-200 shadow-sm border border-[#0000001A]">
                <Image src="/images/login.jpg" alt="Natalie Gates" layout="fill" objectFit="cover" />
              </div>
            )}

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-garet font-[850] text-black">Natalie Gates</h1>
              {isEmptyState ? (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i} className="h-5 w-5 text-[#D9D9D9]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[#00000080] font-medium ml-1">(0)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map(i => (
                    <svg key={i} className="h-5 w-5 text-[#FF6600]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="h-5 w-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[#00000080] font-medium ml-1">(122)</span>
                </div>
              )}
            </div>
            <div>
              <div className="mt-1 flex items-center gap-3 text-[15px] text-[#00000080]">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Frankfurt, Germany.</span>
              </div>
              <span className="inline-flex w-fit rounded-full bg-[#FFF0E5] px-2 py-1 text-[11px] text-[#FF6600] mt-1">Verified</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-8 text-right text-[14px]">
            <div>
              <div className="text-[#00000099]">Account Creation Date</div>
              <div className="text-black mt-0.5">2026-04-23, 21:36:41</div>
            </div>
            <div>
              <div className="text-[#00000099]">Last Active</div>
              <div className="text-black mt-0.5">2026-04-23, 21:36:41</div>
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
              className="absolute right-0 top-14"
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
              className="absolute right-0 top-14"
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

      {/* Account Information Card */}
      <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm flex flex-col">
        <h2 className="text-xl font-garet font-[850] text-black mb-6">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-[#0000001A] p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-xs font-bold ">
              Total Bookings
              <Info className="h-4 w-4 text-black" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-mabry font-extrabold text-black">{totalBookings}</div>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="text-[11px] font-bold text-black underline hover:text-slate-700"
              >
                View Bookings
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-[#0000001A] p-5 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between text-xs font-bold">
              Total Spend
              <Info className="h-4 w-4 text-black" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-mabry font-extrabold text-black">{totalSpend}</div>
              <button className="text-[11px] font-bold text-black underline hover:text-slate-700">View History</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1">
              Email Address <Image src="/edit.svg" alt="Edit" width={12} height={12} />
            </div>
            <div className="text-sm font-bold text-slate-800">sarah.mitchell@executive.io</div>
            <div className="mt-1.5 inline-flex border border-[#FFDB561A] rounded-full bg-[#FF6600] px-2 py-1 text-[10px] font-bold text-white">Verified</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1">
              Phone Number <Image src="/edit.svg" alt="Edit" width={12} height={12} />
            </div>
            <div className="text-sm font-bold text-slate-800">+44 7997 443</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1">
              Verified Address <Image src="/edit.svg" alt="Edit" width={12} height={12} />
            </div>
            <div className="text-sm font-bold text-slate-800">455 E Illinois St, Chicago, IL 60611</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1">
              User ID
            </div>
            <div className="text-sm font-bold text-slate-800">KFT949390-39-494</div>
          </div>
        </div>
        <hr className="border-[#EEDDEEDD]" />
        <div className="flex justify-end mt-2">
          <button className="rounded-lg bg-[#00000066] px-6 py-2 text-sm font-semibold text-white cursor-not-allowed">
            Save
          </button>
        </div>
      </div>

      {/* Payment Methods Card */}
      <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-garet font-[850] text-black mb-4">Payment Methods</h2>
          {paymentMethods.length > 0 ? (
            <ul className="space-y-3 ">
              {paymentMethods.map((pm, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span>{pm.name}</span>
                  {pm.isDefault && <span className="text-[10px] text-slate-500 italic">Default</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[13px] text-[#00000099] font-medium pt-1">No added Payment Methods</div>
          )}
        </div>
        <button className="rounded-lg bg-[#999999] px-4 py-3 text-xs font-semibold text-white hover:bg-slate-500 transition-colors">
          View payment history
        </button>
      </div>

      {/* Activity Logs Card */}
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

      <BookingHistoryModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}

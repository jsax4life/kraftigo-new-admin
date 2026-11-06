"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Image from "next/image";
import { BookingDetailsModal } from "@/components/ui/booking-details-modal";

interface BookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockBookings = [
  {
    id: 1,
    serviceType: "House Cleaning",
    icon: "/broom.svg", // Using placeholder, can replace with specific icon
    date: "Oct 22, 2023",
    amount: "$120.00",
    status: "COMPLETED",
  },
  {
    id: 2,
    serviceType: "Plumbing",
    icon: "/plub.svg",
    date: "Oct 15, 2023",
    amount: "$350.00",
    status: "COMPLETED",
  },
  {
    id: 3,
    serviceType: "Personal Chef",
    icon: "/pan.svg",
    date: "Oct 08, 2023",
    amount: "$280.00",
    status: "COMPLETED",
  },
];

export function BookingHistoryModal({ isOpen, onClose }: BookingHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
        <div className="w-full max-w-[800px] rounded-[20px] bg-white shadow-xl relative flex flex-col max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-md transition-colors z-10"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between p-8 pb-6">
            <h2 className="text-xl font-garet font-[850] text-black">
              Booking History
            </h2>

            <div className="flex items-center gap-3 pr-8">
              <button className="flex items-center gap-2 rounded-lg bg-[#F6F6F6] px-3 py-1.5 text-[11px] text-black hover:bg-slate-200 transition-colors">
                Export History <Image src="/export.svg" alt="export" width={14} height={14} />
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-[#F6F6F6] px-3 py-1.5 text-[11px] text-black hover:bg-slate-200 transition-colors">
                All time <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-[#F6F6F6] px-3 py-1.5 text-[11px] text-black hover:bg-slate-200 transition-colors">
                Status <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto px-8 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-full text-left border-b border-[#0000001A]">
              <div className="flex text-[10px] text-[#45464D] uppercase tracking-wider pb-4">
                <div className="w-[35%]">SERVICE TYPE</div>
                <div className="w-[20%]">DATE</div>
                <div className="w-[20%]">AMOUNT</div>
                <div className="w-[25%]">STATUS</div>
              </div>
            </div>

            <div className="flex flex-col">
              {mockBookings.map((booking, index) => (
                <div
                  key={booking.id}
                  className={`flex items-center py-3 ${index !== mockBookings.length - 1 ? "border-b border-[#0000001A]" : ""
                    }`}
                >
                  {/* Service Type */}
                  <div className="w-[35%] flex items-center gap-4">
                    <Image src={booking.icon} alt={booking.serviceType} width={30} height={30} />
                    <span className="text-[13px] text-black">{booking.serviceType}</span>
                  </div>

                  {/* Date */}
                  <div className="w-[20%] text-[13px] text-black">
                    {booking.date}
                  </div>

                  {/* Amount */}
                  <div className="w-[20%] text-[13px]  text-black">
                    {booking.amount}
                  </div>

                  {/* Status & Action */}
                  <div className="w-[35%] flex items-center justify-between">
                    <div className="rounded-[4px] bg-[#6CF8BB] px-1 py-0.5 text-[9px] font-bold tracking-wider text-[#00714D]">
                      {booking.status}
                    </div>
                    <button 
                      onClick={() => setIsDetailsOpen(true)}
                      className="rounded-2xl bg-[#FF6600] px-2.5 py-2.5 text-[11px] text-white hover:bg-[#E65C00] transition-colors shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-[13px] font-bold text-black">
                Showing 1-3 of 3
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-6 w-16 items-center justify-center rounded border border-transparent bg-[#FF6600] text-[13px] text-white">
                  1
                </button>
                <button className="flex h-6 w-16 items-center justify-center rounded border border-[#0000001A] bg-white text-[13px] text-black hover:bg-slate-50">
                  2
                </button>
                <button className="flex h-6 w-16 items-center justify-center rounded border border-[#0000001A] bg-white text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-6 w-16 items-center justify-center rounded border border-[#0000001A] bg-white text-black hover:bg-slate-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>,
    document.body
  );
}

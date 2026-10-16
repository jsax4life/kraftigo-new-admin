"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit2, Search, Download, ChevronDown, X } from "lucide-react";
import Image from 'next/image'

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubCategoryModal({ isOpen, onClose }: SubCategoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("Krafters");
  const [killSwitch, setKillSwitch] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
        <div className="w-full max-w-[700px] rounded-[20px] bg-white shadow-xl relative flex flex-col max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-md transition-colors z-10"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>

          {/* Top Section */}
          <div className="flex gap-6 p-6 pb-4">
            {/* Image Placeholder */}
            <div className="flex h-[140px] w-[140px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl bg-[#00000033] hover:bg-slate-300 transition-colors">
              <Image src='/camera.svg' alt="camera" width={50} height={28} />
            </div>

            {/* Info & Stats */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[22px] font-garet font-[850] text-[#00000066]">
                      Enter Kraft Name
                    </h2>
                    <Image src='/edit.svg' alt="edit" width={14} height={14} />
                  </div>
                  <div className="mt-1">
                    <span className="text-[12px] font-bold text-black">Description</span>
                    <p className="text-[12px] text-[#0000004D] mt-0.5 cursor-pointer">
                      Click to edit
                    </p>
                  </div>
                </div>

                {/* Kill Switch */}
                <div className="flex flex-col items-center mt-10">
                  <button
                    onClick={() => setKillSwitch(!killSwitch)}
                    className={`relative inline-flex h-[24px] w-[40px] items-center rounded-md transition-colors ${killSwitch ? "bg-[#FF6600]" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-[20px] w-[20px] transform rounded-md bg-white transition-transform shadow-sm ${killSwitch ? "translate-x-[18px]" : "translate-x-[2px]"
                        }`}
                    />
                  </button>
                  <span className="text-[10px] font-bold text-black mt-1">
                    Kill Switch
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#0000001A] px-4 py-2 bg-[#F6F6F6]">
                <button className="flex items-center gap-1 text-[11px]  text-black">
                  All time <ChevronDown className="h-3 w-3" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Krafters</span>
                  <span className="text-[13px] text-black mt-0.5">0</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Bookings</span>
                  <span className="text-[13px] text-black mt-0.5">0</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Avg Price (£)</span>
                  <span className="text-[13px] text-black mt-0.5">0</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Completion Rate</span>
                  <span className="text-[13px] text-black mt-0.5">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 mb-2">
            <div className="inline-flex rounded-md bg-[#F6F6F6] p-0.5">
              <button
                onClick={() => setActiveTab("Krafters")}
                className={`rounded-md px-8 py-0.5 text-[12px] font-bold transition-colors ${activeTab === "Krafters"
                  ? "bg-[#0000FF] text-white"
                  : "text-[#00000066] hover:text-black"
                  }`}
              >
                Krafters
              </button>
              <button
                onClick={() => setActiveTab("Kraft Logs")}
                className={`rounded-md px-8 py-0.5 text-[12px] font-bold transition-colors ${activeTab === "Kraft Logs"
                  ? "bg-[#FF6600] text-white"
                  : "text-[#00000066] hover:text-black"
                  }`}
              >
                Kraft Logs
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeTab === "Krafters" && (
              <div className="flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between py-2">
                  <h3 className="text-[16px] font-garet font-[850] text-black">
                    Registered Krafters
                  </h3>

                  <div className={`flex items-center gap-4 ${isEmpty ? "opacity-20" : 'opacity-100'}`}>
                    <button className="flex items-center gap-1.5 text-[11px] text-[#00000066] hover:text-black transition-colors">
                      Export List <Image src='/export.svg' alt="export" width={15} height={15} />
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px]  text-[#00000066] hover:text-black transition-colors">
                      Active Recently <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00000066]" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="h-8 w-40 rounded-lg border-none bg-[#F6F6F6] pl-9 pr-8 text-[11px] outline-none placeholder:text-[#00000066] focus:ring-1 focus:ring-slate-300"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000066]">
                        /
                      </span>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                <div className="flex  items-center justify-center py-20">
                  <Image src='/non.svg' alt="search" width={150} height={150} />
                </div>
              </div>
            )}

            {activeTab === "Kraft Logs" && (
              <div className="flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between py-2">
                  <h3 className="text-[16px] font-garet font-[850] text-black">
                    Krafts Logs
                  </h3>

                  <div className={`flex items-center gap-4 ${isEmpty ? "opacity-20" : 'opacity-100'}`}>
                    <button className="flex items-center gap-1.5 text-[11px] text-[#00000066] hover:text-black transition-colors">
                      Export List <Image src='/export.svg' alt="export" width={15} height={15} />
                    </button>
                    <button className="flex items-center gap-1.5 text-[11px]  text-[#00000066] hover:text-black transition-colors">
                      Active Recently <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00000066]" />
                      <input
                        type="text"
                        placeholder="Search"
                        className="h-8 w-40 rounded-lg border-none bg-[#F6F6F6] pl-9 pr-8 text-[11px] outline-none placeholder:text-[#00000066] focus:ring-1 focus:ring-slate-300"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000066]">
                        /
                      </span>
                    </div>
                  </div>
                </div>

                {/* Empty State */}
                <div className="flex  items-center justify-center py-20">
                  <Image src='/nolog.svg' alt="search" width={150} height={150} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

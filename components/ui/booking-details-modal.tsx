"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Star, Zap, Check } from "lucide-react";
import Image from "next/image";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({ isOpen, onClose }: BookingDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[120] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[121] flex items-center justify-center p-4">
        <div className="w-full max-w-[950px] rounded-[20px] bg-white shadow-xl relative flex flex-col max-h-[95vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-md transition-colors z-10"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="text-lg font-garet font-[850] text-black">
              House Cleaning
            </h2>
            <button className="flex bg-[#F6F6F6] items-center gap-2 rounded-lg  px-3 py-1.5 text-[11px] text-black hover:bg-slate-50 transition-colors mr-8">
              Export History <Image src="/export.svg" alt="export" width={14} height={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Progress Bar */}
            <div className="px-20 py-8">
              <div className="relative flex items-center justify-between w-full max-w-[700px] mx-auto">
                <div className="absolute left-[5%] right-[5%] top-[12px] h-[4px] bg-[#FF6600]" />

                {[
                  { label: "Kraft Started", time: "21:36:41" },
                  { label: "Krafter Arrived", time: "21:36:41" },
                  { label: "Kraft In Progress", time: "21:36:41" },
                  { label: "Kraft Finished", time: "21:36:41" }
                ].map((step, index) => (
                  <div key={index} className="relative flex flex-col items-center">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6600] ring-4 ring-white shadow-sm z-10">
                      <Check className="h-3 w-3 text-white stroke-[3]" />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-[13px] text-[#45464D] whitespace-nowrap">{step.label}</div>
                      <div className="text-[12px] mt-0.5">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-8 lg:gap-16 px-8 pb-8">
              {/* Left Column: Details */}
              <div className="w-full md:max-w-[400px] space-y-7">
                <div className="space-y-4 text-[13px]">
                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="font-bold text-black">Job Location:</span>
                    <span className="text-black">2383 Timber Oak Drive Circuit</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="font-bold text-black">Time Taken:</span>
                    <span className="text-black">2:45:12</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center">
                    <span className="font-bold text-black">Kraft Rating:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        <Star className="h-4 w-4 fill-[#FF6600] text-[#FF6600]" />
                        <Star className="h-4 w-4 fill-[#FF6600] text-[#FF6600]" />
                        <Star className="h-4 w-4 fill-[#FF6600] text-[#FF6600]" />
                        <Star className="h-4 w-4 fill-slate-200 text-slate-200" />
                        <Star className="h-4 w-4 fill-slate-200 text-slate-200" />
                      </div>
                      <span>(Punctuality)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="font-bold text-black">Tip:</span>
                    <span className="text-black">$55</span>
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start">
                    <span className="font-bold text-black">Krafter Notes:</span>
                    <p className="text-black leading-relaxed max-w-[250px]">
                      I have six years of experience cleaning houses. My priority is to bring a good service and leave everything very clean✨. I am a reliable person, I will ensure that your apartment is left very clean and I am always open to suggestions🙏
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-[14px] font-bold text-black mb-4">Proof of work done</h4>
                  <div className="grid grid-cols-3 gap-2 max-w-[400px]">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square relative rounded-[14px] overflow-hidden shadow-sm border border-[#0000001A]">
                        <Image
                          src="/images/login.jpg"
                          alt="Proof of work"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Krafter & Messages */}
              <div className="w-full md:w-[350px] shrink-0 flex flex-col rounded-2xl border border-[#0000001A] bg-[#FAFAFA] overflow-hidden h-[600px]">
                {/* Krafter Info */}
                <div className="p-5">
                  <h3 className="text-xl  font-[850] text-black mb-4">Krafter</h3>
                  <div className="flex items-start gap-4">
                    <div className="relative h-[60px] w-[60px] rounded-xl bg-slate-200 overflow-hidden shrink-0 ">
                      <Image
                        src="/images/login.jpg"
                        alt="Krafter"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px] font-bold text-black">Edith R.</span>
                        <span className="bg-[#014F2A1A] px-1.5 py-0.5 text-[8px] font-bold text-[#014F2A]">TOP PRO</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          <Star className="h-3 w-3 fill-[#0000FF] text-[#0000FF]" />
                          <Star className="h-3 w-3 fill-[#0000FF] text-[#0000FF]" />
                          <Star className="h-3 w-3 fill-[#0000FF] text-[#0000FF]" />
                          <Star className="h-3 w-3 fill-[#0000FF] text-[#0000FF]" />
                          <Star className="h-3 w-3 fill-slate-200 text-slate-200" />
                        </div>
                        <span className="text-[11px] font-garet text-black">(23)</span>
                        <span className="text-[11px] ml-1">72 Krafts</span>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded bg-[#FF66001A] px-2 py-1 text-[9px] text-[#FF6600]">
                        Available Now <Zap className="h-2.5 w-2.5 fill-[#FF6600]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 [&::-webkit-scrollbar]:hidden">
                  <h3 className="text-lg font-garet font-[850] text-black">Messages</h3>

                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#EDEDED] px-3 py-1 text-[9px] text-black">
                      Jan 22, 2026
                    </span>
                  </div>

                  <div className="text-center text-[11px] italic text-[#000076]">
                    User accepted Ediths Counter offer at 45$
                  </div>

                  <div className="flex flex-col gap-1 w-[85%]">
                    <div className="rounded-2xl rounded-tl-sm bg-[#F0F0F0] p-3 text-[11px] text-black">
                      Hi Marcel, I will leave the key to the apartment under the flower pot, the kids will be asleep so be careful, text me if you need anything else. Thanks.
                    </div>
                    <span className="text-[9px] text-[#00000066] text-right">11:21</span>
                  </div>

                  <div className="flex flex-col gap-1 w-[85%] self-end ml-auto">
                    <div className="rounded-2xl rounded-tr-sm bg-[#E6E6FF] p-3 text-[11px] text-black">
                      Okay thanks.
                    </div>
                    <span className="text-[9px] text-[#00000066] text-right">11:21</span>
                  </div>

                  <div className="text-center text-[11px] italic text-[#000076]">
                    Edith requested to reschedule this Kraft
                  </div>

                  <div className="text-center text-[11px] italic text-[#000076]">
                    Task rescheduled to Tuesday, 14 may 12:30PM
                  </div>

                  <div className="text-center text-[11px] italic text-black">
                    Kraft Completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

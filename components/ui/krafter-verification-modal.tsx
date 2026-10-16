"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from "next/image";
import { Star, MapPin, Banknote } from "lucide-react";

interface KrafterVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject?: () => void;
  krafter?: any; // To pass krafter data
}

export function KrafterVerificationModal({ isOpen, onClose, onReject, krafter }: KrafterVerificationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Container */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center p-4 pointer-events-none">
        <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-2xl flex flex-col p-6 space-y-6 pointer-events-auto">

          {/* Header Profile Section */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-fit rounded-full bg-[#FFF0E5] px-2 py-1 text-[11px] text-[#FF6600]">NSSP Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <button
                className="bg-[#FF1E1E1A] text-[#FF1E1E] px-3 py-2.5 rounded-lg text-sm hover:bg-[#FFD6D6] transition-colors"
                onClick={() => {
                  if (onReject) {
                    onReject();
                  } else {
                    onClose();
                  }
                }}
              >
                Reject
              </button>
              <button
                className="bg-[#FF6600] text-white px-4 py-2.5 rounded-lg text-sm hover:bg-[#E65C00] transition-colors shadow-sm"
                onClick={onClose}
              >
                Approve
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
            <h2 className="text-lg font-garet font-bold text-slate-900">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  Email Address
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm text-slate-900 font-medium">sarah.mitchell@executive.io</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6600] text-white">
                    Verified
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  Phone Number
                </div>
                <span className="text-sm text-slate-900 font-medium">+44 7997 443</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  Verified Address
                </div>
                <span className="text-sm text-slate-900 font-medium">455 E Illinois St, Chicago, IL 60611</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {/* Empty slot to match the grid layout */}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <hr className="bg-[#EEDDEEDD] h-[1px] mb-4" />
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                User Bio
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                I have six years of experience cleaning houses. My priority is to bring a good service and leave everything very
                clean✨. I am a reliable person, I will ensure that your apartment is left very clean and I am always open to
                suggestions🙏
              </p>
            </div>
          </div>

          {/* Work & Eligibility */}
          <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
            <h2 className="text-lg font-garet font-bold text-slate-900">Work & Eligibility</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  Occupation
                </div>
                <span className="text-sm text-slate-900">Student</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  Languages Spoken
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">English</span>
                  <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">French</span>
                  <span className="px-2 py-1 rounded bg-[#EDEDED] text-[10px] font-medium text-[#000000B2]">Patois</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#00000099]">
                  What makes you unique?
                </div>
                <p className="text-sm">
                  Blah Blah about my physique and a very long text that spans the three pages.
                </p>
              </div>
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
                      <span className="text-sm text-slate-900">{item.skill}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-slate-900">{item.rate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proof of work */}
          <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-4">
            <h2 className="text-lg font-garet font-bold text-slate-900">Proof of work</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200">
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
                "Bank Statement",
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
                  <span className="text-[14px] truncate px-1">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

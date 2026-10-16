"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, ShieldCheck, Check } from "lucide-react";

interface RestrictAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  duration?: string;
  onConfirm?: () => void;
}

const REASONS = [
  {
    title: "Multiple Policy Violations",
    desc: "Repeated disregard for marketplace community guidelines.",
  },
  {
    title: "Suspicious Payment Activity",
    desc: "Irregular billing patterns or flagged transactions detected.",
  },
  {
    title: "Terms of Service Breach",
    desc: "Direct violation of contractual user agreements.",
  },
  {
    title: "Repeated Negative Feedback",
    desc: "Frequent reports from other users regarding service quality.",
  },
  {
    title: "Other",
    desc: "",
  }
];

export function RestrictAccountModal({ isOpen, onClose, user, duration = "1 Month", onConfirm }: RestrictAccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("Multiple Policy Violations");
  const [comments, setComments] = useState("");
  const [notifyUser, setNotifyUser] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col pointer-events-auto max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="">
            {/* Header */}
            <div className="border-b border-[#E3BFB1] -mb-1">
              <div className='flex items-center justify-between px-6 pt-4 -mb-1'>
                <h2 className="text-lg font-bold text-slate-900">
                  Restrict Account: {user?.name || "Marcus Sterling"}
                </h2>
                <button onClick={onClose} className="text-slate-900 hover:text-slate-600 transition-colors p-1 -mr-2 -mt-1">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-1 text-[13px] text-[#5A4136] px-6 pb-2">
                <Clock className="h-3.5 w-3.5" />
                <span className='mt-0.5'>Duration: <span className="text-[#A33E00]">{duration}</span></span>
              </div>
            </div>

            {/* Reasons */}
            <div className="mb-1 p-6">
              <h3 className="text-[9px] font-bold text-[#5A4136] uppercase tracking-wider mb-3 -mt-3">
                PRIMARY REASON FOR RESTRICTION
              </h3>
              <div className="flex flex-col gap-1.5">
                {REASONS.map((reason) => (
                  <label key={reason.title} className={`flex items-start gap-3 p-2 rounded-md border cursor-pointer hover:bg-[#FFE9D9] transition-colors ${selectedReason === reason.title ? 'border-[#FF6600] bg-[#FFF0E5]' : 'border-[#E3BFB1]'}`}>
                    <div className={`mt-0.5 h-4 w-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 ${selectedReason === reason.title ? 'border-[#0000FF]' : 'border-slate-300'}`}>
                      {selectedReason === reason.title && <div className="h-2 w-2 rounded-full bg-[#0000FF]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-slate-900 font-medium">{reason.title}</span>
                      {reason.desc && (
                        <span className="text-[10px] text-slate-500">{reason.desc}</span>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="restrictReason"
                      className="hidden"
                      checked={selectedReason === reason.title}
                      onChange={() => setSelectedReason(reason.title)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-2 p-6 -mt-7">
              <h3 className="text-[13px] font-medium text-slate-900 mb-2">Additional Notes or Admin Comments</h3>
              <textarea
                className="w-full rounded-md border border-[#E3BFB1] p-3 text-[13px] outline-none focus:border-[#FF6600] resize-none h-24 placeholder:text-[#E3BFB1]"
                placeholder="Describe the specific instance or internal reasoning..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            {/* Notify Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer mb-2 group p-6 -mt-11">
              <div className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border ${notifyUser ? 'border-[#0000FF] bg-[#0000FF]' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                {notifyUser && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-slate-900">Notify User via Email</span>
                <span className="text-[10px] text-slate-500">Send an automated explanation of the restriction to the user's registered email.</span>
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
              />
            </label>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 w-full p-6 -mt-4 border-t border-[#E3BFB1] bg-[#F2F4F6]">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-[14px] font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6600] text-white text-[14px] font-medium hover:bg-[#E65C00] transition-colors shadow-sm"
              >
                Apply Restriction <ShieldCheck className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

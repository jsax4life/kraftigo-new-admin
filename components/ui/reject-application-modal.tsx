"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from "lucide-react";

interface RejectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  krafter?: any;
  onConfirm?: (reason: string, comments: string) => void;
}

const REASONS = [
  "Incomplete Documentation",
  "Qualifications Not Verified",
  "Background Check Failed",
  "Service Area Not Covered",
  "Other"
];

export function RejectApplicationModal({ isOpen, onClose, krafter, onConfirm }: RejectApplicationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(selectedReason, comments);
    onClose();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/60 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col p-6 pointer-events-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-garet font-bold text-slate-900">Reject Application</h2>
            <button onClick={onClose} className="hover:text-slate-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-[14px] text-[#5A4136] mb-6 leading-relaxed">
            Please select the reason for rejecting {krafter?.name || "Marcus Thompson"}'s registration. This will be sent to the applicant.
          </p>

          {/* Reasons */}
          <div className="mb-6">
            <h3 className="text-[12px] font-bold text-slate-900 mb-3">Reason for Rejection</h3>
            <div className="flex flex-col gap-2.5">
              {REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-[#E3BFB1] cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className={`h-[18px] w-[18px] rounded-full border flex items-center justify-center flex-shrink-0 ${selectedReason === reason ? 'border-[#0000FF]' : 'border-[#E3BFB1]'}`}>
                    {selectedReason === reason && <div className="h-2.5 w-2.5 rounded-full bg-[#0000FF]" />}
                  </div>
                  <span className="text-[13px] text-slate-700">{reason}</span>
                  <input
                    type="radio"
                    name="rejectReason"
                    className="hidden"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="mb-8">
            <h3 className="text-[12px] font-bold text-slate-900 mb-3">Additional Comments</h3>
            <textarea
              className="w-full rounded-xl border border-[#E3BFB1] p-4 text-[13px] outline-none focus:border-[#FF6600] resize-none h-24 placeholder:text-slate-400 bg-[#F6F6F6]"
              placeholder="Provide more detail for the applicant..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-[#8E7164] text-sm text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedReason}
              className="flex-1 px-4 py-3 rounded-xl bg-[#FE2929] text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

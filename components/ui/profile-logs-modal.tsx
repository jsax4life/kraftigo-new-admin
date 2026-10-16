"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from "lucide-react";

interface ProfileLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const MOCK_LOGS = [
  {
    id: 1,
    date: "OCT 24, 2023 - 14:32",
    title: "Restriction Applied: Permanent",
    description: "Admin Alex Sterling applied permanent restriction following repeated off-platform payment violations. Evidence: Chat ID #99284, #99310.",
    highlighted: true,
  },
  {
    id: 2,
    date: "OCT 22, 2023 - 09:15",
    title: "System Flag Triggered",
    description: "NLP Algorithm detected \"WhatsApp me\" and \"cash payment\" in booking negotiations with 3 different users.",
    highlighted: false,
  },
  {
    id: 3,
    date: "AUG 12, 2023 - 11:00",
    title: "Account Verified",
    description: "Government ID and Professional Licensing verified successfully.",
    highlighted: false,
  }
];

export function ProfileLogsModal({ isOpen, onClose, user }: ProfileLogsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white  w-full max-w-[420px] shadow-2xl flex flex-col pointer-events-auto h-auto max-h-[90vh] overflow-hidden">

          {/* Header */}
          <div className="flex items-start bg-[#F2F4F6] justify-between p-6 pb-4 border-b border-[#E3BFB1]">
            <div className="flex flex-col">
              <h2 className="text-[20px] font-bold text-slate-900">Profile Logs</h2>
              <p className="text-[13px] text-[#5A4136]">{user?.name || "Marcus Thorne"} ({user?.type || "Krafter"})</p>
            </div>
            <button onClick={onClose} className="text-slate-900 hover:text-slate-600 transition-colors p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6 pt-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-col">
              {MOCK_LOGS.map((log, index) => (
                <div key={log.id} className="relative pl-6 pb-6">
                  {/* Vertical line connecting dots */}
                  {index !== MOCK_LOGS.length - 1 && (
                    <div className={`absolute left-[3px] top-2 bottom-0 w-[2px] ${log.highlighted ? "bg-[#FF6600]" : "bg-[#8E7164]"}`} />
                  )}
                  {/* Orange Dot */}
                  <div className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${log.highlighted ? "bg-[#FF6600]" : "bg-[#8E7164]"}`} />

                  <div className="text-[10px] font-bold text-[#5A4136] mb-1 uppercase">{log.date}</div>
                  <div className="text-[13px] font-bold text-[#191C1E] mb-1.5">{log.title}</div>

                  {log.highlighted ? (
                    <div className="text-[12px] text-[#5A4136] bg-[#FFF0E5] p-3.5 rounded-lg leading-relaxed">
                      {log.description}
                    </div>
                  ) : (
                    <div className="text-[12px] text-[#5A4136] leading-relaxed pr-4">
                      {log.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Area with strong shadow to separate from content */}
          <div className="p-5 pt-3 bg-[#F2F4F6] border-t border-[#E3BFB1] relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className='flex flex-col gap-3'>
              <div className=" bg-white p-3 border border-[#EDEDED] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <textarea
                  className="w-full text-[13px] outline-none resize-none h-14 placeholder:text-slate-400"
                  placeholder="Add internal moderation note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <button
                className="w-full py-4 rounded-lg bg-[#111111] text-white text-[13px] font-medium hover:bg-black transition-colors"
              >
                Post Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

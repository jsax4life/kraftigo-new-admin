"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from "lucide-react";
import { useProfileLogs, usePostModerationNote } from "@/hooks/useRestrictedUsers";

interface ProfileLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function ProfileLogsModal({ isOpen, onClose, user }: ProfileLogsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [note, setNote] = useState("");

  const targetUserId = user?.userId || user?.id;
  const { data: logsData, isLoading: isLogsLoading } = useProfileLogs(
    isOpen && targetUserId ? String(targetUserId) : undefined
  );

  const postNoteMutation = usePostModerationNote();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const logs = logsData?.items ?? [];

  const handlePostNote = async () => {
    if (!note.trim() || !targetUserId) return;
    try {
      await postNoteMutation.mutateAsync({
        userId: String(targetUserId),
        data: { note: note.trim() }
      });
      setNote("");
    } catch (err) {
      console.error("Failed to post moderation note:", err);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white w-full max-w-[420px] shadow-2xl flex flex-col pointer-events-auto h-auto max-h-[90vh] overflow-hidden rounded-2xl">

          {/* Header */}
          <div className="flex items-start bg-[#F2F4F6] justify-between p-6 pb-4 border-b border-[#E3BFB1]">
            <div className="flex flex-col">
              <h2 className="text-[20px] font-bold text-slate-900">Profile Logs</h2>
              <p className="text-[13px] text-[#5A4136]">
                {user?.name || "User"} ({user?.type || user?.userType || "Krafter"})
              </p>
            </div>
            <button onClick={onClose} className="text-slate-900 hover:text-slate-600 transition-colors p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto p-6 pt-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {isLogsLoading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Loading moderation logs…
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No moderation logs recorded yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {logs.map((log: any, index: number) => {
                  const isHighlighted = log.highlighted || index === 0;
                  const logDate = log.date || log.createdAt || "Recent";
                  const logTitle = log.title || "Moderation Event";
                  const logDesc = log.description || log.note || "No details provided.";

                  return (
                    <div key={log.id || index} className="relative pl-6 pb-6">
                      {/* Vertical line connecting dots */}
                      {index !== logs.length - 1 && (
                        <div
                          className={`absolute left-[3px] top-2 bottom-0 w-[2px] ${
                            isHighlighted ? "bg-[#FF6600]" : "bg-[#8E7164]"
                          }`}
                        />
                      )}
                      {/* Orange Dot */}
                      <div
                        className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${
                          isHighlighted ? "bg-[#FF6600]" : "bg-[#8E7164]"
                        }`}
                      />

                      <div className="text-[10px] font-bold text-[#5A4136] mb-1 uppercase">
                        {logDate}
                      </div>
                      <div className="text-[13px] font-bold text-[#191C1E] mb-1.5">
                        {logTitle}
                      </div>

                      <div
                        className={`text-[12px] text-[#5A4136] leading-relaxed ${
                          isHighlighted ? "bg-[#FFF0E5] p-3.5 rounded-lg" : "pr-4"
                        }`}
                      >
                        {logDesc}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-5 pt-3 bg-[#F2F4F6] border-t border-[#E3BFB1] relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-3">
              <div className="bg-white p-3 border border-[#EDEDED] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <textarea
                  className="w-full text-[13px] outline-none resize-none h-14 placeholder:text-slate-400"
                  placeholder="Add internal moderation note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <button
                disabled={!note.trim() || postNoteMutation.isPending}
                onClick={handlePostNote}
                className="w-full py-3.5 rounded-lg bg-[#111111] text-white text-[13px] font-medium hover:bg-black disabled:opacity-50 transition-colors"
              >
                {postNoteMutation.isPending ? "Posting…" : "Post Note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}


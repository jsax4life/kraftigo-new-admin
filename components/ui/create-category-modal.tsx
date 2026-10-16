"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon } from "lucide-react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({ isOpen, onClose }: CreateCategoryModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[110] bg-black/40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] rounded-2xl bg-white shadow-xl relative flex flex-col max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E3BFB1] p-3.5">
            <h2 className="text-xl font-garet font-[850] text-black">Create New Category</h2>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-3 p-6 font-sans">
            {/* Category Name */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g., Plumbing, House Cleaning"
                className="w-full rounded-lg border border-[#E3BFB1] bg-[#F6F6F6] p-2.5 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Describe the services included in this category..."
                className="w-full min-h-[85px] rounded-lg border border-[#E3BFB1] bg-[#F6F6F6] p-2.5 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] resize-none"
              />
            </div>

            {/* Category Cover Image */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Category Cover Image
              </label>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E3BFB1] bg-[#F6F6F6] p-5 text-center cursor-pointer hover:bg-[#FFF0E5]/30 transition-colors">
                <ImageIcon className="h-8 w-8 text-[#000000CC] mb-3" strokeWidth={1.5} />
                <span className="text-[13px] text-[#000000CC] mb-1">
                  Click to upload or drag and drop
                </span>
                <span className="text-[10px] font-bold text-[#00000066]">
                  PNG, JPG UP TO 10MB
                </span>
              </div>
            </div>

            {/* Set as Active */}
            <div className="flex items-center justify-between rounded-xl p-4 bg-[#F2F4F6]">
              <div>
                <div className="text-[13px] text-[#191C1E]">Set as Active</div>
                <div className="text-[10px] text-[#5A4136] mt-0.5">
                  GO LIVE IMMEDIATELY
                </div>
              </div>
              <button
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${isActive ? "bg-[#B34700]" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform shadow-sm ${isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-6 border-t border-[#0000001A] p-5">
            <button
              onClick={onClose}
              className="text-[14px] font-semibold text-[#000000CC] hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-[#FF6600] px-6 py-4 text-[14px] font-semibold text-white hover:bg-[#E65C00] transition-colors shadow-sm">
              Create Category
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

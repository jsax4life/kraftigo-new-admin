"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useCreateCategory } from "@/hooks/useKrafts";
import type { KraftCategoryItem } from "@/types/krafts";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (category: KraftCategoryItem) => void;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreated
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createCategoryMutation = useCreateCategory();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setIsActive(true);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setFormError(null);
    try {
      const created = await createCategoryMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        isActive
      });
      onCreated?.(created);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setFormError(msg);
    }
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[110] bg-black/40 transition-opacity backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[450px] rounded-2xl bg-white shadow-xl relative flex flex-col max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E3BFB1] p-4">
            <h2 className="text-xl font-garet font-[850] text-black">
              Create New Category
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-col gap-3.5 p-6 font-sans">
            {formError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {formError}
              </div>
            )}

            {/* Category Name */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Plumbing, House Cleaning"
                required
                className="w-full rounded-lg border border-[#E3BFB1] bg-[#F6F6F6] p-2.5 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the services included in this category..."
                className="w-full min-h-[85px] rounded-lg border border-[#E3BFB1] bg-[#F6F6F6] p-2.5 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] resize-none"
              />
            </div>

            {/* Category Cover Image placeholder */}
            <div>
              <label className="block text-[13px] font-bold text-black mb-1.5">
                Category Cover Image
              </label>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E3BFB1] bg-[#F6F6F6] p-5 text-center cursor-pointer hover:bg-[#FFF0E5]/30 transition-colors">
                <ImageIcon
                  className="h-8 w-8 text-[#000000CC] mb-3"
                  strokeWidth={1.5}
                />
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
                <div className="text-[13px] font-medium text-[#191C1E]">
                  Set as Active
                </div>
                <div className="text-[10px] text-[#5A4136] mt-0.5 font-bold">
                  GO LIVE IMMEDIATELY
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-[24px] w-[44px] items-center rounded-full transition-colors ${
                  isActive ? "bg-[#B34700]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform shadow-sm ${
                    isActive ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-[#0000001A] p-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createCategoryMutation.isPending}
              className="text-[14px] font-semibold text-[#000000CC] hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-6 py-2.5 text-[14px] font-semibold text-white hover:bg-[#E65C00] transition-colors shadow-sm disabled:opacity-50"
            >
              {createCategoryMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              )}
              Create Category
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}

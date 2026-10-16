"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";

export default function CreateStaffPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Breadcrumb & Back */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#0B0B0B66]">
          <Link href="/admin/staff" className="hover:text-slate-800">Staff</Link>
          <span>/</span>
          <span className="text-black">Create new staff</span>
        </div>
        <Link href="/admin/staff" className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline">
          <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
        </Link>
      </div>

      <div className="max-w-xl">
        <h1 className="text-2xl font-garet font-[850] text-black mb-8">Create New User</h1>

        {/* Avatar Uploader */}
        <div className="mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-[#0000FF] bg-[#F6F6F6] cursor-pointer hover:bg-slate-50 transition-colors">
            <User className="h-10 w-10 text-[#00000066]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-black">First Name</label>
              <input
                type="text"
                placeholder="Enter First Name"
                className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-black">Last Name</label>
              <input
                type="text"
                placeholder="Enter Last Name"
                className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-black">Role</label>
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button className="w-full rounded-xl bg-[#0000FF] py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
              Cancel
            </button>
            <button className="w-full rounded-xl bg-[#FF6600] py-3 text-sm font-bold text-white hover:bg-[#e65c00] transition-colors">
              Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

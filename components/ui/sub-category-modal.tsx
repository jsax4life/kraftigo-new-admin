"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X, Loader2, Check } from "lucide-react";
import Image from "next/image";
import {
  useAddKraft,
  useToggleKillSwitch,
  useKraftMetrics,
  useKraftKrafters,
  useKraftLogs
} from "@/hooks/useKrafts";
import { kraftsService } from "@/services/krafts.service";
import type { CategorySubKraft, RegisteredKrafterItem, KraftLogItem } from "@/types/krafts";

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  categoryName?: string;
  kraft?: CategorySubKraft | null;
  onCreated?: (kraft: CategorySubKraft) => void;
}

export function SubCategoryModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  kraft,
  onCreated
}: SubCategoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"Krafters" | "Kraft Logs">("Krafters");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [killSwitch, setKillSwitch] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Krafter tab filter & search
  const [krafterSearch, setKrafterSearch] = useState("");
  const [debouncedKrafterSearch, setDebouncedKrafterSearch] = useState("");
  const [krafterStatus, setKrafterStatus] = useState<"active_recently" | "all">("active_recently");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKrafterSearch(krafterSearch);
    }, 350);
    return () => clearTimeout(timer);
  }, [krafterSearch]);

  const addKraftMutation = useAddKraft();
  const toggleKillSwitchMutation = useToggleKillSwitch();
  const { data: metricsData } = useKraftMetrics(kraft?.id ?? "");

  // Live Registered Krafters & Logs
  const { data: kraftersData, isLoading: isKraftersLoading } = useKraftKrafters(
    kraft?.id ?? "",
    { search: debouncedKrafterSearch, status: krafterStatus }
  );

  const { data: logsData, isLoading: isLogsLoading } = useKraftLogs(
    kraft?.id ?? ""
  );

  const isCreateMode = !kraft && Boolean(categoryId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (kraft) {
        setName(kraft.name);
        setDescription(kraft.description || "");
        setKillSwitch(Boolean(kraft.killSwitchActive));
        setIsEditing(false);
      } else {
        setName("");
        setDescription("");
        setKillSwitch(false);
        setIsEditing(true);
      }
    }
  }, [isOpen, kraft]);

  if (!isOpen || !mounted) return null;

  const handleToggleKillSwitch = async () => {
    if (!kraft?.id) {
      setKillSwitch(!killSwitch);
      return;
    }
    const nextVal = !killSwitch;
    setKillSwitch(nextVal);
    try {
      await toggleKillSwitchMutation.mutateAsync({
        skillId: kraft.id,
        killSwitchActive: nextVal
      });
    } catch (err: unknown) {
      setKillSwitch(!nextVal); // Revert
      setErrorMsg(err instanceof Error ? err.message : "Failed to toggle kill switch");
    }
  };

  const handleCreateKraft = async () => {
    if (!categoryId) return;
    if (!name.trim()) {
      setErrorMsg("Kraft name is required");
      return;
    }

    try {
      setErrorMsg(null);
      const res = await addKraftMutation.mutateAsync({
        categoryId,
        dto: {
          name: name.trim(),
          description: description.trim() || undefined,
          isActive: true
        }
      });
      onCreated?.(res);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create kraft");
    }
  };

  const handleExportKrafters = async () => {
    if (!kraft?.id) return;
    try {
      setIsExporting(true);
      await kraftsService.exportKrafters(kraft.id, {
        search: debouncedKrafterSearch,
        status: krafterStatus
      });
    } catch (err) {
      console.error("Failed to export krafters:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const kraftersList: RegisteredKrafterItem[] = Array.isArray(kraftersData)
    ? kraftersData
    : kraftersData?.data ?? [];

  const logsList: KraftLogItem[] = Array.isArray(logsData)
    ? logsData
    : logsData?.data ?? [];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[110] bg-black/40 transition-opacity backdrop-blur-[2px]"
        onClick={onClose}
      />
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
          <div className="flex flex-col sm:flex-row gap-6 p-6 pb-4">
            {/* Image Placeholder */}
            <div className="flex h-[130px] w-[130px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl bg-[#00000033] hover:bg-slate-300 transition-colors">
              <Image src="/camera.svg" alt="camera" width={44} height={25} />
            </div>

            {/* Info & Stats */}
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {categoryName && (
                    <span className="text-[11px] font-bold text-[#FF6600] uppercase tracking-wider block mb-1">
                      {categoryName}
                    </span>
                  )}

                  {isCreateMode || isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Kraft Name"
                        className="text-lg font-garet font-[850] text-black w-full border-b border-[#00000033] outline-none focus:border-[#FF6600] py-0.5 bg-transparent"
                      />
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Short description (optional)"
                        className="text-xs text-slate-600 w-full border-b border-[#0000001A] outline-none focus:border-[#FF6600] py-0.5 bg-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[20px] font-garet font-[850] text-black">
                          {name || "Kraft Name"}
                        </h2>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <Image src="/edit.svg" alt="edit" width={14} height={14} />
                        </button>
                      </div>
                      <div className="mt-1">
                        <span className="text-[11px] font-bold text-black block">
                          Description
                        </span>
                        <p className="text-[12px] text-slate-600 mt-0.5 leading-snug">
                          {description || "No description provided."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kill Switch */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    onClick={handleToggleKillSwitch}
                    disabled={toggleKillSwitchMutation.isPending}
                    className={`relative inline-flex h-[24px] w-[40px] items-center rounded-md transition-colors ${
                      killSwitch ? "bg-[#FF6600]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-[20px] w-[20px] transform rounded-md bg-white transition-transform shadow-sm ${
                        killSwitch ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                  <span className="text-[10px] font-bold text-black mt-1">
                    Kill Switch
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                  {errorMsg}
                </div>
              )}

              {/* Stats Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#0000001A] px-4 py-2 bg-[#F6F6F6]">
                <button className="flex items-center gap-1 text-[11px] text-black font-semibold">
                  All time <ChevronDown className="h-3 w-3" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Krafters</span>
                  <span className="text-[13px] font-bold text-black mt-0.5">
                    {metricsData?.krafters ?? kraft?.registeredKraftersCount ?? 0}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Bookings</span>
                  <span className="text-[13px] font-bold text-black mt-0.5">
                    {metricsData?.bookings ?? 0}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Avg Price (£)</span>
                  <span className="text-[13px] font-bold text-black mt-0.5">
                    {metricsData?.avgPriceFormatted || `£${metricsData?.avgPrice ?? 0}`}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-black">Completion Rate</span>
                  <span className="text-[13px] font-bold text-black mt-0.5">
                    {metricsData?.completionRate ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row for Create Mode */}
          {isCreateMode && (
            <div className="px-6 py-2 border-b border-slate-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKraft}
                disabled={addKraftMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-[#FF6600] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#E65C00] transition-colors disabled:opacity-50"
              >
                {addKraftMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save Kraft
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="px-6 mb-2 mt-2">
            <div className="inline-flex rounded-md bg-[#F6F6F6] p-0.5">
              <button
                onClick={() => setActiveTab("Krafters")}
                className={`rounded-md px-8 py-1 text-[12px] font-bold transition-colors ${
                  activeTab === "Krafters"
                    ? "bg-[#0000FF] text-white"
                    : "text-[#00000066] hover:text-black"
                }`}
              >
                Krafters
              </button>
              <button
                onClick={() => setActiveTab("Kraft Logs")}
                className={`rounded-md px-8 py-1 text-[12px] font-bold transition-colors ${
                  activeTab === "Kraft Logs"
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
                <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-2">
                  <h3 className="text-[15px] font-garet font-[850] text-black">
                    Registered Krafters
                  </h3>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportKrafters}
                      disabled={isExporting || !kraft?.id}
                      className="flex items-center gap-1.5 text-[11px] text-[#00000066] hover:text-black transition-colors disabled:opacity-40"
                    >
                      {isExporting ? (
                        <>
                          Exporting <Loader2 className="h-3 w-3 animate-spin text-black" />
                        </>
                      ) : (
                        <>
                          Export List <Image src="/export.svg" alt="export" width={15} height={15} />
                        </>
                      )}
                    </button>

                    {/* Filter Status Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-black bg-[#F6F6F6] px-2.5 py-1 rounded"
                      >
                        {krafterStatus === "active_recently" ? "Active Recently" : "All Krafters"}
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute right-0 top-7 z-20 w-36 rounded-lg bg-white border border-slate-200 shadow-md py-1 text-xs">
                          <button
                            onClick={() => {
                              setKrafterStatus("active_recently");
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left hover:bg-slate-50 ${
                              krafterStatus === "active_recently" ? "font-bold text-[#FF6600]" : ""
                            }`}
                          >
                            Active Recently
                          </button>
                          <button
                            onClick={() => {
                              setKrafterStatus("all");
                              setIsStatusDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 text-left hover:bg-slate-50 ${
                              krafterStatus === "all" ? "font-bold text-[#FF6600]" : ""
                            }`}
                          >
                            All Krafters
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#00000066]" />
                      <input
                        type="text"
                        value={krafterSearch}
                        onChange={(e) => setKrafterSearch(e.target.value)}
                        placeholder="Search krafter"
                        className="h-7 w-32 rounded-lg border-none bg-[#F6F6F6] pl-7 pr-3 text-[11px] outline-none placeholder:text-[#00000066] focus:ring-1 focus:ring-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Krafters List / Empty State */}
                {isKraftersLoading ? (
                  <div className="flex items-center justify-center py-16 text-xs text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Krafters…
                  </div>
                ) : kraftersList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Image src="/non.svg" alt="no krafters" width={120} height={120} />
                    <p className="mt-3 text-xs text-slate-500">No registered Krafters yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {kraftersList.map((krafter, idx) => (
                      <div key={krafter.id || krafter.krafterId || idx} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image
                            src={krafter.profilePhotoUrl || krafter.avatarUrl || "/images/login.jpg"}
                            alt={krafter.displayName || krafter.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover bg-slate-200"
                          />
                          <div>
                            <span className="text-xs font-semibold text-black block">
                              {krafter.displayName || krafter.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {krafter.completedKrafts} completed jobs {krafter.rating ? `• ★ ${krafter.rating}` : ""}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {krafter.hourlyRate != null ? `£${krafter.hourlyRate}/hr` : "Standard rate"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Kraft Logs" && (
              <div className="flex flex-col h-full">
                {/* Header Row */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 mb-2">
                  <h3 className="text-[15px] font-garet font-[850] text-black">
                    Krafts Logs
                  </h3>
                </div>

                {/* Logs List / Empty State */}
                {isLogsLoading ? (
                  <div className="flex items-center justify-center py-16 text-xs text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading logs…
                  </div>
                ) : logsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Image src="/nolog.svg" alt="no logs" width={120} height={120} />
                    <p className="mt-3 text-xs text-slate-500">No logs recorded yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {logsList.map((log, idx) => (
                      <div key={log.id || idx} className="py-2 text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>{log.action}</span>
                          <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] mt-0.5">{log.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

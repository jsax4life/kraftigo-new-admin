"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlignLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Bell,
  MapPin,
  FileText,
  ShieldCheck,
  Eye,
  Radio,
  ExternalLink
} from "lucide-react";

export type ContentType = "ANNOUNCEMENT" | "SERVICE_ZONE" | "HELP_ARTICLE" | "POLICY";

export interface OperationsItem {
  id: string;
  title: string;
  type: ContentType;
  targetAudience: "ALL" | "CUSTOMERS" | "KRAFTERS";
  locationOrPlacement: string;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  summary: string;
  updatedAt: string;
}

const INITIAL_OPERATIONS_ITEMS: OperationsItem[] = [
  {
    id: "op-01",
    title: "Harmattan Weather Preparedness & Safety Guidelines",
    type: "ANNOUNCEMENT",
    targetAudience: "KRAFTERS",
    locationOrPlacement: "Mobile Krafter Feed & Push Notice",
    status: "PUBLISHED",
    summary: "Safety standards for outdoor high-voltage electrical and roofing installations during dry windy periods.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: "op-02",
    title: "Lekki Phase 1 & Ikoyi Expanded Service Dispatch Zone",
    type: "SERVICE_ZONE",
    targetAudience: "ALL",
    locationOrPlacement: "Lagos Island Zone 1",
    status: "PUBLISHED",
    summary: "Enabled 15-minute express dispatch routing for verified plumbing and electrical requests in Eti-Osa LGA.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "op-03",
    title: "Customer Escrow & Milestone Authorization Guide",
    type: "HELP_ARTICLE",
    targetAudience: "CUSTOMERS",
    locationOrPlacement: "Help Center / Payment FAQs",
    status: "PUBLISHED",
    summary: "Complete step-by-step breakdown on how arrival PINs protect funds and when payments disburse to Krafters.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "op-04",
    title: "Festac & Amuwo Odofin Express Hub Launch",
    type: "SERVICE_ZONE",
    targetAudience: "ALL",
    locationOrPlacement: "Lagos Mainland Zone 4",
    status: "DRAFT",
    summary: "New hub onboarding 50+ vetted artisans across automotive diagnostics and air conditioning servicing.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "op-05",
    title: "Krafter Weekly Payout Schedule & Bank Holidays Alert",
    type: "ANNOUNCEMENT",
    targetAudience: "KRAFTERS",
    locationOrPlacement: "Krafter Dashboard Banner",
    status: "PUBLISHED",
    summary: "Disbursement timing details during federal public holidays and bank settlement cutoffs.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  },
  {
    id: "op-06",
    title: "Identity Verification & Background Check Requirements",
    type: "POLICY",
    targetAudience: "KRAFTERS",
    locationOrPlacement: "Onboarding Portal",
    status: "PUBLISHED",
    summary: "Mandatory government identity verification (NIN/Voters Card) and physical craft workshop inspection standards.",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  }
];

const PAGE_SIZE = 8;

export default function OperationsPage() {
  const [items, setItems] = useState<OperationsItem[]>(INITIAL_OPERATIONS_ITEMS);
  const [activeTab, setActiveTab] = useState<"ALL" | "ANNOUNCEMENT" | "SERVICE_ZONE" | "HELP_ARTICLE">("ALL");
  const [audienceFilter, setAudienceFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ContentType>("ANNOUNCEMENT");
  const [newAudience, setNewAudience] = useState<"ALL" | "CUSTOMERS" | "KRAFTERS">("ALL");
  const [newPlacement, setNewPlacement] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const metrics = useMemo(() => {
    const total = items.length;
    const announcements = items.filter((i) => i.type === "ANNOUNCEMENT").length;
    const serviceZones = items.filter((i) => i.type === "SERVICE_ZONE").length;
    const publishedCount = items.filter((i) => i.status === "PUBLISHED").length;

    return {
      total,
      announcements,
      serviceZones,
      publishedCount
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab !== "ALL" && item.type !== activeTab) {
        return false;
      }

      // Audience filter
      if (audienceFilter !== "ALL" && item.targetAudience !== audienceFilter) {
        return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesPlacement = item.locationOrPlacement.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPlacement && !matchesSummary) return false;
      }

      return true;
    });
  }, [items, activeTab, audienceFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: i.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
              updatedAt: new Date().toISOString()
            }
          : i
      )
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: OperationsItem = {
      id: `op-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      type: newType,
      targetAudience: newAudience,
      locationOrPlacement: newPlacement.trim() || "Platform Feed",
      status: "PUBLISHED",
      summary: newSummary.trim() || "Operational bulletin.",
      updatedAt: new Date().toISOString()
    };

    setItems((prev) => [newItem, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewPlacement("");
    setNewSummary("");
  };

  const getTypeBadge = (type: ContentType) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold text-orange-800">
            <Radio className="h-3 w-3 text-orange-600" />
            Announcement
          </span>
        );
      case "SERVICE_ZONE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800">
            <MapPin className="h-3 w-3 text-blue-600" />
            Service Zone
          </span>
        );
      case "HELP_ARTICLE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
            <FileText className="h-3 w-3 text-emerald-600" />
            Help Guide
          </span>
        );
      case "POLICY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-800">
            <ShieldCheck className="h-3 w-3 text-purple-600" />
            Compliance
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Operations & Content Management
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Manage platform operational broadcasts, service area expansions, terms, and help center articles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#FF6600]" : "text-slate-600"}`}
            />
            Refresh
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Item
          </button>
        </div>
      </div>

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Operational Items */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Operational Notices
            </span>
            <AlignLeft className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.total}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              In Registry
            </span>
          </div>
        </div>

        {/* Live Announcements */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Broadcast Banners
            </span>
            <Bell className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.announcements}
            </span>
            <span className="text-[11px] font-semibold text-orange-600">
              Active Feeds
            </span>
          </div>
        </div>

        {/* Coverage Zones */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Active Service Hubs
            </span>
            <MapPin className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.serviceZones}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              LGA Clusters
            </span>
          </div>
        </div>

        {/* Published Ratio */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Publishing State
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Live
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.publishedCount} Published
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Real-time sync
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-garet font-[850] text-black">
              Operations Repository
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Filter broadcast notices, regional hubs, and published customer guides.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Queue Tabs */}
            <div className="inline-flex rounded-lg border border-[#0000001A] bg-white p-0.5 shadow-sm">
              {(["ALL", "ANNOUNCEMENT", "SERVICE_ZONE", "HELP_ARTICLE"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === tab
                      ? "bg-[#FF6600] text-white shadow-sm"
                      : "text-slate-600 hover:text-black hover:bg-slate-50"
                  }`}
                >
                  {tab === "ALL"
                    ? "All"
                    : tab === "ANNOUNCEMENT"
                    ? "Announcements"
                    : tab === "SERVICE_ZONE"
                    ? "Service Zones"
                    : "Help Guides"}
                </button>
              ))}
            </div>

            {/* Audience Filter */}
            <select
              value={audienceFilter}
              onChange={(e) => {
                setAudienceFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#0000001A] bg-white px-3 py-1.5 text-xs font-medium text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
            >
              <option value="ALL">All Audiences</option>
              <option value="CUSTOMERS">Customers Only</option>
              <option value="KRAFTERS">Krafters Only</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search notices, hubs, keywords…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-56 rounded-lg border border-[#0000001A] bg-white py-1.5 pl-9 pr-7 text-xs text-black outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-[#FF6600] shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-black"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100 text-[11px]">
                  <th className="py-3 px-5">Title & Summary</th>
                  <th className="py-3 px-5">Content Type</th>
                  <th className="py-3 px-5">Target Audience</th>
                  <th className="py-3 px-5">Placement / Region</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Last Updated</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 bg-white">
                      No operational items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item, index) => {
                    const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";

                    return (
                      <tr
                        key={item.id}
                        className={`${rowBg} hover:bg-slate-200/50 transition-colors`}
                      >
                        {/* Title & Summary */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-black max-w-[280px] truncate" title={item.title}>
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate max-w-[280px] mt-0.5" title={item.summary}>
                            {item.summary}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-5">
                          {getTypeBadge(item.type)}
                        </td>

                        {/* Audience */}
                        <td className="py-3.5 px-5 font-medium">
                          <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            {item.targetAudience}
                          </span>
                        </td>

                        {/* Placement */}
                        <td className="py-3.5 px-5 text-slate-700 font-medium text-[11px] max-w-[180px] truncate" title={item.locationOrPlacement}>
                          {item.locationOrPlacement}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          {item.status === "PUBLISHED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Updated At */}
                        <td className="py-3.5 px-5 text-slate-600 text-[11px]">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6600] hover:underline"
                          >
                            <span>{item.status === "PUBLISHED" ? "Unpublish" : "Publish"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between border-t border-slate-200/60 px-6 py-4 text-xs bg-[#F6F6F6]">
            <span className="text-[11px] text-slate-600">
              Showing <span className="font-semibold">{paginatedItems.length}</span> of{" "}
              <span className="font-semibold">{filteredItems.length}</span> items
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-black hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <span className="text-[11px] font-medium text-slate-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-black hover:bg-slate-50 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-black space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black font-garet">
                  Create Operational Item
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish a platform broadcast notice or register a new service cluster.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surge Pricing & Severe Weather Advisory"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Classification
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  >
                    <option value="ANNOUNCEMENT">Announcement Banner</option>
                    <option value="SERVICE_ZONE">Service Zone Hub</option>
                    <option value="HELP_ARTICLE">Help Center Article</option>
                    <option value="POLICY">Operational Policy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  >
                    <option value="ALL">Entire Marketplace</option>
                    <option value="CUSTOMERS">Customers Only</option>
                    <option value="KRAFTERS">Krafters Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Placement / Location Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mobile Push + Dashboard Banner"
                  value={newPlacement}
                  onChange={(e) => setNewPlacement(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Summary & Bulletin Body
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of the operational bulletin or coverage note…"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#FF6600] px-5 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operations Standards Bottom Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Marketplace Broadcast & Coverage Protocol
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            Announcements published to the live feed dispatch immediately across mobile push channels and in-app banners. Zone expansions automatically update Krafter matching distance radii within 5 minutes of publication.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/services"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Services Catalog
          </Link>
          <Link
            href="/admin/support"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
}

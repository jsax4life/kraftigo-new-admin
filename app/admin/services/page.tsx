"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Layers,
  Users,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import { useKraftCategories, useKraftHub } from "@/hooks/useKrafts";

interface ServiceItem {
  id: string;
  name: string;
  categoryName: string;
  categoryCode: string;
  description: string;
  registeredKraftersCount: number;
  baseEstimate: string;
  pricingType: "HOURLY" | "FIXED" | "QUOTE";
  isActive: boolean;
  killSwitchActive: boolean;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "srv-01",
    name: "Pipe Leakage & Drainage Repair",
    categoryName: "Plumbing",
    categoryCode: "PLUMB",
    description: "Emergency pipe leak detection, joint replacement, and pressurized drain clearing.",
    registeredKraftersCount: 84,
    baseEstimate: "₦25,000",
    pricingType: "FIXED",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-02",
    name: "Inverter & Solar PV Installation",
    categoryName: "Electrical",
    categoryCode: "ELEC",
    description: "Residential hybrid inverter mounting, lithium battery bank wiring, and load balancing.",
    registeredKraftersCount: 62,
    baseEstimate: "₦65,000",
    pricingType: "QUOTE",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-03",
    name: "Cabinetry & Custom Wardrobes",
    categoryName: "Carpentry",
    categoryCode: "CARP",
    description: "Custom fitted kitchen cabinets, marine board wardrobes, and architectural wood finishes.",
    registeredKraftersCount: 45,
    baseEstimate: "₦45,000",
    pricingType: "QUOTE",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-04",
    name: "HVAC Air Conditioner Servicing",
    categoryName: "HVAC & Cooling",
    categoryCode: "HVAC",
    description: "Split unit chemical wash, Freon R410A gas refill, and condenser coil diagnostics.",
    registeredKraftersCount: 78,
    baseEstimate: "₦18,000",
    pricingType: "FIXED",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-05",
    name: "Automotive Engine Diagnostics",
    categoryName: "Mechanics",
    categoryCode: "MECH",
    description: "OBD-II computer fault code reading, electrical harness check, and suspension inspection.",
    registeredKraftersCount: 39,
    baseEstimate: "₦20,000",
    pricingType: "HOURLY",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-06",
    name: "Interior Satin & POP Painting",
    categoryName: "Painting",
    categoryCode: "PAINT",
    description: "Plaster of Paris surface screeding, primer coating, and washable satin paint application.",
    registeredKraftersCount: 51,
    baseEstimate: "₦35,000",
    pricingType: "QUOTE",
    isActive: true,
    killSwitchActive: false
  },
  {
    id: "srv-07",
    name: "Structural Tile Laying & Grouting",
    categoryName: "Masonry & Tiling",
    categoryCode: "MASON",
    description: "Vitrified porcelain floor tiling, bathroom waterproofing, and granite slab fitting.",
    registeredKraftersCount: 33,
    baseEstimate: "₦30,000",
    pricingType: "FIXED",
    isActive: false,
    killSwitchActive: true
  }
];

const PAGE_SIZE = 8;

export default function ServicesPage() {
  const { data: hubData, isLoading: isHubLoading, refetch: refetchHub } = useKraftHub();
  const { data: catData, isLoading: isCatLoading, refetch: refetchCat } = useKraftCategories();

  const [servicesList, setServicesList] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [activeTab, setActiveTab] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("Plumbing");
  const [newDescription, setNewDescription] = useState("");
  const [newBaseEstimate, setNewBaseEstimate] = useState("₦25,000");
  const [newPricingType, setNewPricingType] = useState<"HOURLY" | "FIXED" | "QUOTE">("FIXED");

  // Populate from Kraft categories if available
  const categories = useMemo(() => {
    if (catData?.categories?.length) {
      return catData.categories;
    }
    return [];
  }, [catData]);

  // Combined metrics
  const metrics = useMemo(() => {
    const totalServices = servicesList.length;
    const activeCount = servicesList.filter((s) => s.isActive && !s.killSwitchActive).length;
    const totalKrafters = servicesList.reduce((acc, s) => acc + s.registeredKraftersCount, 0);
    const categoryCount = catData?.categories?.length || 7;

    return {
      totalServices,
      activeCount,
      totalKrafters,
      categoryCount
    };
  }, [servicesList, catData]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      // Tab filter
      if (activeTab === "ACTIVE" && (!s.isActive || s.killSwitchActive)) return false;
      if (activeTab === "INACTIVE" && (s.isActive && !s.killSwitchActive)) return false;

      // Category filter
      if (selectedCategory !== "ALL" && s.categoryName !== selectedCategory) {
        return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesCat = s.categoryName.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      return true;
    });
  }, [servicesList, activeTab, selectedCategory, search]);

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / PAGE_SIZE));
  const paginatedServices = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredServices.slice(start, start + PAGE_SIZE);
  }, [filteredServices, page]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchHub(), refetchCat()]);
    setIsRefreshing(false);
  };

  const handleToggleKillSwitch = (serviceId: string) => {
    setServicesList((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              killSwitchActive: !s.killSwitchActive,
              isActive: s.killSwitchActive ? true : false
            }
          : s
      )
    );
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService: ServiceItem = {
      id: `srv-${Date.now().toString().slice(-4)}`,
      name: newServiceName.trim(),
      categoryName: newCategoryName,
      categoryCode: newCategoryName.slice(0, 4).toUpperCase(),
      description: newDescription.trim() || "Standard on-demand service offering.",
      registeredKraftersCount: 1,
      baseEstimate: newBaseEstimate.trim() || "₦20,000",
      pricingType: newPricingType,
      isActive: true,
      killSwitchActive: false
    };

    setServicesList((prev) => [newService, ...prev]);
    setIsCreateModalOpen(false);
    setNewServiceName("");
    setNewDescription("");
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    const headers = [
      "Service Name",
      "Category",
      "Code",
      "Active Krafters",
      "Pricing Model",
      "Base Estimate",
      "Status"
    ];
    const rows = filteredServices.map((s) => [
      `"${s.name}"`,
      s.categoryName,
      s.categoryCode,
      s.registeredKraftersCount,
      s.pricingType,
      `"${s.baseEstimate}"`,
      s.killSwitchActive ? "Suspended" : s.isActive ? "Active" : "Draft"
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `services_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Services & Category Management
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Standardize on-demand craft offerings, dispatch kill-switches, and minimum estimate guidelines.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isHubLoading || isCatLoading}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#FF6600]" : "text-slate-600"}`}
            />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Export CSV
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Service
          </button>
        </div>
      </div>

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Offerings */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Total Services
            </span>
            <Wrench className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.totalServices}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Standardized
            </span>
          </div>
        </div>

        {/* Active Categories */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Craft Categories
            </span>
            <Layers className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.categoryCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Sectors Live
            </span>
          </div>
        </div>

        {/* Active Providers */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Enrolled Krafters
            </span>
            <Users className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.totalKrafters}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              Assigned Skills
            </span>
          </div>
        </div>

        {/* Live Status */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Marketplace Availability
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Optimal
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.activeCount} Live
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Ready to Dispatch
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-garet font-[850] text-black">
              Services Catalog
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Standardized offerings available for customer requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Queue Tabs */}
            <div className="inline-flex rounded-lg border border-[#0000001A] bg-white p-0.5 shadow-sm">
              {(["ALL", "ACTIVE", "INACTIVE"] as const).map((tab) => (
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
                  {tab === "ALL" ? "All" : tab === "ACTIVE" ? "Active" : "Suspended"}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#0000001A] bg-white px-3 py-1.5 text-xs font-medium text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="HVAC & Cooling">HVAC & Cooling</option>
              <option value="Mechanics">Mechanics</option>
              <option value="Painting">Painting</option>
              <option value="Masonry & Tiling">Masonry & Tiling</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services or code…"
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
                  <th className="py-3 px-5">Service Name</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Base Estimate</th>
                  <th className="py-3 px-5">Pricing Model</th>
                  <th className="py-3 px-5">Enrolled Krafters</th>
                  <th className="py-3 px-5">Kill Switch</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {paginatedServices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 bg-white">
                      No services found matching current filters.
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service, index) => {
                    const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";

                    return (
                      <tr
                        key={service.id}
                        className={`${rowBg} hover:bg-slate-200/50 transition-colors`}
                      >
                        {/* Name & Desc */}
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-black max-w-[240px] truncate" title={service.name}>
                            {service.name}
                          </div>
                          <div className="text-[11px] text-slate-600 truncate max-w-[240px] mt-0.5" title={service.description}>
                            {service.description}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-5 font-medium">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                            <Tag className="h-3 w-3 text-slate-500" />
                            {service.categoryName}
                          </span>
                        </td>

                        {/* Base Estimate */}
                        <td className="py-3.5 px-5 font-bold font-mono text-black">
                          {service.baseEstimate}
                        </td>

                        {/* Pricing Model */}
                        <td className="py-3.5 px-5 font-semibold text-[11px] text-slate-700">
                          {service.pricingType}
                        </td>

                        {/* Enrolled Krafters */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 font-semibold text-black">
                            <Users className="h-3.5 w-3.5 text-[#FF6600]" />
                            <span>{service.registeredKraftersCount}</span>
                          </div>
                        </td>

                        {/* Kill Switch Toggle */}
                        <td className="py-3.5 px-5">
                          <button
                            type="button"
                            onClick={() => handleToggleKillSwitch(service.id)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            title="Toggle Kill Switch to immediately halt bookings"
                          >
                            {service.killSwitchActive ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                                <ToggleLeft className="h-5 w-5 text-rose-600" />
                                <span>Halted</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <ToggleRight className="h-5 w-5 text-emerald-600" />
                                <span>Active</span>
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Status Pill */}
                        <td className="py-3.5 px-5 text-right">
                          {service.killSwitchActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200/60 px-6 py-4 text-xs bg-[#F6F6F6]">
            <span className="text-[11px] text-slate-600">
              Showing <span className="font-semibold">{paginatedServices.length}</span> of{" "}
              <span className="font-semibold">{filteredServices.length}</span> services
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

      {/* Add New Service Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-black space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-black font-garet">
                  Add Standard Service Offering
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register a standardized craft service into the marketplace taxonomy.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Service Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inverter Wiring & Load Balancing"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Primary Category
                  </label>
                  <select
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="HVAC & Cooling">HVAC & Cooling</option>
                    <option value="Mechanics">Mechanics</option>
                    <option value="Painting">Painting</option>
                    <option value="Masonry & Tiling">Masonry & Tiling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pricing Model
                  </label>
                  <select
                    value={newPricingType}
                    onChange={(e) => setNewPricingType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  >
                    <option value="FIXED">Fixed Base Fee</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="QUOTE">Custom Inspection / Quote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Base Estimate (₦)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₦35,000"
                  value={newBaseEstimate}
                  onChange={(e) => setNewBaseEstimate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-[#F9F9F9] p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Scope & Service Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail scope of work, safety standards, and required tools…"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
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
                  Save Service Offering
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Standards Bottom Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Service Taxonomy & Safety Kill-Switch Standards
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            Activating a Kill-Switch immediately suspends customer booking dispatch for that specific craft without affecting other skills offered by registered Krafters. Use this during localized regulatory audits or trade licensing reviews.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/krafts"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Kraft Hub
          </Link>
          <Link
            href="/admin/krafters"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Krafter Directory
          </Link>
        </div>
      </div>
    </div>
  );
}



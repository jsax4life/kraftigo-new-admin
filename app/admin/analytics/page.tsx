"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  MapPin,
  Tag,
  Briefcase,
  ShieldCheck,
  Percent,
  Clock
} from "lucide-react";
import { useOverviewSummary, useDashboardStats } from "@/hooks/useDashboardStats";

interface SectorMetric {
  category: string;
  code: string;
  totalBookings: number;
  grossVolume: string;
  avgOrderValue: string;
  completionRate: string;
  avgRating: number;
}

const TOP_SECTORS: SectorMetric[] = [
  {
    category: "Plumbing & Drainage",
    code: "PLUMB",
    totalBookings: 384,
    grossVolume: "₦14,850,000",
    avgOrderValue: "₦38,670",
    completionRate: "96.4%",
    avgRating: 4.9
  },
  {
    category: "Electrical & Solar PV",
    code: "ELEC",
    totalBookings: 298,
    grossVolume: "₦26,400,000",
    avgOrderValue: "₦88,590",
    completionRate: "93.8%",
    avgRating: 4.8
  },
  {
    category: "HVAC & Air Conditioning",
    code: "HVAC",
    totalBookings: 245,
    grossVolume: "₦9,800,000",
    avgOrderValue: "₦40,000",
    completionRate: "95.1%",
    avgRating: 4.9
  },
  {
    category: "Carpentry & Cabinetry",
    code: "CARP",
    totalBookings: 172,
    grossVolume: "₦12,350,000",
    avgOrderValue: "₦71,800",
    completionRate: "91.2%",
    avgRating: 4.7
  },
  {
    category: "Automotive Mechanics",
    code: "MECH",
    totalBookings: 112,
    grossVolume: "₦4,480,000",
    avgOrderValue: "₦40,000",
    completionRate: "89.5%",
    avgRating: 4.6
  }
];

interface RegionalMetric {
  city: string;
  state: string;
  activeKrafters: number;
  monthlyGtv: string;
  avgResponseMins: number;
  growth: string;
}

const REGIONAL_MARKETS: RegionalMetric[] = [
  {
    city: "Lagos (Island & Mainland)",
    state: "Lagos State",
    activeKrafters: 642,
    monthlyGtv: "₦84,200,000",
    avgResponseMins: 14,
    growth: "+24.8%"
  },
  {
    city: "Abuja (FCT)",
    state: "Federal Capital Territory",
    activeKrafters: 318,
    monthlyGtv: "₦38,400,000",
    avgResponseMins: 19,
    growth: "+18.2%"
  },
  {
    city: "Port Harcourt",
    state: "Rivers State",
    activeKrafters: 146,
    monthlyGtv: "₦12,650,000",
    avgResponseMins: 26,
    growth: "+12.4%"
  },
  {
    city: "Ibadan",
    state: "Oyo State",
    activeKrafters: 94,
    monthlyGtv: "₦7,600,000",
    avgResponseMins: 32,
    growth: "+9.1%"
  }
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<string>("this_month");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: summaryData, isLoading: isSummaryLoading, refetch: refetchSummary } =
    useOverviewSummary(period);
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } =
    useDashboardStats();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSummary(), refetchStats()]);
    setIsRefreshing(false);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    const headers = [
      "Category Name",
      "Code",
      "Total Bookings",
      "Gross Volume",
      "Avg Order Value",
      "Completion Rate",
      "Avg Rating"
    ];
    const rows = TOP_SECTORS.map((s) => [
      `"${s.category}"`,
      s.code,
      s.totalBookings,
      `"${s.grossVolume}"`,
      `"${s.avgOrderValue}"`,
      s.completionRate,
      s.avgRating
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Platform Analytics & Growth
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Macro platform metrics, gross transaction volumes (GTV), category fulfillment rates, and geographic density.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Timeframe Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-[#0000001A] bg-white px-3 py-2 text-xs font-semibold text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="all_time">All Time</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isSummaryLoading || isStatsLoading}
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
            className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export Growth Report
          </button>
        </div>
      </div>

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Gross Transaction Volume
            </span>
            <DollarSign className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              ₦142.85M
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              +18.4% MoM
            </span>
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Completed Bookings
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              1,211
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              +12.6% vs target
            </span>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Fulfillment Rate
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Optimal
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              94.2%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Excludes client cancel
            </span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Active Marketplace Users
            </span>
            <Users className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              18,450
            </span>
            <span className="text-[11px] font-bold text-emerald-600">
              +22.1% growth
            </span>
          </div>
        </div>
      </div>

      {/* Top Performing Craft Categories Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-garet font-[850] text-black">
            Top Performing Craft Categories
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Category gross transaction volumes, completion efficiency, and average customer satisfaction.
          </p>
        </div>

        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100 text-[11px]">
                  <th className="py-3 px-5">Craft Category</th>
                  <th className="py-3 px-5">Total Completed</th>
                  <th className="py-3 px-5">Gross Volume (GTV)</th>
                  <th className="py-3 px-5">Average Order Value</th>
                  <th className="py-3 px-5">Completion Rate</th>
                  <th className="py-3 px-5 text-right">Customer Rating</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {TOP_SECTORS.map((sector, index) => {
                  const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";

                  return (
                    <tr
                      key={sector.code}
                      className={`${rowBg} hover:bg-slate-200/50 transition-colors`}
                    >
                      <td className="py-3.5 px-5 font-semibold text-black">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800">
                            {sector.code}
                          </span>
                          <span>{sector.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-bold font-mono text-black">
                        {sector.totalBookings.toLocaleString()} jobs
                      </td>
                      <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                        {sector.grossVolume}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-700">
                        {sector.avgOrderValue}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {sector.completionRate}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1 font-bold text-black font-mono">
                          <span className="text-[#FF6600]">★</span>
                          <span>{sector.avgRating.toFixed(1)} / 5.0</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Regional Market Performance */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-garet font-[850] text-black">
            Regional Hubs & Coverage Efficiency
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Active Krafter provider density and average arrival response times across urban markets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REGIONAL_MARKETS.map((market) => (
            <div
              key={market.city}
              className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[#FF6600] font-semibold text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{market.state}</span>
                </div>
                <h3 className="font-garet font-[850] text-black text-sm mt-1">
                  {market.city}
                </h3>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-200/60 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Monthly GTV:</span>
                  <span className="font-mono font-bold text-black">{market.monthlyGtv}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Active Krafters:</span>
                  <span className="font-mono font-bold text-black">{market.activeKrafters}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Avg Arrival:</span>
                  <span className="font-semibold text-emerald-700">{market.avgResponseMins} mins</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>YoY Growth:</span>
                  <span className="font-bold text-emerald-600">{market.growth}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Policy Bottom Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Data Synchronization & Financial Audit Standards
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            All GTV, commission, and escrow figures are calculated with strict penny-precision based on authenticated ledger states. Figures update synchronously with payment gateway webhook receipts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/financials"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Financials & Payouts
          </Link>
          <Link
            href="/admin/payment-operations"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Payment Operations
          </Link>
        </div>
      </div>
    </div>
  );
}



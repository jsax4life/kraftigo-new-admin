"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Info,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import Image from "next/image";
import { KrafterLocationsPanel } from "@/components/krafters/krafter-locations-panel";
import { PaginationBar } from "@/components/ui/pagination-bar";
import {
  useDashboardStats,
  useOverviewSummary,
  useLiveBookings,
  useCriticalPulse,
  useOverviewKrafterVerificationQueue
} from "@/hooks/useDashboardStats";
import { dashboardService } from "@/services/dashboard.service";
import { useAlertModal } from "@/components/ui/alert-modal";
import type { OverviewSummaryPeriod } from "@/types/dashboard";

function formatCount(value: number | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString();
}





// --- TOOLTIPS & DOTS ---
const CustomTooltip = ({
  active,
  payload,
  isRevenue,
  currentLabel,
  previousLabel
}: any) => {
  if (active && payload && payload.length) {
    const point = payload[0]?.payload;
    if (!point) return null;
    const currentVal = Number(
      isRevenue ? point.revenueCurrent ?? 0 : point.activeKraftsCurrent ?? 0
    );
    const prevVal = Number(
      isRevenue ? point.revenuePrevious ?? 0 : point.activeKraftsPrevious ?? 0
    );

    return (
      <div className="bg-white px-3 py-2.5 shadow-lg border border-slate-200/90 rounded-xl text-xs space-y-1.5 min-w-[190px]">
        <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 text-[11px]">
          {point.monthLabel ?? point.month}
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-[#FF6600]" />
            <span className="truncate max-w-[100px]">{currentLabel ?? "Current"}:</span>
          </span>
          <span className="font-bold text-slate-900">
            {isRevenue ? `£${currentVal.toLocaleString()}` : `${currentVal.toLocaleString()} Krafts`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="truncate max-w-[100px]">{previousLabel ?? "Previous"}:</span>
          </span>
          <span className="font-medium text-slate-600">
            {isRevenue ? `£${prevVal.toLocaleString()}` : `${prevVal.toLocaleString()} Krafts`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey } = props;
  if (dataKey === "revenue" && payload.revenue === 9000 && payload.name === "Mar") {
    return (
      <svg x={cx - 5} y={cy - 5} width={10} height={10} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="5" r="3.5" fill="white" stroke="#333333" strokeWidth="3" />
      </svg>
    );
  }
  return null;
};

const CustomActiveDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <line x1={cx} y1={cy - 60} x2={cx} y2={cy + 60} stroke="#333333" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="4" fill="white" stroke="#333333" strokeWidth="2.5" />
    </g>
  );
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardStats();

  const [summaryPeriod, setSummaryPeriod] =
    useState<OverviewSummaryPeriod>("this_month");
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError
  } = useOverviewSummary(summaryPeriod);

  const [livePage, setLivePage] = useState(1);
  const [liveSearch, setLiveSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const {
    data: liveBookingsData,
    isLoading: isLiveLoading,
    isError: isLiveError,
    error: liveError
  } = useLiveBookings({
    page: livePage,
    limit: 5,
    search: liveSearch.trim() || undefined,
    activeOnly: activeOnly ? true : undefined
  });

  const liveItems = liveBookingsData?.items ?? [];
  const liveTotal = liveBookingsData?.meta?.total ?? 0;
  const liveTotalPages =
    liveBookingsData?.meta?.totalPages ?? Math.max(1, Math.ceil(liveTotal / 5));

  // Critical Pulse chart query
  const [pulseMonths, setPulseMonths] = useState<number>(7);
  const [pulseMetric, setPulseMetric] = useState<"revenue" | "krafts">("revenue");

  const {
    data: pulseData,
    isLoading: isPulseLoading
  } = useCriticalPulse({ months: pulseMonths });

  const pulsePoints = pulseData?.points ?? [];
  const currentSeriesLabel =
    pulseData?.comparison?.currentSeriesLabel ?? "This Month";
  const previousSeriesLabel =
    pulseData?.comparison?.previousSeriesLabel ?? "Last Month";

  const {
    data: verificationQueueData,
    isLoading: isQueueLoading
  } = useOverviewKrafterVerificationQueue({ limit: 5 });

  const { showAlert, AlertModalComponent } = useAlertModal();
  const [isExportingLive, setIsExportingLive] = useState(false);

  const handleExportLiveBookings = async () => {
    try {
      setIsExportingLive(true);
      await dashboardService.exportLiveBookingsCsv({
        search: liveSearch.trim() || undefined,
        activeOnly: activeOnly ? true : undefined
      });
    } catch (err: any) {
      showAlert({
        title: "Export Failed",
        message: err?.message ?? "An unexpected error occurred while exporting live bookings.",
        type: "error"
      });
    } finally {
      setIsExportingLive(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-slate-900">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Platform performance metrics, operational queue, and live activities.
          </p>
        </div>
        <select
          value={summaryPeriod}
          onChange={(e) => setSummaryPeriod(e.target.value as OverviewSummaryPeriod)}
          className="rounded-md bg-[#F6F6F6] px-3 py-1.5 text-[12px] text-black font-semibold border-none outline-none cursor-pointer hover:bg-slate-200 transition-colors"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      {(isError || isSummaryError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
          Failed to load live platform stats: {summaryError?.message || error?.message || "Unknown error"}
        </div>
      )}

      {/* Primary Metrics Row (Connected to GET /api/admin/overview/summary) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Revenue</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : `£${(summaryData?.metrics?.totalRevenue?.value ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {summaryData?.range?.label ?? "This month"}
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Users</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-mabry font-extrabold text-slate-900">
              {isSummaryLoading
                ? "…"
                : formatCount(summaryData?.metrics?.activeUsers?.value)}
            </span>
            {summaryData?.metrics?.activeUsers?.changePercent != null && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                {summaryData.metrics.activeUsers.changePercent > 0 ? "+" : ""}
                {summaryData.metrics.activeUsers.changePercent}%
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Total registered: {isLoading ? "…" : formatCount(data?.totalUsers)}
          </div>
        </div>

        {/* Total Active Krafts */}
        <Link
          href="/admin/bookings"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 transition-colors hover:border-[#FF6600]/40"
        >
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Active Krafts</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : formatCount(summaryData?.metrics?.totalActiveKrafts?.value)}
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-[#FF6600]"
              style={{
                width: `${Math.max(
                  5,
                  Math.min(
                    100,
                    summaryData?.metrics?.totalActiveKrafts?.utilizationPercent ?? 0
                  )
                )}%`
              }}
            />
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">
            {summaryData?.metrics?.totalActiveKrafts?.registeredKrafters ?? 0} registered krafters
          </div>
        </Link>

        {/* Open Support Tickets */}
        <Link
          href="/admin/disputes"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 transition-colors hover:border-[#FF6600]/40"
        >
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Open Support Tickets</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : formatCount(summaryData?.metrics?.openSupportTickets?.value)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {summaryData?.metrics?.openSupportTickets?.disputesOpen ?? 0} disputes · {summaryData?.metrics?.openSupportTickets?.operationalAlertsOpen ?? 0} alerts
          </div>
        </Link>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/krafters"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs font-medium hover:bg-slate-100 transition-colors"
        >
          <span className="text-slate-500">All Krafters:</span>{" "}
          <strong className="text-sm text-black">{isLoading ? "…" : formatCount(data?.allKrafters)}</strong>
        </Link>
        <Link
          href="/admin/customers"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs font-medium hover:bg-slate-100 transition-colors"
        >
          <span className="text-slate-500">All Customers:</span>{" "}
          <strong className="text-sm text-black">{isLoading ? "…" : formatCount(data?.allCustomers)}</strong>
        </Link>
        <Link
          href="/admin/krafters?tab=intent"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs font-medium hover:bg-slate-100 transition-colors"
        >
          <span className="text-slate-500">Intent Krafters:</span>{" "}
          <strong className="text-sm text-black">{isLoading ? "…" : formatCount(data?.intentKrafters)}</strong>
        </Link>
        <Link
          href="/admin/waitlist"
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs font-medium hover:bg-slate-100 transition-colors flex items-center justify-between"
        >
          <span className="text-slate-500">Waitlist Signups:</span>{" "}
          <span className="font-bold text-[#FF6600]">View List →</span>
        </Link>
      </div>

      {/* Critical Pulse Chart Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-garet font-[850] text-black">Critical Pulse</h2>
          <select
            value={pulseMonths}
            onChange={(e) => setPulseMonths(Number(e.target.value))}
            className="rounded-md bg-[#F6F6F6] px-3 py-1.5 text-[12px] text-black font-semibold border-none outline-none cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={7}>Last 7 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>

        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 h-[400px] flex flex-col">
          <div className="flex items-center gap-4 mb-8 mt-2">
            <button
              onClick={() => setPulseMetric("revenue")}
              className={`rounded-md px-3 py-1 text-[13px] font-bold transition-all ${
                pulseMetric === "revenue"
                  ? "bg-[#FF6600] text-white shadow-sm"
                  : "text-black hover:text-[#FF6600]"
              }`}
            >
              Total Revenue
            </button>
            <button
              onClick={() => setPulseMetric("krafts")}
              className={`rounded-md px-3 py-1 text-[13px] font-bold transition-all ${
                pulseMetric === "krafts"
                  ? "bg-[#FF6600] text-white shadow-sm"
                  : "text-black hover:text-[#FF6600]"
              }`}
            >
              Total active Krafts
            </button>
          </div>

          <div className="flex items-center gap-8 mb-6 ml-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-400" /> {previousSeriesLabel}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#FF6600]" /> {currentSeriesLabel}
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            {isPulseLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Loading critical pulse chart…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={pulsePoints}
                  margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6600" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="monthLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#666" }}
                    tickFormatter={(val) =>
                      val === 0
                        ? "0"
                        : pulseMetric === "revenue"
                        ? `£${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`
                        : `${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        isRevenue={pulseMetric === "revenue"}
                        currentLabel={currentSeriesLabel}
                        previousLabel={previousSeriesLabel}
                      />
                    }
                    cursor={false}
                  />
                  {/* Dotted grey line for previous period comparison */}
                  <Area
                    type="monotone"
                    dataKey={
                      pulseMetric === "revenue"
                        ? "revenuePrevious"
                        : "activeKraftsPrevious"
                    }
                    stroke="#999999"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fill="none"
                    dot={false}
                    activeDot={false}
                  />
                  {/* Solid orange line for current period */}
                  <Area
                    type="monotone"
                    dataKey={
                      pulseMetric === "revenue"
                        ? "revenueCurrent"
                        : "activeKraftsCurrent"
                    }
                    stroke="#FF6600"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={<CustomActiveDot />}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Live Booking Monitor */}
      <div className="pt-4">
        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <h2 className="text-xl font-garet font-[850] text-black">Live Booking Monitor</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportLiveBookings}
                disabled={isExportingLive}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isExportingLive ? "Exporting…" : "Export"}
                <Image src="/export.svg" alt="Export CSV" height={14} width={14} />
              </button>
              <button
                onClick={() => {
                  setActiveOnly((prev) => !prev);
                  setLivePage(1);
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeOnly
                    ? "border-[#FF6600] bg-[#FFF0E5] text-[#FF6600]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {activeOnly ? "Active Bookings" : "All Bookings"}
              </button>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={liveSearch}
                  onChange={(e) => {
                    setLiveSearch(e.target.value);
                    setLivePage(1);
                  }}
                  placeholder="Search bookings..."
                  className="w-64 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-4 text-xs outline-none focus:border-[#FF6600]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Customer & Krafter</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLiveLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">
                      Loading live bookings…
                    </td>
                  </tr>
                ) : isLiveError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-rose-500">
                      Failed to load bookings: {liveError?.message ?? "Unknown error"}
                    </td>
                  </tr>
                ) : liveItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">
                      No live bookings found.
                    </td>
                  </tr>
                ) : (
                  liveItems.map((item, index) => {
                    const bookingCode =
                      item.code || item.bookingReference || `#BK-${item.id.slice(0, 6)}`;
                    const names =
                      item.name ||
                      (item.customerName && item.krafterName
                        ? `${item.customerName} & ${item.krafterName}`
                        : item.customerName || item.krafterName || "Customer & Krafter");
                    const serviceName = item.service || item.jobTitle || "General Service";
                    const valueDisplay =
                      item.value != null
                        ? String(item.value).startsWith("£") || String(item.value).startsWith("$")
                          ? item.value
                          : `£${item.value}`
                        : item.amount != null
                        ? `£${item.amount}`
                        : item.totalPrice != null
                        ? `£${item.totalPrice}`
                        : "—";
                    const statusText = item.displayStatus || item.status || "PENDING";
                    const actionLabel =
                      item.suggestedAction === "retry_payment"
                        ? "Retry Payment"
                        : item.suggestedAction === "view_details"
                        ? "View Details"
                        : item.action || "View Details";
                    const isRetry =
                      item.suggestedAction === "retry_payment" ||
                      item.actionColor === "text-[#FF6600]";

                    return (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                      >
                        <td className="px-6 py-4 font-semibold text-black">{bookingCode}</td>
                        <td className="px-6 py-4 font-medium text-black">{names}</td>
                        <td className="px-6 py-4 text-black">{serviceName}</td>
                        <td className="px-6 py-4 font-bold text-black">{valueDisplay}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              statusText.toLowerCase().includes("finish") ||
                              statusText.toLowerCase().includes("complete")
                                ? "bg-emerald-100 text-emerald-700"
                                : statusText.toLowerCase().includes("progress") ||
                                  statusText.toLowerCase().includes("start")
                                ? "bg-blue-100 text-blue-700"
                                : statusText.toLowerCase().includes("fail") ||
                                  statusText.toLowerCase().includes("cancel")
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/bookings?search=${encodeURIComponent(item.id)}`}
                            className={`font-bold hover:underline ${
                              isRetry ? "text-[#FF6600]" : "text-black"
                            }`}
                          >
                            {actionLabel}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {liveTotal > 0 && (
            <PaginationBar
              page={livePage}
              totalPages={liveTotalPages}
              total={liveTotal}
              pageSize={5}
              onPageChange={setLivePage}
              isLoading={isLiveLoading}
            />
          )}
        </div>
      </div>

      {/* Krafter Verification Queue */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-garet font-[850] text-black">Krafter Verification Queue</h2>
            {verificationQueueData?.total != null && (
              <span className="rounded-full bg-[#FF6600]/10 px-2.5 py-0.5 text-xs font-bold text-[#FF6600]">
                {verificationQueueData.total}
              </span>
            )}
          </div>
          <Link href="/admin/work-eligibility" className="flex items-center gap-1 text-xs font-semibold text-[#FF6600] hover:underline">
            See All Queue <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-sm">
          {isQueueLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#FF6600]" />
              Loading krafter verification queue...
            </div>
          ) : verificationQueueData?.items && verificationQueueData.items.length > 0 ? (
            <div className="flex flex-col">
              {verificationQueueData.items.map((item: any, idx: number) => {
                const displayName = item.krafterName || item.name || item.fullName || "Krafter";
                const displayRole = item.trade || item.category || item.role || item.documentType || "Trade Professional";
                const itemId = item.id || item.krafterId || item.userId || idx;
                const krafterUrl = item.id
                  ? `/admin/work-eligibility/${item.id}`
                  : item.krafterId
                  ? `/admin/krafters/${item.krafterId}`
                  : "/admin/work-eligibility";

                return (
                  <div
                    key={itemId}
                    className={`flex items-center justify-between px-6 py-3 border-b border-[#0000001A] last:border-b-0 ${idx % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-[#FF6600] font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[12px] font-extrabold text-black">{displayName}</div>
                        <div className="text-[11px] font-medium text-slate-700">{displayRole}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={krafterUrl}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0000FF] text-white hover:bg-blue-700 transition-colors"
                        title="Review Krafter Document"
                      >
                        <Image src="/file.svg" alt="Review" height={20} width={20} className="h-4 w-4 invert" />
                      </Link>
                      <Link
                        href={krafterUrl}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6600] text-white hover:bg-orange-600 transition-colors"
                        title="Inspect & Approve"
                      >
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No Krafters currently pending verification in the queue.
            </div>
          )}
        </div>
      </div>

      {/* Krafter Locations Panel from incoming updates */}
      <KrafterLocationsPanel />

      {/* Reusable Alert / Error Modal */}
      <AlertModalComponent />
    </div>
  );
}

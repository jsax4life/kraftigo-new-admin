"use client";

import React, { useState } from "react";
import {
  Info,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Check
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

// --- DUMMY DATA ---
const chartData = [
  { name: "Jan", revenue: 12000, krafts: 5000 },
  { name: "Feb", revenue: 15000, krafts: 14000 },
  { name: "", revenue: 6000, krafts: 13500 }, // mid points
  { name: "Mar", revenue: 9000, krafts: 13000 },
  { name: "", revenue: 14500, krafts: 21000 },
  { name: "Apr", revenue: 14000, krafts: 8000 },
  { name: "", revenue: 25000, krafts: 7000 },
  { name: "May", revenue: 24000, krafts: 6500 },
  { name: "", revenue: 30000, krafts: 15500 },
  { name: "Jun", revenue: 21000, krafts: 13000 },
  { name: "", revenue: 24000, krafts: 25000 },
  { name: "Jul", revenue: 17500, krafts: 26000 },
  { name: "", revenue: 23000, krafts: 28000 },
  { name: "", revenue: 24000, krafts: 31000 },
];

const liveBookings = [
  { id: 1, name: "Edith Booked Ray", code: "#BK-239839", service: "Cooking", value: "$100", status: "Started", action: "View Details" },
  { id: 2, name: "Marcus R Booked Peace R", code: "#BK-239839", service: "Cooking", value: "$323", status: "Finished", action: "View Details" },
  { id: 3, name: "Edith Booked Ray", code: "#BK-239839", service: "Plumbing", value: "$433", status: "Payment Failed", action: "Retry Payment", actionColor: "text-[#FF6600]" },
  { id: 4, name: "Marcus R Booked Peace R", code: "#BK-239839", service: "Wood working", value: "$32", status: "Pending", action: "View Details" },
  { id: 5, name: "Edith Booked Ray", code: "#BK-239839", service: "Yard Work", value: "$1000", status: "In Transit", action: "View Details" },
];

const verificationQueue = [
  { id: 1, name: "Natelie Gates", role: "Master Plumber" },
  { id: 2, name: "Natelie Gates", role: "Master Plumber" },
  { id: 3, name: "Natelie Gates", role: "Master Plumber" },
  { id: 4, name: "Natelie Gates", role: "Master Plumber" },
  { id: 5, name: "Natelie Gates", role: "Master Plumber" },
];

// --- COMPONENTS ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-2 py-1 shadow-md border border-slate-100 rounded text-lg font-medium text-slate-800 flex items-center">
        {payload[0].value.toLocaleString()}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload, dataKey } = props;

  // Highlight only the specific 'Mar' coordinate as per the mockup
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
      {/* Vertical line through dot */}
      <line x1={cx} y1={cy - 60} x2={cx} y2={cy + 60} stroke="#333333" strokeWidth="1" />
      <circle cx={cx} cy={cy} r="4" fill="white" stroke="#333333" strokeWidth="2.5" />
    </g>
  );
};


export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12 font-sans bg-white text-slate-900">
      {/* Top Controls (Dropdown in Top Right of section) */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-md bg-[#F6F6F6] px-3 py-1.5 text-[12px] text-black font-medium hover:bg-slate-200 transition-colors">
          This Month <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Total Revenue
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">£7,572,090</div>
        </div>
        {/* Card 2 */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Active Users
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">2,090</div>
        </div>
        {/* Card 3 */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Total active Krafts
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">190</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-[35%] bg-[#FF6600]" />
          </div>
        </div>
        {/* Card 4 */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            Open support tickets.
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">330</div>
        </div>
      </div>

      {/* Critical Pulse Chart Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-garet font-[850] text-black">Critical Pulse</h2>
          <button className="flex items-center gap-2 rounded-md bg-[#F6F6F6] px-3 py-1.5 text-[12px] text-black font-medium hover:bg-slate-200 transition-colors">
            This Month <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 h-[400px] flex flex-col">
          <div className="flex items-center gap-6 mb-8 mt-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#FF6600] px-3 py-1 text-[14px] font-bold text-white">
                Total Revenue
              </span>
            </div>
            <div className="flex items-center gap-2 text-[14px] font-bold text-black">
              Total active Krafts
            </div>
          </div>

          <div className="flex items-center gap-8 mb-6 ml-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-400" /> Last Month
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#FF6600]" /> This Month
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#666" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#666" }}
                  tickFormatter={(val) => val === 0 ? "0" : `${val / 1000}K`}
                  ticks={[0, 10000, 20000, 30000]}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                {/* Dotted grey line for active krafts */}
                <Area
                  type="monotone"
                  dataKey="krafts"
                  stroke="#999999"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="none"
                  dot={false}
                  activeDot={false}
                />
                {/* Solid orange line for revenue */}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF6600"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Booking Monitor */}
      <div className="pt-4">
        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <h2 className="text-xl font-garet font-[850] text-black">Live Booking Monitor</h2>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                Export <Image src='/export.svg' alt="image" height={16} width={16} />
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                Filters <ChevronDown className="h-3 w-3" />
              </button>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone number, or user ID"
                  className="w-80 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-xs outline-none placeholder:text-slate-400"
                />
                <div className="absolute right-2 text-slate-300 text-[10px] bg-white border border-slate-200 rounded px-1.5 leading-tight">
                  /
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking Detail</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Value</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {liveBookings.map((booking, index) => (
                  <tr
                    key={booking.id}
                    className={`${index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-black">{booking.name}</div>
                      <div className="text-[10px] text-black font-bold">{booking.code}</div>
                    </td>
                    <td className="px-6 py-4 text-black">{booking.service}</td>
                    <td className="px-6 py-4 text-black">{booking.value}</td>
                    <td className="px-6 py-4 text-black">{booking.status}</td>
                    <td className="px-6 py-4">
                      <button className={`font-bold text-[12px] ${booking.actionColor || "text-slate-900"} hover:opacity-80`}>
                        {booking.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-xs">
            <div className="font-bold text-slate-900">Showing 1-5 of 300</div>
            <div className="flex items-center gap-1">
              <button className="flex h-6 w-16 items-center justify-center rounded bg-[#FF6600] font-medium text-white">1</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">2</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">3</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">4</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">5</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Krafter Verification Queue */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-garet font-extrabold text-black">Krafter Verifaction Queue</h2>
          <button className="flex items-center gap-1 text-xs hover:underline">
            See All (23 Pending) <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-sm">
          <div className="bg-[#F8F9FA] px-6 py-4 border-b border-slate-100">
            <span className="text-[11px] font-medium text-slate-500">Name</span>
          </div>
          <div className="flex flex-col">
            {verificationQueue.map((item, index) => (
              <div
                key={item.id}
                className='flex items-center justify-between px-6 py-3 border-b border-[#0000001A]'
              >
                <div className="flex items-center gap-3">
                  <Image src="/images/login.jpg" alt="Avatar" height={100} width={100} className="rounded-[8px] w-12 h-12 object-cover  " />
                  <div>
                    <div className="text-[12px] font-extrabold text-black">{item.name}</div>
                    <div className="text-[11px] font-medium text-slate-700">{item.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0000FF] text-white hover:bg-blue-700 transition-colors">
                    <Image src="/file.svg" alt="" height={100} width={100} className='h-5 w-5' />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF6600] text-white hover:bg-orange-600 transition-colors">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-xs">
            <div className="font-bold text-slate-900">Showing 1-5 of 300</div>
            <div className="flex items-center gap-1">
              <button className="flex h-6 w-16 items-center justify-center rounded bg-[#FF6600] font-medium text-white">1</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">2</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">3</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">4</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">5</button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-400 hover:bg-slate-50">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button className="flex h-6 w-16 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

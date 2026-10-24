"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Headphones,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  Briefcase
} from "lucide-react";

export type TicketPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketCategory =
  | "BILLING"
  | "BOOKING"
  | "ACCOUNT"
  | "QUALITY"
  | "TECHNICAL";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  requesterName: string;
  requesterRole: "CUSTOMER" | "KRAFTER";
  requesterEmail: string;
  requesterPhone?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedStaff?: string;
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "sup-001",
    ticketNumber: "TICK-8921",
    requesterName: "Amara Okonkwo",
    requesterRole: "CUSTOMER",
    requesterEmail: "amara.okonkwo@example.com",
    requesterPhone: "+234 803 123 4567",
    category: "BILLING",
    subject: "Escrow payment charged twice for plumbing service",
    description:
      "I booked plumbing installation yesterday and noticed two separate authorization holds on my card for ₦35,000 each. Kindly reverse the duplicate charge.",
    priority: "URGENT",
    status: "OPEN",
    assignedStaff: "Chidi Nnamani",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    messagesCount: 3
  },
  {
    id: "sup-002",
    ticketNumber: "TICK-8920",
    requesterName: "Ibrahim Sani",
    requesterRole: "KRAFTER",
    requesterEmail: "ibrahim.carpentry@example.com",
    requesterPhone: "+234 812 987 6543",
    category: "ACCOUNT",
    subject: "Identity verification document rejected without reason",
    description:
      "My national identity slip was uploaded three days ago but shows rejected. All information matches my profile. Please assist in re-evaluating.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    assignedStaff: "Folake Adebayo",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    messagesCount: 4
  },
  {
    id: "sup-003",
    ticketNumber: "TICK-8919",
    requesterName: "Grace Eze",
    requesterRole: "CUSTOMER",
    requesterEmail: "grace.eze@example.com",
    requesterPhone: "+234 802 444 5555",
    category: "BOOKING",
    subject: "Krafter did not arrive for scheduled electrical diagnostic",
    description:
      "The booking was set for 10:00 AM today in Lekki Phase 1. The Krafter did not arrive and has not responded to in-app messages.",
    priority: "HIGH",
    status: "OPEN",
    assignedStaff: "Chidi Nnamani",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    messagesCount: 2
  },
  {
    id: "sup-004",
    ticketNumber: "TICK-8918",
    requesterName: "David Alabi",
    requesterRole: "KRAFTER",
    requesterEmail: "david.mechanic@example.com",
    requesterPhone: "+234 701 555 7890",
    category: "TECHNICAL",
    subject: "Arrival PIN not submitting on mobile application",
    description:
      "When I enter the 4-digit arrival PIN provided by the client, the submit button spins and returns a network timeout error.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    assignedStaff: "Tunde Bakare",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    messagesCount: 5
  },
  {
    id: "sup-005",
    ticketNumber: "TICK-8917",
    requesterName: "Ngozi Adeleke",
    requesterRole: "CUSTOMER",
    requesterEmail: "ngozi.adeleke@example.com",
    requesterPhone: "+234 809 333 1111",
    category: "QUALITY",
    subject: "Inquiry on service satisfaction guarantee",
    description:
      "I would like to inquire about the coverage under the Kraftigo service satisfaction guarantee before authorizing milestone release.",
    priority: "LOW",
    status: "RESOLVED",
    assignedStaff: "Folake Adebayo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    messagesCount: 6
  },
  {
    id: "sup-006",
    ticketNumber: "TICK-8916",
    requesterName: "Emmanuel Johnson",
    requesterRole: "KRAFTER",
    requesterEmail: "emmanuel.aircon@example.com",
    requesterPhone: "+234 805 777 8899",
    category: "BILLING",
    subject: "Bank payout account details modification request",
    description:
      "I recently changed my business banking account from GTBank to Zenith Bank and need help verifying the new account for weekly disbursements.",
    priority: "MEDIUM",
    status: "RESOLVED",
    assignedStaff: "Chidi Nnamani",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    messagesCount: 4
  }
];

const PAGE_SIZE = 10;

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [activeTab, setActiveTab] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = tickets.length;
    let openCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let urgentCount = 0;

    for (const t of tickets) {
      if (t.status === "OPEN") openCount++;
      if (t.status === "IN_PROGRESS") inProgressCount++;
      if (t.status === "RESOLVED") resolvedCount++;
      if (t.priority === "URGENT") urgentCount++;
    }

    return {
      total,
      openCount,
      inProgressCount,
      resolvedCount,
      urgentCount
    };
  }, [tickets]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Tab filter
      if (activeTab !== "ALL" && t.status !== activeTab) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && t.category !== categoryFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) {
        return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesNumber = t.ticketNumber.toLowerCase().includes(q);
        const matchesName = t.requesterName.toLowerCase().includes(q);
        const matchesEmail = t.requesterEmail.toLowerCase().includes(q);
        const matchesSubject = t.subject.toLowerCase().includes(q);
        if (!matchesNumber && !matchesName && !matchesEmail && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, activeTab, categoryFilter, priorityFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const paginatedTickets = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTickets.slice(start, start + PAGE_SIZE);
  }, [filteredTickets, page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    const headers = [
      "Ticket Number",
      "Requester Name",
      "Role",
      "Email",
      "Category",
      "Subject",
      "Priority",
      "Status",
      "Assigned Staff",
      "Created At"
    ];
    const rows = filteredTickets.map((t) => [
      t.ticketNumber,
      `"${t.requesterName}"`,
      t.requesterRole,
      t.requesterEmail,
      t.category,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.assignedStaff ?? "Unassigned",
      t.createdAt
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `support_tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExporting(false);
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) =>
        prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null
      );
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messagesCount: t.messagesCount + 1,
              updatedAt: new Date().toISOString(),
              status: t.status === "OPEN" ? "IN_PROGRESS" : t.status
            }
          : t
      )
    );
    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messagesCount: prev.messagesCount + 1,
            status: prev.status === "OPEN" ? "IN_PROGRESS" : prev.status,
            updatedAt: new Date().toISOString()
          }
        : null
    );
    setReplyMessage("");
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold text-orange-800">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Resolved
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold text-sky-800">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
            In Progress
          </span>
        );
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Open
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Customer Support & Inquiries
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Manage customer and Krafter help tickets, inquiries, escalation cases, and response SLAs.
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
            onClick={handleExportCSV}
            disabled={isExporting || filteredTickets.length === 0}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Total Tickets
            </span>
            <Headphones className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.total}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              All Channels
            </span>
          </div>
        </div>

        {/* Open Queue */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Open Tickets
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Awaiting Action
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.openCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {metrics.openCount > 0 ? "Requires First Reply" : "Inbox Zero"}
            </span>
          </div>
        </div>

        {/* Urgent Escalations */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Urgent Escalations
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              SLA Risk
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.urgentCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Target &lt; 2 hrs
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Under Investigation
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              Active
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {metrics.inProgressCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Staff Assigned
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-garet font-[850] text-black">
              Support Inquiries Queue
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              List of user assistance tickets, questions, and payment discrepancies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Queue Tabs */}
            <div className="inline-flex rounded-lg border border-[#0000001A] bg-white p-0.5 shadow-sm">
              {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((tab) => (
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
                    : tab === "OPEN"
                    ? "Open"
                    : tab === "IN_PROGRESS"
                    ? "In Progress"
                    : "Resolved"}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#0000001A] bg-white px-3 py-1.5 text-xs font-medium text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="BILLING">Billing & Escrow</option>
              <option value="BOOKING">Booking & Dispatch</option>
              <option value="ACCOUNT">Account & Verification</option>
              <option value="QUALITY">Quality & Satisfaction</option>
              <option value="TECHNICAL">Technical App Issues</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-[#0000001A] bg-white px-3 py-1.5 text-xs font-medium text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket, name, email…"
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

        {/* Tickets Table */}
        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100 text-[11px]">
                  <th className="py-3 px-5">Ticket</th>
                  <th className="py-3 px-5">Requester</th>
                  <th className="py-3 px-5">Subject & Preview</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 bg-white">
                      No support tickets found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket, index) => {
                    const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";

                    return (
                      <tr
                        key={ticket.id}
                        className={`${rowBg} hover:bg-slate-200/50 transition-colors`}
                      >
                        {/* Ticket Number & Category */}
                        <td className="py-3.5 px-5 font-semibold text-black">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                              {ticket.category}
                            </span>
                          </div>
                        </td>

                        {/* Requester */}
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 font-semibold text-black">
                              <span>{ticket.requesterName}</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  ticket.requesterRole === "KRAFTER"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {ticket.requesterRole}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                              {ticket.requesterEmail}
                            </span>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-5 max-w-[280px]">
                          <div className="truncate font-semibold text-black" title={ticket.subject}>
                            {ticket.subject}
                          </div>
                          <div
                            className="text-[11px] text-slate-600 truncate mt-0.5"
                            title={ticket.description}
                          >
                            {ticket.description}
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-5">
                          {getPriorityBadge(ticket.priority)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          {getStatusBadge(ticket.status)}
                        </td>

                        {/* Created At */}
                        <td className="py-3.5 px-5 text-slate-600 font-medium text-[11px]">
                          <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(ticket.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6600] hover:underline"
                          >
                            <span>View Ticket</span>
                            <ArrowUpRight className="h-3 w-3" />
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
              Showing{" "}
              <span className="font-semibold">{paginatedTickets.length}</span> of{" "}
              <span className="font-semibold">{filteredTickets.length}</span> results
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

      {/* Ticket Details & Response Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-black space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {selectedTicket.ticketNumber}
                  </span>
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <h3 className="text-lg font-bold text-black font-garet mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Requester & Category Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Requester Details
                </span>
                <div className="font-bold text-black flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span>{selectedTicket.requesterName}</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    ({selectedTicket.requesterRole})
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span>{selectedTicket.requesterEmail}</span>
                </div>
                {selectedTicket.requesterPhone && (
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{selectedTicket.requesterPhone}</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ticket Metadata
                </span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-black">{selectedTicket.category}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Assigned Staff:</span>
                  <span className="font-semibold text-black">
                    {selectedTicket.assignedStaff ?? "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Created:</span>
                  <span className="font-semibold text-black">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Inquiry Description
              </span>
              <div className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </div>
            </div>

            {/* Status Change Control */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-xs font-semibold text-slate-600">
                Update Ticket Status:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, "OPEN")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedTicket.status === "OPEN"
                      ? "bg-amber-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, "IN_PROGRESS")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedTicket.status === "IN_PROGRESS"
                      ? "bg-sky-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedTicket.status === "RESOLVED"
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Reply Input */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Send Response to User
              </span>
              <textarea
                rows={3}
                placeholder="Type your official support response here…"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F9F9F9] p-3 text-xs text-black outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  {selectedTicket.messagesCount} message history
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support SLA & Operations Policy Bottom Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Support Response Standards & Operational SLAs
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            Support staff must adhere to our first-response standard: Urgent escrow/payment inquiries must receive an acknowledgment within 30 minutes, and general booking inquiries within 2 hours. Severe disputes must be escalated to the formal Dispute Adjudication Queue.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/disputes"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Disputes Queue
          </Link>
          <Link
            href="/admin/customers"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Customer Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
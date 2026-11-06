"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  Percent,
  Clock,
  Save,
  CheckCircle2,
  Lock,
  DollarSign,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  UserCheck,
  FileCheck,
  MapPin,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"FEES" | "MARKETPLACE" | "SECURITY">("FEES");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form States
  const [commissionRate, setCommissionRate] = useState("12.5");
  const [minPayout, setMinPayout] = useState("10,000");
  const [cancellationGrace, setCancellationGrace] = useState("2");
  const [escrowReleaseHours, setEscrowReleaseHours] = useState("24");

  // Marketplace Parameters
  const [geoRadius, setGeoRadius] = useState("250");
  const [overdueSweepHours, setOverdueSweepHours] = useState("48");
  const [requireNin, setRequireNin] = useState(true);
  const [requireMedia, setRequireMedia] = useState(true);
  const [autoExpire, setAutoExpire] = useState(true);

  // Security Flags
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [strictRoleGuard, setStrictRoleGuard] = useState(true);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("Platform configuration parameters saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Settings & Platform Permissions
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Manage marketplace commission rates, escrow grace windows, arrival PIN geofences, and security policies.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-5 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 font-medium">{successMessage}</div>
        </div>
      )}

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commission */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Platform Take Rate
            </span>
            <Percent className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {commissionRate}%
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Standard Cut
            </span>
          </div>
        </div>

        {/* Escrow Window */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Escrow Hold Window
            </span>
            <Clock className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {escrowReleaseHours} Hours
            </span>
            <span className="text-[11px] font-semibold text-emerald-700">
              Auto-Release
            </span>
          </div>
        </div>

        {/* Geofence */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              PIN Geofence Radius
            </span>
            <MapPin className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {geoRadius}m
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Accuracy Tolerance
            </span>
          </div>
        </div>

        {/* Security Guard */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Security Level
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Guarded
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              ADMIN Role
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              JWT Guarded
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("FEES")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "FEES"
                ? "bg-[#FF6600] text-white"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            Fees & Escrow Rules
          </button>
          <button
            onClick={() => setActiveTab("MARKETPLACE")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "MARKETPLACE"
                ? "bg-[#FF6600] text-white"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            Marketplace Parameters
          </button>
          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === "SECURITY"
                ? "bg-[#FF6600] text-white"
                : "text-slate-600 hover:text-black hover:bg-slate-50"
            }`}
          >
            Security & Access Roles
          </button>
        </div>

        {/* Tab 1: Fees & Escrow Rules */}
        {activeTab === "FEES" && (
          <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-6">
            <div>
              <h2 className="text-base font-garet font-[850] text-black">
                Financial Fee Architecture & Escrow Rules
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Configure commission splits, payout batching thresholds, and automatic settlement windows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Platform Commission Take Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Deducted automatically from gross client deposit before disbursement to Krafter wallet.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Minimum Krafter Payout Threshold (₦)
                </label>
                <input
                  type="text"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
                <span className="text-[10px] text-slate-500">
                  Minimum accumulated balance required before initiating weekly bank transfers.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Customer Free Cancellation Grace Window (Hours)
                </label>
                <input
                  type="number"
                  value={cancellationGrace}
                  onChange={(e) => setCancellationGrace(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
                <span className="text-[10px] text-slate-500">
                  Time after booking approval where customer can cancel with 100% refund.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Automatic Escrow Release Post-Completion (Hours)
                </label>
                <input
                  type="number"
                  value={escrowReleaseHours}
                  onChange={(e) => setEscrowReleaseHours(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                />
                <span className="text-[10px] text-slate-500">
                  Hours after Krafter submits completion proof where funds release automatically if no dispute is opened.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Marketplace Parameters */}
        {activeTab === "MARKETPLACE" && (
          <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-6">
            <div>
              <h2 className="text-base font-garet font-[850] text-black">
                Marketplace Dispatch & Fulfillment Controls
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Tolerances for arrival verification, automated sweep intervals, and mandatory profile credentials.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Arrival PIN Geofence Radius (Meters)
                  </label>
                  <input
                    type="number"
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  />
                  <span className="text-[10px] text-slate-500">
                    Maximum GPS discrepancy tolerated between job site coordinates and Krafter check-in location.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Overdue Booking Sweep Cutoff (Hours)
                  </label>
                  <input
                    type="number"
                    value={overdueSweepHours}
                    onChange={(e) => setOverdueSweepHours(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  />
                  <span className="text-[10px] text-slate-500">
                    Unconfirmed requests exceeding this threshold get automatically expired to release hold funds.
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black text-xs block">
                      Enforce Mandatory Government ID Verification
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Krafters cannot receive active booking dispatches until NIN or trade certification is verified.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireNin((prev) => !prev)}
                    className="text-xs"
                  >
                    {requireNin ? (
                      <ToggleRight className="h-6 w-6 text-[#FF6600]" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-black text-xs block">
                      Mandatory Completion Evidence Photos
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Require photographic proof uploaded via mobile app before completion milestone authorization.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireMedia((prev) => !prev)}
                    className="text-xs"
                  >
                    {requireMedia ? (
                      <ToggleRight className="h-6 w-6 text-[#FF6600]" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Access Roles */}
        {activeTab === "SECURITY" && (
          <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-6">
            <div>
              <h2 className="text-base font-garet font-[850] text-black">
                Security Controls & API Role Enforcements
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Staff authentication standards, session timeouts, and backend JWT guard rules.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Backend RolesGuard Notice:</span> Fraud-prevention and payment operations APIs strictly require the exact <strong className="font-mono">ADMIN</strong> JWT role. <span className="font-mono">SUPER_ADMIN</span> alone is rejected by backend NestJS guards. Ensure administrative staff have the <strong className="font-mono">ADMIN</strong> role attached.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Staff Inactivity Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-black outline-none focus:border-[#FF6600]"
                  />
                  <span className="text-[10px] text-slate-500">
                    Automatically logs out inactive admin sessions to prevent unauthorized device access.
                  </span>
                </div>

                <div className="flex flex-col justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <span className="font-bold text-black text-xs block">
                      Enforce 2-Factor Authentication (2FA)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mandatory TOTP authenticator app code for all staff upon sign in.
                    </span>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setEnforce2FA((prev) => !prev)}
                    >
                      {enforce2FA ? (
                        <ToggleRight className="h-6 w-6 text-[#FF6600]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Bottom Policy Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Platform Configuration Audit Trail
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            All modifications to financial parameters, commission rates, and security enforcement policies are cryptographically logged with the acting administrator&apos;s account ID, IP address, and timestamp.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/staff"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Manage Staff
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



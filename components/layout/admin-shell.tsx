"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Users,
  CheckCircle,
  Wallet,
  ShoppingBag,
  Headphones,
  AlignLeft,
  Settings,
  ChevronDown,
  Menu,
  ChevronLeft,
  Search,
  ListChecks,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Loader from "../ui/loader";
import Footer from "../ui/footer";
import Image from "next/image"

type NavItem = {
  href?: string;
  label: string;
  icon: any;
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutGrid },
  {
    label: "User Management",
    icon: Users,
    children: [
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/krafters", label: "Krafters" },
      { href: "/admin/staff", label: "Staff" }
    ]
  },
  { href: "/admin/krafts", label: "Kraft Management", icon: CheckCircle },
  { href: "/admin/bookings", label: "Booking Management", icon: CheckCircle },
  { href: "/admin/waitlist", label: "Waitlist Management", icon: ListChecks  },
  { href: "/admin/financials", label: "Financials & Payouts", icon: Wallet },
  { href: "/admin/marketing", label: "Marketing & Ads", icon: ShoppingBag },
  { href: "/admin/support", label: "Customer Support", icon: Headphones },
  { href: "/admin/operations", label: "Operations & Content", icon: AlignLeft },
  { href: "/admin/settings", label: "Settings & Permissions", icon: Settings }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); 
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "User Management": true
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Client-side auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={`hidden shrink-0 flex-col border-r border-[#0000001A] bg-white px-3 py-4 transition-all duration-200 md:flex ${collapsed ? "w-16" : "w-100"
            }`}
        >
          <div className="mb-8 flex items-center px-2">
            {!collapsed && (
              <Image src='/ban.svg' alt="banner" width={200} height={200} />
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full  bg-[#FF6600] text-[10px] text-white hover:border-emerald-400 hover:text-emerald-300"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={`h-3 w-3 transition-transform ${collapsed ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-3 text-sm mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;

              if (item.children) {
                const isExpanded = expandedMenus[item.label];
                return (
                  <div key={item.label} className="flex flex-col">
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <div className="mt-1 flex flex-col gap-1 pl-11 pr-3">
                        {item.children.map((child) => {
                          const childActive = pathname?.startsWith(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-center rounded-lg px-3 py-2 transition-colors ${childActive
                                ? "bg-[#FFF0E5] text-[#FF6600] font-medium"
                                : "text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const active = pathname?.startsWith(item.href || "");
              return (
                <Link
                  key={item.href || item.label}
                  href={item.href || "#"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active
                    ? "bg-[#FFF0E5] text-[#FF6600] font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="w-60 border-r border-slate-200 bg-white px-3 py-4">
              <div className="mb-4 flex items-center gap-2 px-2">
                <Image src='/ban.svg' alt="banner" width={100} height={100} />
              </div>
              <nav className="flex flex-1 flex-col gap-2 text-sm mt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  if (item.children) {
                    const isExpanded = expandedMenus[item.label];
                    return (
                      <div key={item.label} className="flex flex-col">
                        <button
                          onClick={() => toggleMenu(item.label)}
                          className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-[#000000CC] hover:bg-slate-50 transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                        {isExpanded && (
                          <div className="mt-1 flex flex-col gap-1 pl-11 pr-3">
                            {item.children.map((child) => {
                              const childActive = pathname?.startsWith(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-center rounded-lg px-3 py-3 transition-colors ${childActive
                                    ? "bg-[#FFF0E5] text-[#FF6600] font-medium"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                >
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const active = pathname?.startsWith(item.href || "");
                  return (
                    <Link
                      key={item.href || item.label}
                      href={item.href || "#"}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${active
                        ? "bg-[#FFF0E5] text-[#FF6600] font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <button
              type="button"
              className="flex-1 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col min-w-0">
          <header className="flex items-center justify-between gap-3 border-b border-[#0000001A] bg-white px-4 py-3 text-xs text-slate-300 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6600] text-slate-300  md:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-end gap-6">
              {/* Search Bar */}
              <div className="hidden w-full max-w-[400px] items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 sm:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                <div className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white text-[10px] text-slate-400 shadow-sm">
                  /
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                <div className="hidden flex-col items-start justify-center leading-tight sm:flex">
                  <span className="text-[8px] font-extrabold text-slate-900">
                    Welcome Back
                  </span>
                  <span className="text-[14px] font-medium text-slate-900 mt-0.5 capitalize">
                    {user?.email?.split('@')[0] || "Admin"}
                  </span>
                  <span className="text-[8px] font-bold text-[#FF6600] mt-0.5">
                    Admin Access
                  </span>
                </div>

                {/* Avatar with Logout action */}
                <button
                  onClick={() => logout()}
                  disabled={isLoading}
                  className="relative h-12 w-12 overflow-hidden rounded-full bg-[#FFF0E5] border border-orange-100 flex items-center justify-center group"
                  title="Click to logout"
                >
                  <span className="text-lg font-bold text-[#FF6600]">
                    {(user?.email || "A")[0].toUpperCase()}
                  </span>
                  <div className="absolute inset-0 bg-black/60 text-white opacity-0 flex items-center justify-center text-[10px] font-medium transition-opacity group-hover:opacity-100">
                    Logout
                  </div>
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}


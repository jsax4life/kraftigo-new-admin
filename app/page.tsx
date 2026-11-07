"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken, getRefreshToken, isTokenExpired } from "@/lib/token-storage";
import Loader from "@/components/ui/loader";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const token = getAccessToken();
    const hasRefresh = !!getRefreshToken();

    // If no tokens exist at all, immediately redirect to login
    if (!token && !hasRefresh) {
      router.replace("/login");
      return;
    }

    // If access token is still valid in localStorage, immediately redirect to dashboard
    if (token && !isTokenExpired(token)) {
      router.replace("/admin/dashboard");
      return;
    }

    // Otherwise wait for React Query auth state resolution
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white">
      <Loader />
    </div>
  );
}


"use client";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import "@/lib/test-api";

export function QueryClientProviderWrapper({
  children
}: {
  children: ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000
          }
        }
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}


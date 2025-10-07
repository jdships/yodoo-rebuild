"use client";

import { API_ROUTE_CSRF } from "@/lib/routes";
import { useQuery } from "@tanstack/react-query";

export function LayoutClient() {
  useQuery({
    queryKey: ["csrf-init"],
    queryFn: async () => {
      await fetch(API_ROUTE_CSRF);
      return true;
    },
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  return null;
}

"use client";

import { useUser } from "@/lib/user-store/provider";
import { useEffect, useState } from "react";

type UsageData = {
  dailyCount: number;
  dailyProCount: number;
  dailyLimit: number;
  monthlyCount: number;
  monthlyLimit: number;
  remaining: number;
  remainingPro: number;
  remainingMonthly: number;
  subscriptionType: "free" | "pro" | "unlimited";
  subscriptionStatus: "active" | "inactive" | "canceled" | "past_due";
  hasApiKeys: boolean;
};

export function useUsage() {
  const { user } = useUser();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user?.id) {
        setUsage(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const isAuthenticated = !user.anonymous;
        const response = await fetch(
          `/api/rate-limits?userId=${user.id}&isAuthenticated=${isAuthenticated}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch usage data");
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setUsage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [user?.id, user?.anonymous]);

  return {
    usage,
    isLoading,
    error,
    refetch: () => {
      if (user?.id) {
        // Trigger a re-fetch by updating a dependency
        setIsLoading(true);
        setError(null);
      }
    },
  };
}

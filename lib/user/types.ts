import type { Tables } from "@/app/types/database.types";
import type { UserPreferences } from "../user-preference-store/utils";

export type SubscriptionType = "free" | "pro" | "unlimited";
export type SubscriptionStatus = "active" | "inactive" | "canceled" | "past_due";

export type UserProfile = {
  profile_image: string | null;
  display_name: string;
  preferences?: UserPreferences;
} & Tables<"users">;

export type UserSubscription = {
  type: SubscriptionType;
  status: SubscriptionStatus;
  started_at: string | null;
  ends_at: string | null;
};

export function getUserSubscription(user: Tables<"users">): UserSubscription {
  return {
    type: (user.subscription_type as SubscriptionType) || "free",
    status: (user.subscription_status as SubscriptionStatus) || "inactive",
    started_at: user.subscription_started_at,
    ends_at: user.subscription_ends_at,
  };
}

export function hasActiveSubscription(user: Tables<"users">): boolean {
  const subscription = getUserSubscription(user);
  return subscription.status === "active" && subscription.type !== "free";
}

export function isPremiumUser(user: Tables<"users">): boolean {
  const subscription = getUserSubscription(user);
  return subscription.status === "active" && (subscription.type === "pro" || subscription.type === "unlimited");
}

export function isUnlimitedUser(user: Tables<"users">): boolean {
  const subscription = getUserSubscription(user);
  return subscription.status === "active" && subscription.type === "unlimited";
}

import {
  AUTH_DAILY_MESSAGE_LIMIT,
  DAILY_LIMIT_PRO_MODELS,
  FREE_WITH_API_KEYS_LIMIT,
  PRO_MONTHLY_MESSAGE_LIMIT,
  PRO_MONTHLY_MESSAGE_LIMIT_WITH_KEYS,
} from "@/lib/config";
import { validateUserIdentity } from "@/lib/server/api";
import { userHasApiKeys } from "@/lib/user-keys";
import { getUserSubscription, hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types";

export async function getMessageUsage(
  userId: string,
  isAuthenticated: boolean
) {
  const supabase = await validateUserIdentity(userId, isAuthenticated);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("users")
    .select("daily_message_count, daily_pro_message_count, message_count, anonymous, subscription_type, subscription_status, subscription_started_at, subscription_ends_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || "Failed to fetch message usage");
  }

  // Create a minimal user object for subscription functions
  const userForSubscription = {
    ...data,
    subscription_type: data.subscription_type as "free" | "pro" | "unlimited" | null,
    subscription_status: data.subscription_status as "active" | "inactive" | "canceled" | "past_due" | null,
  };

  const subscription = getUserSubscription(userForSubscription as any);
  const isUnlimited = isUnlimitedUser(userForSubscription as any);
  const isPro = hasActiveSubscription(userForSubscription as any);
  const hasApiKeys = await userHasApiKeys(userId);

  const dailyCount = data.daily_message_count || 0;
  const dailyProCount = data.daily_pro_message_count || 0;
  const monthlyCount = data.message_count || 0;

  let dailyLimit: number;
  let monthlyLimit: number;

  if (isUnlimited) {
    dailyLimit = -1; // Unlimited
    monthlyLimit = -1; // Unlimited
  } else if (isPro) {
    dailyLimit = -1; // No daily limit for Pro users
    monthlyLimit = hasApiKeys ? PRO_MONTHLY_MESSAGE_LIMIT_WITH_KEYS : PRO_MONTHLY_MESSAGE_LIMIT;
  } else {
    // Free users - no daily limits anymore, just total limits
    dailyLimit = -1; // No daily limit for free users
    if (hasApiKeys) {
      // Free users with API keys: 250 messages per month
      monthlyLimit = FREE_WITH_API_KEYS_LIMIT;
    } else {
      // Free users without API keys: 100 messages total
      monthlyLimit = AUTH_DAILY_MESSAGE_LIMIT; // 100 messages total
    }
  }

  return {
    dailyCount,
    dailyProCount,
    dailyLimit,
    monthlyCount,
    monthlyLimit,
    remaining: dailyLimit > 0 ? dailyLimit - dailyCount : -1,
    remainingPro: DAILY_LIMIT_PRO_MODELS - dailyProCount,
    remainingMonthly: monthlyLimit > 0 ? monthlyLimit - monthlyCount : -1,
    subscriptionType: subscription.type,
    subscriptionStatus: subscription.status,
    hasApiKeys, // Add this so frontend knows if user has API keys
  };
}

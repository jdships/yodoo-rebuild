import { UsageLimitError } from "@/lib/api"
import {
  AUTH_DAILY_MESSAGE_LIMIT,
  DAILY_LIMIT_PRO_MODELS,
  FREE_MODELS_IDS,
  FREE_WITH_API_KEYS_LIMIT,
  PRO_MONTHLY_MESSAGE_LIMIT,
  PRO_MONTHLY_MESSAGE_LIMIT_WITH_KEYS
} from "@/lib/config"
import { userHasApiKeys } from "@/lib/user-keys"
import { getUserSubscription, hasActiveSubscription, isUnlimitedUser } from "@/lib/user/types"
import { SupabaseClient } from "@supabase/supabase-js"

const isFreeModel = (modelId: string) => FREE_MODELS_IDS.includes(modelId)
const isProModel = (modelId: string) => !isFreeModel(modelId)

/**
 * Checks the user's usage limits based on their subscription tier and API key ownership.
 * All users must be authenticated to use the app.
 * - Free users without API keys: 100 messages total
 * - Free users with API keys: 250 messages per month
 * - Pro users without API keys: 5000 messages per month
 * - Pro users with API keys: 10000 messages per month
 * - Unlimited users: No limits
 *
 * @param supabase - Your Supabase client.
 * @param userId - The ID of the user.
 * @throws UsageLimitError if the limit is reached, or a generic Error if checking fails.
 * @returns User data including message counts and limits
 */
export async function checkUsage(supabase: SupabaseClient, userId: string) {
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select(
      "message_count, daily_message_count, daily_reset, anonymous, premium, subscription_type, subscription_status"
    )
    .eq("id", userId)
    .maybeSingle()

  if (userDataError) {
    throw new Error("Error fetching user data: " + userDataError.message)
  }
  if (!userData) {
    throw new Error("User record not found for id: " + userId)
  }

  const subscription = getUserSubscription(userData as any);
  const isUnlimited = isUnlimitedUser(userData as any);
  const isPro = hasActiveSubscription(userData as any);
  const hasApiKeys = await userHasApiKeys(userId);

  // Unlimited users have no limits
  if (isUnlimited) {
    return {
      userData,
      dailyCount: userData.daily_message_count || 0,
      dailyLimit: -1, // Unlimited
      monthlyCount: userData.message_count || 0,
      monthlyLimit: -1, // Unlimited
    };
  }

  let dailyLimit: number;
  let monthlyLimit: number;

  if (isPro) {
    // Pro users
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

  // Since we no longer have daily limits, we can skip the daily reset logic
  // and just focus on monthly/total limits
  const dailyCount = userData.daily_message_count || 0;

  // Check monthly/total limits (for all users)
  const monthlyCount = userData.message_count || 0;
  if (monthlyLimit > 0 && monthlyCount >= monthlyLimit) {
    if (isPro) {
      const limitText = hasApiKeys ? "10,000" : "5,000";
      const suggestion = hasApiKeys ? "You've reached your enhanced limit." : "Add your own API keys to double your limit to 10,000 messages.";
      throw new UsageLimitError(`Monthly message limit reached. You've used all ${limitText} messages this month. ${suggestion}`)
    } else {
      // Free user
      if (hasApiKeys) {
        throw new UsageLimitError(`Monthly message limit reached. You've used ${monthlyCount}/${monthlyLimit} messages this month. Upgrade to Pro for more messages.`)
      } else {
        throw new UsageLimitError(`Message limit reached. You've used ${monthlyCount}/${monthlyLimit} messages. Add your own API keys for 250 messages per month, or upgrade to Pro for more messages.`)
      }
    }
  }

  return {
    userData,
    dailyCount,
    dailyLimit,
    monthlyCount,
    monthlyLimit,
  }
}

/**
 * Increments both overall and daily message counters for a user.
 *
 * @param supabase - Your Supabase client.
 * @param userId - The ID of the user.
 * @param currentCounts - Current message counts (optional, will be fetchCliented if not provided)
 * @param trackDaily - Whether to track the daily message count (default is true)
 * @throws Error if updating fails.
 */
export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("message_count, daily_message_count")
    .eq("id", userId)
    .maybeSingle()

  if (userDataError || !userData) {
    throw new Error(
      "Error fetchClienting user data: " +
        (userDataError?.message || "User not found")
    )
  }

  const messageCount = userData.message_count || 0
  const dailyCount = userData.daily_message_count || 0

  // Increment both overall and daily message counts.
  const newOverallCount = messageCount + 1
  const newDailyCount = dailyCount + 1

  const { error: updateError } = await supabase
    .from("users")
    .update({
      message_count: newOverallCount,
      daily_message_count: newDailyCount,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update usage data: " + updateError.message)
  }
}

export async function checkProUsage(supabase: SupabaseClient, userId: string) {
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("daily_pro_message_count, daily_pro_reset")
    .eq("id", userId)
    .maybeSingle()

  if (userDataError) {
    throw new Error("Error fetching user data: " + userDataError.message)
  }
  if (!userData) {
    throw new Error("User not found for ID: " + userId)
  }

  let dailyProCount = userData.daily_pro_message_count || 0
  const now = new Date()
  const lastReset = userData.daily_pro_reset
    ? new Date(userData.daily_pro_reset)
    : null

  const isNewDay =
    !lastReset ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate()

  if (isNewDay) {
    dailyProCount = 0
    const { error: resetError } = await supabase
      .from("users")
      .update({
        daily_pro_message_count: 0,
        daily_pro_reset: now.toISOString(),
      })
      .eq("id", userId)

    if (resetError) {
      throw new Error("Failed to reset pro usage: " + resetError.message)
    }
  }

  if (dailyProCount >= DAILY_LIMIT_PRO_MODELS) {
    throw new UsageLimitError("Daily Pro model limit reached.")
  }

  return {
    dailyProCount,
    limit: DAILY_LIMIT_PRO_MODELS,
  }
}

export async function incrementProUsage(
  supabase: SupabaseClient,
  userId: string
) {
  const { data, error } = await supabase
    .from("users")
    .select("daily_pro_message_count")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Failed to fetch user usage for increment")
  }

  const count = data.daily_pro_message_count || 0

  const { error: updateError } = await supabase
    .from("users")
    .update({
      daily_pro_message_count: count + 1,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to increment pro usage: " + updateError.message)
  }
}

export async function checkUsageByModel(
  supabase: SupabaseClient,
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  // All users must be authenticated
  if (!isAuthenticated) {
    throw new UsageLimitError("Authentication required. Please sign in to use Yodoo.");
  }

  if (isProModel(modelId)) {
    return await checkProUsage(supabase, userId)
  }

  return await checkUsage(supabase, userId)
}

export async function incrementUsageByModel(
  supabase: SupabaseClient,
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  // All users must be authenticated
  if (!isAuthenticated) return

  if (isProModel(modelId)) {
    return await incrementProUsage(supabase, userId)
  }

  return await incrementUsage(supabase, userId)
}

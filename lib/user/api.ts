import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
    convertFromApiFormat
} from "@/lib/user-preference-store/utils";
import type { UserProfile } from "./types";

export async function getSupabaseUser() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null };

  try {
    const { data, error } = await supabase.auth.getUser();
    
    // Handle auth errors gracefully
    if (error) {
      console.warn("Auth error in getSupabaseUser:", error.message);
      return { supabase, user: null };
    }

    return {
      supabase,
      user: data.user ?? null,
    };
  } catch (error) {
    console.error("Unexpected auth error in getSupabaseUser:", error);
    return { supabase, user: null };
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseEnabled) {
    // No user profile when Supabase is disabled - user must be authenticated
    return null;
  }

  const { supabase, user } = await getSupabaseUser();
  if (!(supabase && user)) return null;

  const { data: userProfileData } = await supabase
    .from("users")
    .select("*, user_preferences(*)")
    .eq("id", user.id)
    .single();

  if (!userProfileData) return null;

  // Format user preferences if they exist
  const formattedPreferences = userProfileData?.user_preferences
    ? convertFromApiFormat(userProfileData.user_preferences)
    : undefined;

  return {
    ...userProfileData,
    profile_image: user.user_metadata?.avatar_url || null,
    display_name: user.user_metadata?.name || "",
    preferences: formattedPreferences,
  } as UserProfile;
}

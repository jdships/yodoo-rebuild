import { createClient } from "@/lib/supabase/server"
import { isSupabaseEnabled } from "../supabase/config"

/**
 * Validates the user's identity - all users must be authenticated
 * @param userId - The ID of the user.
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns The Supabase client.
 */
export async function validateUserIdentity(
  userId: string,
  isAuthenticated: boolean
) {
  if (!isSupabaseEnabled) {
    return null
  }

  // All users must be authenticated
  if (!isAuthenticated) {
    throw new Error("Authentication required. Please sign in to use Yodoo.")
  }

  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Failed to initialize Supabase client")
  }

  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user?.id) {
    throw new Error("Unable to get authenticated user")
  }

  if (authData.user.id !== userId) {
    throw new Error("User ID does not match authenticated user")
  }

  return supabase
}

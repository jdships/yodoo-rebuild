import { notFound } from "next/navigation";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import LoginOnboarding from "./login-onboarding";

export default function AuthPage() {
  if (!isSupabaseEnabled) {
    return notFound();
  }

  return <LoginOnboarding />;
}

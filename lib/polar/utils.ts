import { createClient } from "@/lib/supabase/server";
import { polarClient } from "./client";
import { polarConfig, type PlanType } from "./config";

export async function createCheckoutSession(
  userId: string,
  planType: PlanType,
  successUrl?: string,
  cancelUrl?: string
) {
  const plan = polarConfig.plans[planType];
  
  if (!plan.productId) {
    throw new Error(`Product ID not configured for plan: ${planType}`);
  }

  const supabase = await createClient();
  
  if (!supabase) {
    throw new Error("Supabase client not available");
  }
  
  // Get user information
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("email, polar_customer_id")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    throw new Error("User not found");
  }

  let customerId = user.polar_customer_id;

  // Create Polar customer if doesn't exist
  if (!customerId) {
    try {
      const customer = await polarClient.customers.create({
        email: user.email,
        metadata: {
          user_id: userId,
        },
      });
      
      customerId = customer.id;
      
      // Update user with Polar customer ID
      await supabase
        .from("users")
        .update({ polar_customer_id: customerId })
        .eq("id", userId);
        
    } catch (error) {
      console.error("Error creating Polar customer:", error);
      throw new Error("Failed to create customer");
    }
  }

  // Create checkout session - simplified approach
  try {
    // Use the direct checkout URL approach for now
    // This will need to be updated based on the actual Polar SDK API
    const checkoutUrl = `/api/checkout?product_id=${plan.productId}&customer_id=${customerId}&success_url=${encodeURIComponent(successUrl || `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/confirmation`)}&metadata[user_id]=${userId}&metadata[plan_type]=${planType}`;

    return {
      checkoutUrl,
      checkoutId: `temp_${Date.now()}`, // Temporary ID
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function getCustomerSubscriptions(userId: string) {
  const supabase = await createClient();
  
  if (!supabase) {
    return [];
  }
  
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("polar_customer_id")
    .eq("id", userId)
    .single();

  if (userError || !user?.polar_customer_id) {
    return [];
  }

  try {
    // For now, return empty array until we can properly implement the SDK calls
    // This will need to be updated based on the actual Polar SDK API
    return [];
  } catch (error) {
    console.error("Error fetching customer subscriptions:", error);
    return [];
  }
}
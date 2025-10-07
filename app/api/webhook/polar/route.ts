import { createClient } from "@/lib/supabase/server";
import { Webhooks } from "@polar-sh/nextjs";

if (!process.env.POLAR_WEBHOOK_SECRET) {
  throw new Error("POLAR_WEBHOOK_SECRET environment variable is required");
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    console.log("Received Polar webhook:", payload.type);
    
    const supabase = await createClient();
    
    try {
      switch (payload.type) {
        case "checkout.created":
          console.log("Checkout created:", payload.data);
          break;
          
        case "checkout.updated":
          console.log("Checkout updated:", payload.data);
          // Handle checkout completion
          if (payload.data.status === "confirmed") {
            const customerId = payload.data.customerId;
            const productId = payload.data.productId;
            
            // Update user subscription status
            if (customerId) {
              await updateUserSubscription(supabase, customerId, productId, "active");
            }
          }
          break;
          
        case "subscription.created":
          console.log("Subscription created:", payload.data);
          const { customerId: subCustomerId, productId: subProductId } = payload.data;
          if (subCustomerId) {
            await updateUserSubscription(supabase, subCustomerId, subProductId, "active");
          }
          break;
          
        case "subscription.updated":
          console.log("Subscription updated:", payload.data);
          const subscription = payload.data;
          if (subscription.customerId) {
            await updateUserSubscription(
              supabase, 
              subscription.customerId, 
              subscription.productId, 
              subscription.status
            );
          }
          break;
          
        case "subscription.canceled":
          console.log("Subscription canceled:", payload.data);
          const canceledSub = payload.data;
          if (canceledSub.customerId) {
            await updateUserSubscription(
              supabase, 
              canceledSub.customerId, 
              canceledSub.productId, 
              "canceled"
            );
          }
          break;
          
        default:
          console.log("Unhandled webhook type:", payload.type);
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      throw error;
    }
  },
});

async function updateUserSubscription(
  supabase: any,
  customerId: string,
  productId: string,
  status: string
) {
  try {
    if (!supabase) {
      console.error("Supabase client not available");
      return;
    }
    
    // First, find the user by their Polar customer ID
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("polar_customer_id", customerId)
      .single();
      
    if (userError) {
      console.error("Error finding user:", userError);
      return;
    }
    
    // Determine subscription type based on product ID
    let subscriptionType = "free";
    if (productId === process.env.POLAR_PRO_PRODUCT_ID) {
      subscriptionType = "pro";
    } else if (productId === process.env.POLAR_UNLIMITED_PRODUCT_ID) {
      subscriptionType = "unlimited";
    }
    
    // Update user subscription status
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_type: subscriptionType,
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
      
    if (updateError) {
      console.error("Error updating user subscription:", updateError);
      throw updateError;
    }
    
    console.log(`Updated user ${user.id} subscription to ${subscriptionType} (${status})`);
  } catch (error) {
    console.error("Error in updateUserSubscription:", error);
    throw error;
  }
}

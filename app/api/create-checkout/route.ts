import { polarConfig, type PlanType } from "@/lib/polar/config";
import { createCheckoutSession } from "@/lib/polar/utils";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json();

    if (!planType || !polarConfig.plans[planType as PlanType]) {
      return NextResponse.json(
        { error: "Invalid plan type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 500 }
      );
    }
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Create checkout session
    const { checkoutUrl, checkoutId } = await createCheckoutSession(
      user.id,
      planType as PlanType
    );

    return NextResponse.json({
      checkoutUrl,
      checkoutId,
    });

  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      // If no preferences exist, return defaults
      if (error.code === "PGRST116") {
        return NextResponse.json({
          prompt_suggestions: true,
          show_tool_invocations: true,
          show_conversation_previews: true,
          multi_model_enabled: false,
          hidden_models: [],
        });
      }

      console.error("Error fetching user preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch user preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompt_suggestions: data.prompt_suggestions,
      show_tool_invocations: data.show_tool_invocations,
      show_conversation_previews: data.show_conversation_previews,
      multi_model_enabled: data.multi_model_enabled,
      hidden_models: data.hidden_models || [],
    });
  } catch (error) {
    console.error("Error in user-preferences GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const {
      prompt_suggestions,
      show_tool_invocations,
      show_conversation_previews,
      multi_model_enabled,
      hidden_models,
    } = body;

    if (hidden_models && !Array.isArray(hidden_models)) {
      return NextResponse.json(
        { error: "hidden_models must be an array" },
        { status: 400 }
      );
    }

    // Prepare update object with only provided fields
    const updateData: Record<string, any> = {};
    if (prompt_suggestions !== undefined) {
      updateData.prompt_suggestions = prompt_suggestions;
    }
    if (show_tool_invocations !== undefined) {
      updateData.show_tool_invocations = show_tool_invocations;
    }
    if (show_conversation_previews !== undefined) {
      updateData.show_conversation_previews = show_conversation_previews;
    }
    if (multi_model_enabled !== undefined) {
      updateData.multi_model_enabled = multi_model_enabled;
    }
    if (hidden_models !== undefined) {
      updateData.hidden_models = hidden_models;
    }

    // Try to get existing preferences
    const { data: existingData } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let data: any, error: any;

    if (existingData) {
      // Update existing preferences
      const { data: updateResult, error: updateError } = await supabase
        .from("user_preferences")
        .update(updateData)
        .eq("user_id", user.id)
        .select("*")
        .single();

      data = updateResult;
      error = updateError;
    } else {
      // Create new preferences record
      const { data: insertResult, error: insertError } = await supabase
        .from("user_preferences")
        .insert({
          user_id: user.id,
          prompt_suggestions: true,
          show_tool_invocations: true,
          show_conversation_previews: true,
          multi_model_enabled: false,
          hidden_models: [],
          ...updateData,
        })
        .select("*")
        .single();

      data = insertResult;
      error = insertError;
    }

    if (error) {
      // If RLS policy blocks the operation, return the update data as if it succeeded
      // This allows the frontend to continue working with localStorage fallback
      if (error.code === "42501") {
        return NextResponse.json({
          success: true,
          prompt_suggestions: updateData.prompt_suggestions ?? true,
          show_tool_invocations: updateData.show_tool_invocations ?? true,
          show_conversation_previews:
            updateData.show_conversation_previews ?? true,
          multi_model_enabled: updateData.multi_model_enabled ?? false,
          hidden_models: updateData.hidden_models || [],
        });
      }

      console.error("Error updating user preferences:", error);
      return NextResponse.json(
        { error: "Failed to update user preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      prompt_suggestions: data?.prompt_suggestions ?? true,
      show_tool_invocations: data?.show_tool_invocations ?? true,
      show_conversation_previews: data?.show_conversation_previews ?? true,
      multi_model_enabled: data?.multi_model_enabled ?? false,
      hidden_models: data?.hidden_models || [],
    });
  } catch (error) {
    console.error("Error in user-preferences PUT API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

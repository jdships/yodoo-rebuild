import { UsageLimitError } from "@/lib/api";
import { createChatInDb } from "./api";

export async function POST(request: Request) {
  try {
    const { userId, title, model, isAuthenticated, projectId } =
      await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      });
    }

    const chat = await createChatInDb({
      userId,
      title,
      model,
      isAuthenticated,
      projectId,
    });

    if (!chat) {
      return new Response(
        JSON.stringify({ error: "Supabase not available in this deployment." }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ chat }), { status: 200 });
  } catch (err: unknown) {
    // Handle usage limit errors specifically - these are expected, not actual errors
    if (err instanceof UsageLimitError) {
      // Log as info, not error, since this is expected business logic
      console.info("Usage limit reached for user:", { 
        message: err.message, 
        code: err.code 
      });
      
      return new Response(
        JSON.stringify({ 
          error: err.message, 
          code: err.code,
          type: "USAGE_LIMIT_ERROR"
        }),
        { status: 429 } // Use 429 Too Many Requests for rate limiting
      );
    }

    // Only log unexpected errors
    console.error("Error in create-chat endpoint:", err);

    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    );
  }
}

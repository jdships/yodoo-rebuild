import { Checkout } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error("POLAR_ACCESS_TOKEN environment variable is required");
}

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get("product_id");
  const customerId = searchParams.get("customer_id");
  const successUrl = searchParams.get("success_url");
  const metadata = Object.fromEntries(
    Array.from(searchParams.entries())
      .filter(([key]) => key.startsWith("metadata["))
      .map(([key, value]) => [key.replace(/metadata\[|\]/g, ""), value])
  );

  // Use the Polar Checkout helper with dynamic parameters
  const checkoutHandler = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    successUrl: successUrl || "/confirmation?checkout_id={CHECKOUT_ID}",
    server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  });

  return checkoutHandler(request);
};
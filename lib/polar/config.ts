export const polarConfig = {
  plans: {
    pro: {
      name: "Pro",
      price: 20,
      currency: "USD",
      interval: "month",
      features: [
        "Unlimited AI conversations",
        "Access to all AI models",
        "Priority support",
        "Advanced features",
        "Custom integrations",
        "Export capabilities",
      ],
      productId: process.env.POLAR_PRO_PRODUCT_ID || "",
      priceId: process.env.POLAR_PRO_PRICE_ID || "",
    },
    unlimited: {
      name: "Unlimited",
      price: 100,
      currency: "USD",
      interval: "month",
      features: [
        "Everything in Pro",
        "Unlimited storage",
        "Custom integrations",
        "24/7 phone support",
        "SLA guarantee",
        "Custom branding",
        "Dedicated account manager",
        "White-label options",
      ],
      productId: process.env.POLAR_UNLIMITED_PRODUCT_ID || "",
      priceId: process.env.POLAR_UNLIMITED_PRICE_ID || "",
    },
  },
} as const;

export type PlanType = keyof typeof polarConfig.plans;

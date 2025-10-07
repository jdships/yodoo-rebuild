import {
  BookOpenText,
  Brain,
  Code,
  Notepad,
  PaintBrush,
  Sparkle
} from "@phosphor-icons/react/dist/ssr";

export const AUTH_DAILY_MESSAGE_LIMIT = 100; // Free authenticated users without API keys: 100 messages total
export const FREE_WITH_API_KEYS_LIMIT = 250; // Free users with API keys: 250 messages per month
export const PRO_MONTHLY_MESSAGE_LIMIT = 5000; // Pro users: 5000 credits per month
export const PRO_MONTHLY_MESSAGE_LIMIT_WITH_KEYS = 10000; // Pro users with API keys: 10000 credits per month
export const UNLIMITED_MONTHLY_MESSAGE_LIMIT = -1; // Unlimited users: no limit

export const REMAINING_QUERY_ALERT_THRESHOLD = 2;
export const DAILY_FILE_UPLOAD_LIMIT = 5;
export const DAILY_LIMIT_PRO_MODELS = 500;

// Multi-chat model limits
export const FREE_MAX_MODELS = 2; // Free users can chat with 2 models max
export const PRO_MAX_MODELS = 4; // Pro users can chat with 4 models max
export const UNLIMITED_MAX_MODELS = 10; // Unlimited users can chat with 10 models max

export const NON_AUTH_ALLOWED_MODELS: string[] = [];

export const FREE_MODELS_IDS = [
  "openrouter:deepseek/deepseek-r1:free",
  "openrouter:meta-llama/llama-3.3-8b-instruct:free",
  "pixtral-large-latest",
  "mistral-large-latest",
  "gpt-4.1-nano",
];

export const MODEL_DEFAULT = "gpt-4.1-nano";

export const APP_NAME = "Yodoo";
export const APP_DOMAIN = "https://yodoo.ai";

export const SUGGESTIONS = [
  {
    label: "Summary",
    highlight: "Summarize",
    prompt: "Summarize",
    items: [
      "Summarize the French Revolution",
      "Summarize the plot of Inception",
      "Summarize World War II in 5 sentences",
      "Summarize the benefits of meditation",
    ],
    icon: Notepad,
  },
  {
    label: "Code",
    highlight: "Help me",
    prompt: "Help me",
    items: [
      "Help me write a function to reverse a string in JavaScript",
      "Help me create a responsive navbar in HTML/CSS",
      "Help me write a SQL query to find duplicate emails",
      "Help me convert this Python function to JavaScript",
    ],
    icon: Code,
  },
  {
    label: "Design",
    highlight: "Design",
    prompt: "Design",
    items: [
      "Design a color palette for a tech blog",
      "Design a UX checklist for mobile apps",
      "Design 5 great font pairings for a landing page",
      "Design better CTAs with useful tips",
    ],
    icon: PaintBrush,
  },
  {
    label: "Research",
    highlight: "Research",
    prompt: "Research",
    items: [
      "Research the pros and cons of remote work",
      "Research the differences between Apple Vision Pro and Meta Quest",
      "Research best practices for password security",
      "Research the latest trends in renewable energy",
    ],
    icon: BookOpenText,
  },
  {
    label: "Get inspired",
    highlight: "Inspire me",
    prompt: "Inspire me",
    items: [
      "Inspire me with a beautiful quote about creativity",
      "Inspire me with a writing prompt about solitude",
      "Inspire me with a poetic way to start a newsletter",
      "Inspire me by describing a peaceful morning in nature",
    ],
    icon: Sparkle,
  },
  {
    label: "Think deeply",
    highlight: "Reflect on",
    prompt: "Reflect on",
    items: [
      "Reflect on why we fear uncertainty",
      "Reflect on what makes a conversation meaningful",
      "Reflect on the concept of time in a simple way",
      "Reflect on what it means to live intentionally",
    ],
    icon: Brain,
  },
];

export const SYSTEM_PROMPT_DEFAULT = `You are Yodoo AI, a thoughtful and clear assistant. Your tone is calm, minimal, and human. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers. When needed, you ask good questions. You don't try to impress—you aim to clarify. You may use metaphors if they bring clarity, but you stay sharp and sincere. You're here to help the user think clearly and move forward, not to overwhelm or overperform.`;

export const MESSAGE_MAX_LENGTH = 10_000;

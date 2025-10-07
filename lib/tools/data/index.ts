import type { ToolConfig } from "../types";

export const toolsData: ToolConfig[] = [
  // First 4 tools - Free for everyone
  {
    id: "image-generator",
    name: "Image Generator",
    description:
      "Create stunning images using Xenet's advanced AI image generation technology.",
    category: "image",
    pricing: "free",
    provider: "Xenet",
    icon: "image",
    imageUrl:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "generation", "creative"],
    features: ["Text to Image", "Style Transfer", "High Resolution"],
    website: "https://Xenet.com",
    accessible: true,
  },
  {
    id: "podcast-generator-free",
    name: "Podcast Generator",
    description:
      "Transform text content into engaging podcasts with AI-powered voice synthesis.",
    category: "audio",
    pricing: "free",
    provider: "Xenet",
    icon: "microphone",
    imageUrl:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "audio", "podcast"],
    features: ["Text to Speech", "Voice Cloning", "Multiple Languages"],
    website: "https://Xenet.com",
    accessible: true,
  },
  {
    id: "video-generator",
    name: "Video Generator",
    description:
      "Generate captivating videos with Xenet's cutting-edge AI video creation tools.",
    category: "video",
    pricing: "free",
    provider: "Xenet",
    icon: "video",
    imageUrl:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "video", "generation"],
    features: ["Text to Video", "Scene Generation", "HD Quality"],
    website: "https://Xenet.com",
    accessible: true,
  },
  {
    id: "text-generator",
    name: "Text Generator",
    description:
      "Advanced AI text generation for any creative or professional need",
    category: "text",
    pricing: "free",
    provider: "Xenet",
    icon: "document",
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "writing", "content"],
    features: ["Creative Writing", "Technical Writing", "Multiple Styles"],
    website: "https://Xenet.com",
    accessible: true,
  },
  // Next 4 tools - Pro required
  {
    id: "finance-ai-analysis",
    name: "Finance AI Analysis",
    description:
      "Advanced AI tool for finance and analysis generation for any creative or professional need",
    category: "text",
    pricing: "pro",
    provider: "Xenet",
    icon: "chart",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "finance", "analysis"],
    features: ["Market Analysis", "Risk Assessment", "Financial Reports"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "podcast-generator-premium",
    name: "Podcast Generator Pro",
    description:
      "Transform text content into engaging podcasts with AI-powered voice synthesis.",
    category: "audio",
    pricing: "pro",
    provider: "Xenet",
    icon: "microphone",
    imageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "audio", "podcast"],
    features: ["Premium Voices", "Advanced Editing", "Commercial Use"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "audiobook-generator",
    name: "Audiobook Generator",
    description:
      "Generate captivating audiobooks with Xenet's cutting-edge AI voice synthesis tools.",
    category: "audio",
    pricing: "pro",
    provider: "Xenet",
    icon: "headphones",
    imageUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "audio", "audiobook"],
    features: ["Long-form Audio", "Character Voices", "Professional Quality"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "code-genius-pro",
    name: "Code Genius Pro",
    description: "AI-powered coding assistant for faster development",
    category: "code",
    pricing: "pro",
    provider: "Xenet",
    icon: "code",
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "coding", "development"],
    features: ["Code Generation", "Debugging", "Multiple Languages"],
    website: "https://Xenet.com",
    accessible: false,
  },
  // Last 4 tools - Unlimited required
  {
    id: "enterprise-ai-suite",
    name: "Enterprise AI Suite",
    description: "Complete AI solution for enterprise-level automation and analysis",
    category: "text",
    pricing: "unlimited",
    provider: "Xenet",
    icon: "enterprise",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "enterprise", "automation"],
    features: ["Custom Models", "API Access", "24/7 Support"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "advanced-video-studio",
    name: "Advanced Video Studio",
    description: "Professional-grade video creation with unlimited rendering and exports",
    category: "video",
    pricing: "unlimited",
    provider: "Xenet",
    icon: "video-studio",
    imageUrl:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "video", "professional"],
    features: ["4K Rendering", "Unlimited Exports", "Custom Branding"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "code-genius-unlimited",
    name: "Code Genius Unlimited",
    description: "Ultimate coding assistant with unlimited AI-powered development tools",
    category: "code",
    pricing: "unlimited",
    provider: "Xenet",
    icon: "code-unlimited",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "coding", "unlimited"],
    features: ["Unlimited Generations", "Custom Models", "Team Collaboration"],
    website: "https://Xenet.com",
    accessible: false,
  },
  {
    id: "ai-research-lab",
    name: "AI Research Lab",
    description: "Advanced research tools with unlimited compute and custom model training",
    category: "text",
    pricing: "unlimited",
    provider: "Xenet",
    icon: "research",
    imageUrl:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=225&fit=crop&crop=center",
    tags: ["AI", "research", "unlimited"],
    features: ["Custom Training", "Unlimited Compute", "Research API"],
    website: "https://Xenet.com",
    accessible: false,
  },
];

export const categories = [
  { id: "all", label: "All Tools", icon: "grid" },
  { id: "image", label: "Image", icon: "image" },
  { id: "video", label: "Video", icon: "video" },
  { id: "audio", label: "Audio", icon: "headphones" },
  { id: "podcast", label: "Podcast", icon: "microphone" },
  { id: "music", label: "Music", icon: "music" },
  { id: "text", label: "Text", icon: "document" },
  { id: "code", label: "Code", icon: "code" },
] as const;

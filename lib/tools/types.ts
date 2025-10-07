export type ToolCategory =
  | "image"
  | "video"
  | "audio"
  | "text"
  | "music"
  | "podcast"
  | "code";

export type ToolPricing = "free" | "pro" | "unlimited";

export type ToolConfig = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  pricing: ToolPricing;
  provider: string;
  icon: string;
  imageUrl: string;
  tags?: string[];
  features?: string[];
  website?: string;
  accessible: boolean;
};

export type ToolsFilter = {
  category?: ToolCategory | "all";
  search?: string;
  pricing?: ToolPricing | "all";
};

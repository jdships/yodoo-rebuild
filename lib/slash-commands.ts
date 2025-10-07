import { SUGGESTIONS } from "./config";

// Map slash commands to suggestion categories
export const SLASH_COMMANDS = {
  "/summarise": "Summary",
  "/summarize": "Summary", 
  "/summary": "Summary",
  "/code": "Code",
  "/programming": "Code",
  "/dev": "Code",
  "/design": "Design",
  "/research": "Research",
  "/inspire": "Get inspired",
  "/inspiration": "Get inspired",
  "/get inspired": "Get inspired",
  "/get-inspire": "Get inspired",
  "/think": "Think deeply",
  "/reflect": "Think deeply",
  "/deep": "Think deeply",
  "/think deeply": "Think deeply",
  "/think-deeply": "Think deeply",
} as const;

export type SlashCommand = keyof typeof SLASH_COMMANDS;

// Get suggestion category from slash command
export function getSuggestionCategoryFromCommand(command: string): string | null {
  const normalizedCommand = command.toLowerCase().trim();
  return SLASH_COMMANDS[normalizedCommand as SlashCommand] || null;
}

// Check if text starts with a slash command
export function isSlashCommand(text: string): boolean {
  return extractSlashCommand(text) !== null;
}

// Extract the slash command from text
export function extractSlashCommand(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) return null;
  
  // Check for multi-word commands first (longer ones first)
  const sortedCommands = Object.keys(SLASH_COMMANDS).sort((a, b) => b.length - a.length);
  
  for (const command of sortedCommands) {
    if (trimmed.toLowerCase().startsWith(command.toLowerCase())) {
      return command;
    }
  }
  
  return null;
}

// Get the prompt text for a suggestion category
export function getPromptForCategory(category: string): string | null {
  const suggestion = SUGGESTIONS.find(s => s.label === category);
  return suggestion?.prompt || null;
}

// Get the items for a suggestion category
export function getItemsForCategory(category: string): string[] {
  const suggestion = SUGGESTIONS.find(s => s.label === category);
  return suggestion?.items || [];
}

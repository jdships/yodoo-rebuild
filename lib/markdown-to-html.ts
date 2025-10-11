import { marked } from "marked";

/**
 * Convert markdown to HTML for use with Tiptap editor
 * Preserves formatting like headings, lists, bold, italic, code blocks, etc.
 */
export function markdownToHTML(markdown: string): string {
  if (!markdown) return "";

  // Configure marked options
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
  });

  // Convert markdown to HTML (use parseInline for synchronous conversion)
  const html = marked.parse(markdown, { async: false }) as string;

  return html;
}


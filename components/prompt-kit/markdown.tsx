import { LinkMarkdown } from "@/app/components/chat/link-markdown";
import { cn } from "@/lib/utils";
import { marked } from "marked";
import { memo, useId, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { ButtonCopy } from "../common/button-copy";
import {
  CodeBlock,
  CodeBlockCode,
  CodeBlockGroup,
} from "../prompt-kit/code-block";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
};

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const LANGUAGE_REGEX = /language-(\w+)/;
const BLOCK_KEY_PREFIX_LENGTH = 20;

function extractLanguage(className?: string): string {
  if (!className) {
    return "plaintext";
  }
  const match = className.match(LANGUAGE_REGEX);
  return match ? match[1] : "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      return (
        <span
          className={cn(
            "rounded-sm bg-primary-foreground px-1 font-mono text-sm",
            className
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    const language = extractLanguage(className);
    const codeContent =
      typeof children === "string" ? children : String(children || "");

    return (
      <CodeBlock className={className}>
        <CodeBlockGroup className="flex h-9 items-center justify-between px-4">
          <div className="py-1 pr-2 font-mono text-muted-foreground text-xs">
            {language}
          </div>
        </CodeBlockGroup>
        <div className="sticky top-16 lg:top-0">
          <div className="absolute right-0 bottom-0 flex h-9 items-center pr-1.5">
            <ButtonCopy code={codeContent} />
          </div>
        </div>
        <CodeBlockCode code={codeContent} language={language} />
      </CodeBlock>
    );
  },
  a({ href, children, ...props }) {
    if (!href) {
      return <span {...props}>{children}</span>;
    }

    return (
      <LinkMarkdown href={href} {...props}>
        {children}
      </LinkMarkdown>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
};

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string;
    components?: Partial<Components>;
  }) {
    return (
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkBreaks]}
      >
        {content}
      </ReactMarkdown>
    );
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          components={components}
          content={block}
          key={`${blockId}-block-${block.slice(0, BLOCK_KEY_PREFIX_LENGTH)}-${index}`}
        />
      ))}
    </div>
  );
}

const Markdown = memo(MarkdownComponent);
Markdown.displayName = "Markdown";

export { Markdown };

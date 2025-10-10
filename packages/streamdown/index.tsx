"use client";

import { createContext, memo, useId, useMemo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { BundledTheme } from "shiki";
import "katex/dist/katex.min.css";
import type { MermaidConfig } from "mermaid";
import { harden } from "rehype-harden";
import type { Pluggable } from "unified";
import { components as defaultComponents } from "./lib/components";
import { parseMarkdownIntoBlocks } from "./lib/parse-blocks";
import { parseIncompleteMarkdown } from "./lib/parse-incomplete-markdown";
import { cn } from "./lib/utils";

export type { MermaidConfig } from "mermaid";

export type ControlsConfig =
  | boolean
  | {
      table?: boolean;
      code?: boolean;
      mermaid?: boolean;
    };

export type StreamdownProps = Options & {
  parseIncompleteMarkdown?: boolean;
  className?: string;
  shikiTheme?: [BundledTheme, BundledTheme];
  mermaidConfig?: MermaidConfig;
  controls?: ControlsConfig;
  isAnimating?: boolean;
};

export const defaultRehypePlugins: Record<string, Pluggable> = {
  harden: [
    harden,
    {
      allowedImagePrefixes: ["*"],
      allowedLinkPrefixes: ["*"],
      defaultOrigin: undefined,
      allowDataImages: true,
    },
  ],
  raw: rehypeRaw,
  katex: [rehypeKatex, { errorColor: "var(--color-muted-foreground)" }],
} as const;

export const defaultRemarkPlugins: Record<string, Pluggable> = {
  gfm: [remarkGfm, {}],
  math: [remarkMath, { singleDollarTextMath: false }],
} as const;

export const ShikiThemeContext = createContext<[BundledTheme, BundledTheme]>([
  "github-light" as BundledTheme,
  "github-dark" as BundledTheme,
]);

export const MermaidConfigContext = createContext<MermaidConfig | undefined>(
  undefined
);

export const ControlsContext = createContext<ControlsConfig>(true);

export type StreamdownRuntimeContextType = {
  isAnimating: boolean;
};

export const StreamdownRuntimeContext =
  createContext<StreamdownRuntimeContextType>({
    isAnimating: false,
  });

type BlockProps = Options & {
  content: string;
  shouldParseIncompleteMarkdown: boolean;
};

const Block = memo(
  ({ content, shouldParseIncompleteMarkdown, ...props }: BlockProps) => {
    const parsedContent = useMemo(
      () =>
        typeof content === "string" && shouldParseIncompleteMarkdown
          ? parseIncompleteMarkdown(content.trim())
          : content,
      [content, shouldParseIncompleteMarkdown]
    );

    return <ReactMarkdown {...props}>{parsedContent}</ReactMarkdown>;
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

Block.displayName = "Block";

export const Streamdown = memo(
  ({
    children,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    components,
    rehypePlugins = Object.values(defaultRehypePlugins),
    remarkPlugins = Object.values(defaultRemarkPlugins),
    className,
    shikiTheme = ["github-light", "github-dark"],
    mermaidConfig,
    controls = true,
    isAnimating = false,
    ...props
  }: StreamdownProps) => {
    // Parse the children to remove incomplete markdown tokens if enabled
    const generatedId = useId();
    const blocks = useMemo(
      () =>
        parseMarkdownIntoBlocks(typeof children === "string" ? children : ""),
      [children]
    );

    return (
      <ShikiThemeContext.Provider value={shikiTheme}>
        <MermaidConfigContext.Provider value={mermaidConfig}>
          <ControlsContext.Provider value={controls}>
            <StreamdownRuntimeContext.Provider value={{ isAnimating }}>
              <div className={cn("space-y-4", className)}>
                {blocks.map((block, index) => (
                  <Block
                    components={{
                      ...defaultComponents,
                      ...components,
                    }}
                    content={block}
                    // biome-ignore lint/suspicious/noArrayIndexKey: "required"
                    key={`${generatedId}-block-${index}`}
                    rehypePlugins={rehypePlugins}
                    remarkPlugins={remarkPlugins}
                    shouldParseIncompleteMarkdown={
                      shouldParseIncompleteMarkdown
                    }
                    {...props}
                  />
                ))}
              </div>
            </StreamdownRuntimeContext.Provider>
          </ControlsContext.Provider>
        </MermaidConfigContext.Provider>
      </ShikiThemeContext.Provider>
    );
  },
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.shikiTheme === nextProps.shikiTheme &&
    prevProps.isAnimating === nextProps.isAnimating
);
Streamdown.displayName = "Streamdown";

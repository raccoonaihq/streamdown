"use client";

import { useId, useMemo, useState } from "react";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const exampleMarkdown = `# Streamdown runtime preview

Type Markdown on the left and see it render immediately on the right.

- Supports tables, math, code blocks, and more.
- Parses incomplete Markdown safely by default.

## Code

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}\`;
}
console.log(greet("Streamdown"));
\`\`\`

## Math

Inline math: $E = mc^2$ and block math:

$$
\\int_0^1 x^2 \\, dx = \\frac{1}{3}
$$

## Table

| Syntax | Purpose |
| --- | --- |
| **Bold** | Emphasis |
| \`code\` | Monospace |
| [link](https://streamdown.dev) | Navigation |`;

export function MarkdownPlayground() {
  const [markdown, setMarkdown] = useState(exampleMarkdown);
  const inputId = useId();

  const previewContent = useMemo(
    () => (markdown.trim().length > 0 ? markdown : exampleMarkdown),
    [markdown]
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-xs font-medium text-primary">Runtime demo</p>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Markdown playground</h1>
          <p className="text-sm text-muted-foreground">
            Parse and render text to Markdown in real time with Streamdown.
          </p>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={inputId}>
              Markdown input
            </label>
            <Textarea
              id={inputId}
              minLength={0}
              onChange={(event) => setMarkdown(event.target.value)}
              placeholder="Type Markdown here..."
              value={markdown}
            />
            <p className="text-xs text-muted-foreground">
              The preview updates as you type. Leave the field empty to restore
              the starter example.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setMarkdown(exampleMarkdown)} type="button">
              Reset example
            </Button>
            <Button
              onClick={() => setMarkdown("")}
              type="button"
              variant="outline"
            >
              Clear
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Preview</p>
              <p className="text-xs text-muted-foreground">
                Rendered with Streamdown and safety-first defaults.
              </p>
            </div>
          </div>
          <div className="h-full overflow-y-auto rounded-lg border bg-background/60 p-4">
            <Streamdown className="prose max-w-none dark:prose-invert">
              {previewContent}
            </Streamdown>
          </div>
        </section>
      </div>
    </div>
  );
}



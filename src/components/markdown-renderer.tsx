"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({
  content,
  className,
}: MarkdownRendererProps) => {
  return (
    <div className={cn("markdown-content", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-2xl font-semibold mt-8 mb-4 first:mt-0"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-xl font-semibold mt-8 mb-4 first:mt-0"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-lg font-semibold mt-6 mb-3 first:mt-0"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className="mb-4 leading-relaxed text-foreground last:mb-0 [[li_&]:mb-0] [[li_&]:inline]"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="my-4 space-y-2 list-disc list-outside ml-6"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="my-4 space-y-4 list-decimal list-outside ml-6 font-bold text-foreground"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li
              className="leading-relaxed pl-1 font-normal text-foreground"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong
              className="font-semibold text-foreground underline decoration-primary/20 underline-offset-4"
              {...props}
            />
          ),
          code: ({
            inline,
            children,
            ...props
          }: React.HTMLAttributes<HTMLElement> & {
            inline?: boolean;
          }) =>
            inline ? (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            ) : (
              <div className="my-4 rounded-md border bg-muted/50 overflow-hidden">
                <code
                  className="block p-4 text-sm font-mono overflow-x-auto whitespace-pre"
                  {...props}
                >
                  {children}
                </code>
              </div>
            ),
          pre: ({ ...props }) => (
            <pre className="m-0 bg-transparent" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-8 border-border" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

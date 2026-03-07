"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeRaw from "rehype-raw"
import type { Components } from "react-markdown"
import Link from "next/link"

interface ModuleContentProps {
  content: string
}

const components: Components = {
  h1: ({ children, ...props }) => {
    const id =
      typeof children === "string"
        ? children.toLowerCase().replace(/\s+/g, "-")
        : undefined
    return (
      <h1 id={id} {...props}>
        {children}
      </h1>
    )
  },
  h2: ({ children, ...props }) => {
    const id =
      typeof children === "string"
        ? children.toLowerCase().replace(/\s+/g, "-")
        : undefined
    return (
      <h2 id={id} {...props}>
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => {
    const id =
      typeof children === "string"
        ? children.toLowerCase().replace(/\s+/g, "-")
        : undefined
    return (
      <h3 id={id} {...props}>
        {children}
      </h3>
    )
  },
  a: ({ href, children, ...props }) => {
    if (href && href.startsWith("/modules/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table {...props}>{children}</table>
    </div>
  ),
  pre: ({ children, ...props }) => (
    <pre className="relative" {...props}>
      {children}
    </pre>
  ),
}

export function ModuleContent({ content }: ModuleContentProps) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

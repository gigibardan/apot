import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          code: ({ node, inline, ...props }: any) => (
            inline ? (
              <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" />
            ) : (
              <code {...props} className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" />
            )
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-1 my-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-1 my-2" />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold mt-6 mb-4" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold mt-5 mb-3" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-bold mt-4 mb-2" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="my-2 leading-relaxed" />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table {...props} className="min-w-full border-collapse border border-border" />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="border border-border bg-muted px-4 py-2 text-left font-semibold" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-border px-4 py-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

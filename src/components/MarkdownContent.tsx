/**
 * Server component that renders pre-compiled markdown HTML.
 * Replaces MDXRemote's heavy JSX compilation with instant HTML insertion.
 */
export function MarkdownContent({ html }: { html: string }) {
    return (
        <div dangerouslySetInnerHTML={{ __html: html }} />
    );
}

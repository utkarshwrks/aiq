/**
 * First focusable element on every page. Visually hidden until focused,
 * then rendered as a bracketed control in the top-left the way any other
 * action in the product is.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:border focus:border-teal focus:bg-elevated focus:px-4 focus:py-2 focus:font-mono focus:text-[length:var(--text-xs)] focus:uppercase focus:tracking-[0.12em] focus:text-teal"
    >
      Skip to content
    </a>
  );
}

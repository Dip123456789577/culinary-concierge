type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reports an error that was caught by a React error boundary.
 * In production, React does not rethrow boundary-caught errors to window.onerror,
 * so this utility forwards them for any registered error reporting hooks.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  // Loaders and server functions may throw a raw Response; pull out status+URL
  // instead of the opaque "[object Response]" string.
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[ErrorBoundary]", message, { context, ...(stack && { stack }) });
}

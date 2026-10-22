export function npmErrorSummary(error) {
  const detail = String(error.stderr ?? error.stdout ?? error.message ?? "");
  if (/\b404\b|E404|Not Found/i.test(detail)) return "404 not found";
  if (error.code && /^[A-Z0-9_-]+$/i.test(String(error.code))) return String(error.code);
  return "request failed";
}

export function truncateOutput(output, limit = 4000) {
  const text = String(output).trim();
  if (!text) return '\nOutput: (no output captured)';
  const excerpt = text.length > limit ? `${text.slice(0, limit)}\n...[output truncated]` : text;
  return `\nOutput excerpt:\n${excerpt}`;
}

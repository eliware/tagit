const OUTPUT_LIMIT = 12000;

export function formatDiffExcerpt(diff) {
  return diff.length > OUTPUT_LIMIT
    ? `${diff.slice(0, OUTPUT_LIMIT)}\n...[diff truncated at ${OUTPUT_LIMIT} characters]`
    : diff;
}

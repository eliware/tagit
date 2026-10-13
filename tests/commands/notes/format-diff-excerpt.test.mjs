import { formatDiffExcerpt } from "../../../src/commands/notes/format-diff-excerpt.mjs";

test("keeps diff excerpts at the configured limit", () => {
  const diff = "x".repeat(12000);
  expect(formatDiffExcerpt(diff)).toBe(diff);
});

test("truncates long diff excerpts and reports the limit", () => {
  const excerpt = formatDiffExcerpt("x".repeat(12001));
  expect(excerpt).toHaveLength(12000 + "\n...[diff truncated at 12000 characters]".length);
  expect(excerpt).toContain("diff truncated at 12000 characters");
});

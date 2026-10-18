import { formatNotesReport } from "../../../../src/commands/notes/format/report.mjs";

test("formats notes sections and empty values", () => {
  expect(formatNotesReport("v1.0.0", { commits: "", files: "", excerpt: "" })).toContain("(none)");
});

test("reports the tag range without a version suggestion", () => {
  const report = formatNotesReport("v1.0.0", {
    commits: "abc123 update docs",
    files: "M README.md",
    excerpt: "+details",
  });
  expect(report).toContain("Range: v1.0.0..current commit");
  expect(report).not.toMatch(/suggested release|release level|version bump/i);
});

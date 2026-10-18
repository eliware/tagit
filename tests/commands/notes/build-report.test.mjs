import { buildNotesReport } from "../../../src/commands/notes/build-report.mjs";

test("composes the tag range, change collection, and formatter", () => {
  const exec = (_command, args) =>
    args[0] === "describe" ? "v1.0.0\n" : args[0] === "log" ? "" : "";
  const report = buildNotesReport(exec);
  expect(report).toContain("TAGIT NOTES REPORT");
  expect(report).toContain("Range: v1.0.0..current commit");
  expect(report).not.toContain("Suggested release:");
});

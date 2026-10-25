import { parseWorkflow } from "../../../../src/repository/metadata/workflow/parser.mjs";

test("parses top-level workflow sections and ignores comments and blank lines", () => {
  const sections = parseWorkflow(
    "on:\n  push:\n\n# omitted\njobs:\n  test:\n    runs-on: ubuntu-latest",
  );
  expect(sections.has("on")).toBe(true);
  expect(sections.get("on")).toEqual(["  push:"]);
  expect(sections.has("jobs")).toBe(true);
  expect(sections.get("jobs")).toEqual(["  test:", "    runs-on: ubuntu-latest"]);
});

test("preserves quoted workflow keys", () => {
  expect(parseWorkflow('"on":\n  push:\n  pull_request:\n').has('"on"')).toBe(true);
});

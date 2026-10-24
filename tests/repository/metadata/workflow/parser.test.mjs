import { parseJobs, parseWorkflow } from "../../../../src/repository/metadata/workflow/parser.mjs";

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

test("parses job blocks and keeps each block's steps", () => {
  const jobs = parseJobs([
    "  test:",
    "    runs-on: ubuntu-latest",
    "    steps: []",
    "  build:",
    "    runs-on: windows-latest",
  ]);
  expect(jobs.get("test")).toEqual(["    runs-on: ubuntu-latest", "    steps: []"]);
  expect(jobs.get("build")).toEqual(["    runs-on: windows-latest"]);
});

test("ignores nested keys and lines without a job header", () => {
  expect(parseJobs(["    runs-on: ubuntu-latest", "  invalid", "    steps: []"])).toEqual(
    new Map(),
  );
});

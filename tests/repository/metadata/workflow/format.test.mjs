import { parseJobs, parseWorkflow } from "../../../../src/repository/metadata/workflow/format.mjs";

test("parses workflow sections and job blocks", () => {
  const sections = parseWorkflow(
    "on:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest",
  );
  expect(sections.has("on")).toBe(true);
  const jobs = parseJobs(sections.get("jobs"));
  expect(jobs.get("test")).toContain("    runs-on: ubuntu-latest");
});

test("parses quoted workflow keys and ignores comments", () => {
  expect(
    parseWorkflow('"on":\n  push:\n# omitted\njobs:\n  test:\n    steps: []').has('"on"'),
  ).toBe(true);
});

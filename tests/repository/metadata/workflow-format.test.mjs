import {
  hasMainPushTrigger,
  hasTagTrigger,
  jobHasCommand,
  jobHasUse,
  jobValue,
  parseJobs,
  parseWorkflow,
} from "../../../src/repository/metadata/workflow-format.mjs";

test("parses workflow sections and job blocks", () => {
  const sections = parseWorkflow(
    "on:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest",
  );
  expect(sections.has("on")).toBe(true);
  const jobs = parseJobs(sections.get("jobs"));
  expect(jobs.get("test")).toContain("    runs-on: ubuntu-latest");
});

test("recognizes main pushes and canonical numeric tag filters", () => {
  expect(hasMainPushTrigger(["  push:", "    branches:", "      - main"])).toBe(true);
  expect(hasMainPushTrigger(["  pull_request:"])).toBe(false);
  expect(hasTagTrigger(["  tags:", '      - "v[0-9]*.[0-9]*.[0-9]*"'])).toBe(true);
  expect(hasTagTrigger(["  tags:", "      - v*"])).toBe(false);
  expect(hasTagTrigger([])).toBe(false);
});

test("checks job commands, action versions, and values", () => {
  const lines = [
    "      - run: npm ci",
    "      - uses: actions/setup-node@v7",
    "    needs: validate",
  ];
  expect(jobHasCommand(lines, "npm ci")).toBe(true);
  expect(jobHasCommand(lines, "npm test")).toBe(false);
  expect(jobHasUse(lines, "actions/setup-node@v7")).toBe(true);
  expect(jobHasUse(lines, "actions/checkout@v6")).toBe(false);
  expect(jobValue(lines, "needs")).toBe("validate");
  expect(jobValue(lines, "if")).toBeNull();
});

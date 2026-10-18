import {
  jobHasCommand,
  jobHasUse,
  jobValue,
} from "../../../../src/repository/metadata/workflow/job-rules.mjs";

test("checks job commands and action prefixes", () => {
  const lines = ["      - run: npm ci", "      - uses: actions/setup-node@v7"];
  expect(jobHasCommand(lines, "npm ci")).toBe(true);
  expect(jobHasCommand(lines, "npm test")).toBe(false);
  expect(jobHasUse(lines, "actions/setup-node@v7")).toBe(true);
  expect(jobHasUse(lines, "actions/checkout@v6")).toBe(false);
});

test("reads job values and reports absent values", () => {
  const lines = ["    needs: validate"];
  expect(jobValue(lines, "needs")).toBe("validate");
  expect(jobValue(lines, "if")).toBeNull();
});

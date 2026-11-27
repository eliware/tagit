import getIndentation from "../../../../src/repository/metadata/workflow/indentation.mjs";

test("counts leading whitespace in a workflow line", () => {
  expect(getIndentation("    steps:")).toBe(4);
  expect(getIndentation("jobs:")).toBe(0);
});

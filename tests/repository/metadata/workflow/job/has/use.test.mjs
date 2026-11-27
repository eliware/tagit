import jobHasUse from "../../../../../../src/repository/metadata/workflow/job/has/use.mjs";

test("checks action prefixes", () => {
  const lines = ["      - uses: actions/setup-node@v7"];
  expect(jobHasUse(lines, "actions/setup-node@v7")).toBe(true);
  expect(jobHasUse(lines, "actions/checkout@v6")).toBe(false);
  expect(jobHasUse(["      - name: test"], "actions/checkout@v6")).toBe(false);
});

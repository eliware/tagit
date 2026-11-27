import jobHasCommand from "../../../../../../src/repository/metadata/workflow/job/has/command.mjs";

test("checks job commands", () => {
  const lines = ["      - run: npm ci"];
  expect(jobHasCommand(lines, "npm ci")).toBe(true);
  expect(jobHasCommand(lines, "npm test")).toBe(false);
  expect(jobHasCommand(["      - name: test"], "npm test")).toBe(false);
});

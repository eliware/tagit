import jobValue from "../../../../../src/repository/metadata/workflow/job/value.mjs";

test("reads job values and reports absent values", () => {
  const lines = ["    needs: validate"];
  expect(jobValue(lines, "needs")).toBe("validate");
  expect(jobValue(lines, "if")).toBeNull();
});

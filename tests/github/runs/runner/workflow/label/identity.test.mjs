import resolveWorkflowJobName from "../../../../../../src/github/runs/runner/workflow/label/identity.mjs";

test("resolves and normalizes a workflow display name", () => {
  expect(resolveWorkflowJobName("validate", ["    name: 'Validation'"])).toBe("Validation");
});

test("falls back to the job id when no display name exists", () => {
  expect(resolveWorkflowJobName("validate", ["    runs-on: ubuntu-latest"])).toBe("validate");
});

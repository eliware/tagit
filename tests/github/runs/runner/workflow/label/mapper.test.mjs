import { mapWorkflowJobRunnerLabels } from "../../../../../../src/github/runs/runner/workflow/label/mapper.mjs";

test("maps parsed job ids and display names to runner labels", () => {
  expect(
    mapWorkflowJobRunnerLabels(
      new Map([
        ["validate", ["    runs-on: ubuntu-latest"]],
        ["win", ["    name: Windows checks", "    runs-on: windows-latest"]],
      ]),
    ),
  ).toEqual({ validate: ["ubuntu"], win: ["windows"], "Windows checks": ["windows"] });
});

test("records prototype-named job ids as own properties", () => {
  const labels = mapWorkflowJobRunnerLabels(
    new Map([["__proto__", ["    runs-on: ubuntu-latest"]]]),
  );
  expect(Object.hasOwn(labels, "__proto__")).toBe(true);
  expect(labels["__proto__"]).toEqual(["ubuntu"]);
});

test("ignores jobs without runner labels", () => {
  expect(mapWorkflowJobRunnerLabels(new Map([["job", ["    steps: []"]]]))).toEqual({});
});

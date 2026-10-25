import { jest } from "@jest/globals";
import { readWorkflowRunnerLabelsFile } from "../../../../src/github/runs/runner/file-reader.mjs";
import { parseWorkflowRunnerLabels } from "../../../../src/github/runs/runner/workflow/label/reader.mjs";

test("returns no labels when the requested workflow file is absent", () => {
  expect(
    readWorkflowRunnerLabelsFile({ existsSync: () => false }, ".github/workflows/ci.yaml"),
  ).toEqual({});
});

test("reads runner labels from a requested workflow file", () => {
  const fs = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => "jobs:\n  validate:\n    runs-on: ubuntu-latest\n"),
  };
  const contents = "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
  fs.readFileSync.mockReturnValue(contents);
  expect(readWorkflowRunnerLabelsFile(fs, ".github/workflows/npm.yaml")).toEqual(
    parseWorkflowRunnerLabels(contents),
  );
  expect(fs.readFileSync).toHaveBeenCalledWith(".github/workflows/npm.yaml", "utf8");
});

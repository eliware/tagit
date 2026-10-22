import { jest } from "@jest/globals";
import {
  readWorkflowRunnerLabels,
  readWorkflowRunnerLabelsFromGit,
} from "../../../src/github/runs/runner-label-reader.mjs";

test("returns no labels when the requested workflow file is absent", () => {
  expect(
    readWorkflowRunnerLabels({ existsSync: () => false }, ".github/workflows/ci.yaml"),
  ).toEqual({});
});

test("reads runner labels from a requested workflow file", () => {
  const fs = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => "jobs:\n  validate:\n    runs-on: ubuntu-latest\n"),
  };
  expect(readWorkflowRunnerLabels(fs, ".github/workflows/npm.yaml")).toEqual({
    validate: ["ubuntu"],
  });
  expect(fs.readFileSync).toHaveBeenCalledWith(".github/workflows/npm.yaml", "utf8");
});

test("reads workflow runner configuration from the exact release revision", () => {
  const execFileSync = jest.fn((_command, args) => {
    if (args[1].endsWith(".github/workflows/npm.yaml"))
      return "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
    throw new Error("missing workflow");
  });
  expect(
    readWorkflowRunnerLabelsFromGit(execFileSync, "abc123", [
      ".github/workflows/ci.yaml",
      ".github/workflows/npm.yaml",
    ]),
  ).toEqual({ validate: ["ubuntu"] });
  expect(execFileSync).toHaveBeenNthCalledWith(
    2,
    "git",
    ["show", "abc123:.github/workflows/npm.yaml"],
    { encoding: "utf8" },
  );
});

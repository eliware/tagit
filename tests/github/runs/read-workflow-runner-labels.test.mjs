import { jest } from "@jest/globals";
import {
  parseWorkflowRunnerLabels,
  readWorkflowRunnerLabels,
  readWorkflowRunnerLabelsFromGit,
} from "../../../src/github/runs/read-workflow-runner-labels.mjs";

test("maps workflow job ids and display names to runner platforms", () => {
  expect(
    parseWorkflowRunnerLabels(
      `jobs:\n  validate:\n    runs-on: ubuntu-latest\n  win:\n    name: Windows checks\n    runs-on: windows-latest\n`,
    ),
  ).toEqual({ validate: ["ubuntu"], win: ["windows"], "Windows checks": ["windows"] });
});

test("handles missing jobs, missing runners, unknown runners, and unnamed jobs", () => {
  expect(parseWorkflowRunnerLabels("name: no jobs")).toEqual({});
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  no_runner:\n    steps: []\n  other:\n    runs-on: self-hosted\n",
    ),
  ).toEqual({ other: [] });
  expect(
    readWorkflowRunnerLabels({ existsSync: () => false }, ".github/workflows/ci.yaml"),
  ).toEqual({});
});

test("reads runner labels from a requested workflow file", () => {
  const fs = {
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => "jobs:\n  validate:\n    runs-on: ubuntu-latest\n"),
  };
  expect(readWorkflowRunnerLabels(fs, ".github/workflows/publish.yaml")).toEqual({
    validate: ["ubuntu"],
  });
  expect(fs.readFileSync).toHaveBeenCalledWith(".github/workflows/publish.yaml", "utf8");
});

test("reads workflow runner configuration from the exact release revision", () => {
  const execFileSync = jest.fn((_command, args) => {
    if (args[1].endsWith(".github/workflows/publish.yaml"))
      return "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
    throw new Error("missing workflow");
  });
  expect(
    readWorkflowRunnerLabelsFromGit(execFileSync, "abc123", [
      ".github/workflows/ci.yaml",
      ".github/workflows/publish.yaml",
    ]),
  ).toEqual({ validate: ["ubuntu"] });
  expect(execFileSync).toHaveBeenNthCalledWith(
    2,
    "git",
    ["show", "abc123:.github/workflows/publish.yaml"],
    {
      encoding: "utf8",
    },
  );
});

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

test("records runner labels for prototype-named jobs", () => {
  const labels = parseWorkflowRunnerLabels("jobs:\n  __proto__:\n    runs-on: ubuntu-latest\n");
  expect(Object.hasOwn(labels, "__proto__")).toBe(true);
  expect(labels["__proto__"]).toEqual(["ubuntu"]);
});

test("classifies runner labels from inline and block sequences", () => {
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  linux:\n    runs-on: [self-hosted, ubuntu-latest]\n  windows:\n    runs-on:\n      - self-hosted\n      - windows-2025\n  ambiguous:\n    runs-on: [ubuntu-latest, windows-latest]\n",
    ),
  ).toEqual({ linux: ["ubuntu"], windows: ["windows"], ambiguous: [] });
});

test("stops a block runner sequence at the next job field", () => {
  expect(
    parseWorkflowRunnerLabels(
      "jobs:\n  empty:\n    runs-on:\n    steps:\n      - run: test\n  nested:\n    runs-on:\n      group: linux\n",
    ),
  ).toEqual({ empty: [], nested: [] });
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
    {
      encoding: "utf8",
    },
  );
});

import { jest } from "@jest/globals";
import { readWorkflowContentsFromGit } from "../../../../../src/github/runs/runner/workflow/reader.mjs";

test("reads workflow contents from the requested revision", () => {
  const content = "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
  const execFileSync = jest.fn(() => content);
  expect(
    readWorkflowContentsFromGit(execFileSync, "abc123", [".github/workflows/npm.yaml"]),
  ).toEqual({ ".github/workflows/npm.yaml": content });
  expect(execFileSync).toHaveBeenCalledWith("git", ["show", "abc123:.github/workflows/npm.yaml"], {
    encoding: "utf8",
  });
});

test("skips workflow paths that do not exist in the requested revision", () => {
  const execFileSync = jest.fn(() => {
    const error = {
      stderr: Buffer.from("fatal: path '.github/workflows/ci.yaml' does not exist in 'abc123'"),
    };
    throw error;
  });
  expect(
    readWorkflowContentsFromGit(execFileSync, "abc123", [".github/workflows/ci.yaml"]),
  ).toEqual(Object.create(null));
});

test("skips missing workflow paths when Git reports the error on stdout", () => {
  const execFileSync = jest.fn(() => {
    throw {
      stdout: Buffer.from("fatal: path '.github/workflows/npm.yaml' does not exist in 'abc123'"),
    };
  });
  expect(
    readWorkflowContentsFromGit(execFileSync, "abc123", [".github/workflows/npm.yaml"]),
  ).toEqual(Object.create(null));
});

test("propagates Git failures that do not report a missing workflow path", () => {
  const error = new Error("fatal: not a git repository");
  const execFileSync = jest.fn(() => {
    throw error;
  });
  expect(() =>
    readWorkflowContentsFromGit(execFileSync, "abc123", [".github/workflows/ci.yaml"]),
  ).toThrow(error);
});

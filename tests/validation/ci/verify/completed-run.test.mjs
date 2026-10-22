import { jest } from "@jest/globals";
import { verifyCompletedRun } from "../../../../src/validation/ci/verify/completed-run.mjs";
test("recognizes Ubuntu from workflow runner metadata when the job name is test", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "abc",
      jobs: [{ databaseId: 10, name: "test", status: "completed", conclusion: "success" }],
    }),
  );
  const log = { info: jest.fn() };
  expect(verifyCompletedRun(exec, log, { databaseId: 1 }, "abc", { test: ["ubuntu"] })).toEqual({
    runId: 1,
    headSha: "abc",
    ubuntu: true,
  });
  expect(log.info).toHaveBeenCalledWith("GitHub Actions CI verified for abc: Ubuntu passed.");
});

test("uses default runner labels when none are supplied", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "abc",
      jobs: [{ name: "test", status: "completed", conclusion: "success" }],
    }),
  );
  expect(verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 1 }, "abc")).toBeNull();
});

test("rejects a non-passing Windows job even when Ubuntu passes", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "abc",
      jobs: [
        { databaseId: 10, name: "test", status: "completed", conclusion: "success" },
        { databaseId: 11, name: "test windows", status: "completed", conclusion: "skipped" },
      ],
    }),
  );
  expect(
    verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 1 }, "abc", {
      test: ["ubuntu"],
      "test windows": ["windows"],
    }),
  ).toBeNull();
});

test("rejects a non-matching run result", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "other",
      jobs: [
        { databaseId: 10, name: "test", status: "completed", conclusion: "success" },
        { databaseId: 11, name: "test-windows", status: "completed", conclusion: "success" },
      ],
    }),
  );
  expect(
    verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 3 }, "abc", {
      test: ["ubuntu"],
      "test-windows": ["windows"],
    }),
  ).toBeNull();
});

test("returns Windows evidence when both platform jobs pass", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "abc",
      jobs: [
        { name: "test", status: "completed", conclusion: "success" },
        { name: "test-windows", status: "completed", conclusion: "success" },
      ],
    }),
  );
  expect(
    verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 1 }, "abc", {
      test: ["ubuntu"],
      "test-windows": ["windows"],
    }),
  ).toMatchObject({ windows: true });
});

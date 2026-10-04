import { jest } from "@jest/globals";
import { verifyCompletedRun } from "../../../src/validation/ci/verify-completed-run.mjs";
test("recognizes Ubuntu from workflow runner metadata when the job name is test", () => {
  const exec = jest.fn(() =>
    JSON.stringify({
      status: "completed",
      conclusion: "success",
      headSha: "abc",
      jobs: [{ databaseId: 10, name: "test", status: "completed", conclusion: "success" }],
    }),
  );
  expect(
    verifyCompletedRun(exec, { info: jest.fn() }, { databaseId: 1 }, "abc", { test: ["ubuntu"] }),
  ).toMatchObject({ ubuntu: true, windows: false });
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

test("rejects malformed completion data and a completed non-ubuntu run", () => {
  const malformed = [
    "null",
    JSON.stringify({ conclusion: "success" }),
    JSON.stringify({ status: "completed" }),
  ];
  for (const details of malformed) {
    expect(() =>
      verifyCompletedRun(
        jest.fn(() => details),
        { info: jest.fn() },
        { databaseId: 2 },
        "abc",
      ),
    ).toThrow("malformed completion metadata");
  }
  const noUbuntu = JSON.stringify({
    status: "completed",
    conclusion: "success",
    headSha: "abc",
    jobs: [{ name: "test", status: "completed", conclusion: "success" }],
  });
  expect(
    verifyCompletedRun(
      jest.fn(() => noUbuntu),
      { info: jest.fn() },
      { databaseId: 3 },
      "abc",
    ),
  ).toBeNull();
});

test("uses runner labels for both platforms and rejects a different head", () => {
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
  const exactHead = JSON.stringify({
    status: "completed",
    conclusion: "success",
    headSha: "abc",
    jobs: [
      { databaseId: 10, name: "test", status: "completed", conclusion: "success" },
      { databaseId: 11, name: "test-windows", status: "completed", conclusion: "success" },
    ],
  });
  const passed = jest.fn(() => exactHead);
  expect(
    verifyCompletedRun(passed, { info: jest.fn() }, { databaseId: 3 }, "abc", {
      test: ["ubuntu"],
      "test-windows": ["windows"],
    }),
  ).toMatchObject({ windows: true });
});

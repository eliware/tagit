import { jest } from "@jest/globals";
import { verifyLatestCi } from "../../../../src/validation/ci/verify/exact-head.mjs";

const log = { info: jest.fn() };

function successfulRun(id = 1) {
  return JSON.stringify([
    { databaseId: id, status: "completed", conclusion: "success", headSha: "abc" },
  ]);
}

function successfulDetails(headSha = "abc") {
  return JSON.stringify({
    status: "completed",
    conclusion: "success",
    headSha,
    jobs: [{ name: "ubuntu-latest", status: "completed", conclusion: "success" }],
  });
}

function exactHeadExec(runList, runDetails) {
  return jest.fn((_command, args) => {
    if (args[0] === "remote") return "https://github.com/eliware/demo.git";
    if (args[0] === "api")
      return JSON.stringify({
        jobs: [{ id: 10, name: "ubuntu-latest", labels: ["ubuntu-latest"] }],
      });
    if (args[1] === "list") return runList;
    return runDetails;
  });
}

test("verifies a successful exact-head Ubuntu run", () => {
  const exec = exactHeadExec(successfulRun(), successfulDetails());
  expect(
    verifyLatestCi(exec, log, {
      headSha: "abc",
      runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] },
    }),
  ).toMatchObject({
    runId: 1,
    ubuntu: true,
  });
});

test("polls an in-progress exact-head run and rechecks it", () => {
  let listed = 0;
  const exec = jest.fn((command, args) => {
    if (args[0] === "remote") return "https://github.com/eliware/demo.git";
    if (args[0] === "api")
      return JSON.stringify({
        jobs: [{ id: 10, name: "ubuntu-latest", labels: ["ubuntu-latest"] }],
      });
    if (args[1] === "list")
      return listed++ === 0
        ? JSON.stringify([{ databaseId: 2, status: "in_progress", conclusion: "", headSha: "abc" }])
        : successfulRun(2);
    if (args[1] === "watch") return "";
    return successfulDetails();
  });
  expect(
    verifyLatestCi(exec, log, {
      headSha: "abc",
      runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] },
    }),
  ).toMatchObject({ runId: 2 });
});

test("does not poll an in-progress run when completion waiting is disabled", () => {
  const exec = jest.fn((command, args) =>
    args[0] === "remote"
      ? "https://github.com/eliware/demo.git"
      : args[1] === "list"
        ? JSON.stringify([{ databaseId: 2, status: "in_progress", conclusion: "", headSha: "abc" }])
        : "",
  );
  expect(() =>
    verifyLatestCi(exec, log, {
      headSha: "abc",
      waitForCompletion: false,
      runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] },
    }),
  ).toThrow("No passing");
  expect(exec.mock.calls.some(([, args]) => args[1] === "watch")).toBe(false);
});

test("rejects missing or stale exact-head evidence", () => {
  expect(() => verifyLatestCi(jest.fn(), log)).toThrow("commit SHA is required");
  expect(() =>
    verifyLatestCi(
      jest.fn((command, args) =>
        args[0] === "remote" ? "https://github.com/eliware/demo.git" : "[]",
      ),
      log,
      { headSha: "abc", runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] } },
    ),
  ).toThrow("No passing");
});

test("uses older successful exact-head evidence when the newest run failed", () => {
  let viewed = 0;
  const exec = jest.fn((command, args) => {
    if (args[0] === "remote") return "https://github.com/eliware/demo.git";
    if (args[0] === "api")
      return JSON.stringify({
        jobs: [{ id: 10, name: "ubuntu-latest", labels: ["ubuntu-latest"] }],
      });
    if (args[1] === "list")
      return JSON.stringify([
        { databaseId: 4, status: "completed", conclusion: "failure", headSha: "abc" },
        { databaseId: 3, status: "completed", conclusion: "success", headSha: "abc" },
      ]);
    viewed += 1;
    return successfulDetails();
  });
  expect(
    verifyLatestCi(exec, log, {
      headSha: "abc",
      runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] },
    }),
  ).toMatchObject({ runId: 3 });
  expect(viewed).toBe(1);
});

test("rejects exact-head runs without passing Ubuntu evidence", () => {
  const exec = exactHeadExec(successfulRun(4), successfulDetails("other"));
  expect(() =>
    verifyLatestCi(exec, log, {
      headSha: "abc",
      runnerLabelsByJobName: { "ubuntu-latest": ["ubuntu"] },
    }),
  ).toThrow("lacks a passing Ubuntu");
});

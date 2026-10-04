import { jest } from "@jest/globals";
import { verifyPreflightCi } from "../../../src/validation/ci/verify-preflight-ci.mjs";

test("blocks CI verification for a dirty worktree", () => {
  expect(verifyPreflightCi(jest.fn(), { info: jest.fn() }, " M file.mjs")).toEqual({
    passed: false,
    blocked: true,
  });
});

test("verifies exact HEAD and reports CI errors", () => {
  const exec = jest.fn((command, args) =>
    args[0] === "rev-parse"
      ? "abc\n"
      : JSON.stringify([
          { databaseId: 1, status: "completed", conclusion: "success", headSha: "abc" },
        ]),
  );
  expect(verifyPreflightCi(exec, { info: jest.fn() }, "")).toMatchObject({ passed: false });
  expect(exec).toHaveBeenCalledWith("git", ["rev-parse", "HEAD"], expect.any(Object));
  const failing = jest.fn(() => {
    throw new Error("CI unavailable");
  });
  expect(verifyPreflightCi(failing, { info: jest.fn() }, "")).toMatchObject({
    passed: false,
    error: expect.any(Error),
  });
});

test("classifies the test job from ci.yaml runner metadata without another GitHub API call", () => {
  const workflowFs = {
    existsSync: (path) => path === ".github/workflows/ci.yaml",
    readFileSync: () => "jobs:\n  test:\n    runs-on: ubuntu-latest\n",
  };
  const exec = jest.fn((command, args) => {
    if (command === "git" && args[0] === "rev-parse") return "abc";
    if (command === "git" && args[0] === "remote") return "https://github.com/eliware/test.git";
    if (command === "gh" && args[1] === "list")
      return JSON.stringify([
        { databaseId: 7, status: "completed", conclusion: "success", headSha: "abc" },
      ]);
    if (command === "gh" && args[1] === "view")
      return JSON.stringify({
        status: "completed",
        conclusion: "success",
        headSha: "abc",
        jobs: [{ databaseId: 9, name: "test", status: "completed", conclusion: "success" }],
      });
    throw new Error(`Unexpected command: ${command} ${args.join(" ")}`);
  });

  expect(verifyPreflightCi(exec, { info: jest.fn() }, "", workflowFs)).toMatchObject({
    runId: 7,
    ubuntu: true,
  });
  expect(exec.mock.calls.some(([, args]) => args[0] === "api")).toBe(false);
});

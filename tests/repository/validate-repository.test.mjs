import { validateRepository } from "../../src/repository/validate-repository.mjs";

test("accepts the main branch", () => {
  const exec = (_command, args) => (args[0] === "branch" ? "main" : "");
  const failures = [];
  validateRepository(exec, failures);
  expect(failures).toEqual([]);
});

test("reports a non-main branch", () => {
  const exec = (_command, args) => (args[0] === "branch" ? "feature" : "");
  const failures = [];
  validateRepository(exec, failures);
  expect(failures.join("\n")).toContain("main");
});

test("reports branch inspection errors", () => {
  const exec = (_command, args) => {
    if (args[0] === "branch") throw new Error("inspection failed");
    return "";
  };
  const failures = [];
  validateRepository(exec, failures);
  expect(failures.join("\n")).toContain("branch validation failed");
});

test("reports a detached worktree explicitly", () => {
  const failures = [];
  validateRepository((_command, args) => (args[0] === "branch" ? "" : ""), failures);
  expect(failures.join("\n")).toContain("detached");
});

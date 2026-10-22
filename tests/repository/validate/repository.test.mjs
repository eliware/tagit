import { validateRepository } from "../../../src/repository/validate/repository.mjs";

test("reports a detached worktree explicitly", () => {
  const failures = [];
  validateRepository((_command, args) => (args[0] === "branch" ? "" : ""), failures);
  expect(failures.join("\n")).toContain("detached");
});

import { jest } from "@jest/globals";
import { validateRepository } from "../../src/repository/validate-repository.mjs";

test("accepts the main branch, matching origin, and safe tracked paths", () => {
  const pkg = {
    repository: { url: "https://github.com/eliware/demo" },
  };
  const exec = (command, args) =>
    args[0] === "branch"
      ? "main"
      : args[0] === "remote"
        ? "https://github.com/eliware/demo.git"
        : "src/index.mjs\n";
  const fs = {
    readFileSync: () => JSON.stringify(pkg),
  };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures).toEqual([]);
});

test("reports branch and tracked secret path failures", () => {
  const exec = (command, args) => (args[0] === "branch" ? "feature" : ".env\ncredentials.json");
  const fs = {
    readFileSync: () => JSON.stringify({}),
  };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join("\n")).toMatch(/main|secret-looking/);
});

test("reports inspection failures from Git and malformed metadata", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] !== "status") throw new Error("inspection failed");
    return "";
  });
  const fs = { readFileSync: jest.fn(() => "{bad") };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join("\n")).toMatch(
    /branch validation|release safety validation|tracked-file validation/,
  );
});

test("reports a detached worktree explicitly", () => {
  const failures = [];
  validateRepository(
    (command, args) => (args[0] === "branch" ? "" : ""),
    {
      readFileSync: () =>
        JSON.stringify({ repository: { url: "https://github.com/eliware/demo" } }),
    },
    failures,
  );
  expect(failures.join("\n")).toContain("detached");
});

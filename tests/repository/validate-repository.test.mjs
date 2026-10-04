import { jest } from "@jest/globals";
import { validateRepository } from "../../src/repository/validate-repository.mjs";

test("accepts complete metadata on main without secret-looking files", () => {
  const workflow =
    "on:\n  push:\n    branches:\n      - main\n  pull_request:\njobs:\n  test:\n    steps:\n      - uses: actions/checkout@v6\n      - uses: actions/setup-node@v7\n      - run: npm -g install npm@latest\n      - run: npm ci\n      - run: npm test";
  const pkg = {
    name: "demo",
    version: "1.0.0",
    description: "demo",
    keywords: ["demo"],
    author: "Eli",
    repository: { url: "https://github.com/eliware/demo" },
    homepage: "https://github.com/eliware/demo",
    license: "MIT",
    engines: { node: ">=26" },
    scripts: { test: "eliware-test", lint: "eliware-test --lint" },
    exports: { ".": "./index.mjs" },
    files: ["README.md", "LICENSE", "RELEASE_NOTES.md"],
    publishConfig: { access: "public", provenance: true },
  };
  const exec = (command, args) =>
    args[0] === "branch"
      ? "main"
      : args[0] === "remote"
        ? "https://github.com/eliware/demo.git"
        : "package.json\n";
  const fs = {
    existsSync: () => true,
    readFileSync: (file) =>
      file === ".tagit-exceptions.json"
        ? '{"inapplicable":{}}'
        : file === "RELEASE_NOTES.md"
          ? "## 1.0.0"
          : file === ".github/workflows/ci.yaml"
            ? workflow
            : JSON.stringify(pkg),
  };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures).toEqual([]);
});

test("reports missing metadata, required files, and tracked secret paths", () => {
  const exec = (command, args) => (args[0] === "branch" ? "feature" : ".env\ncredentials.json");
  const fs = {
    existsSync: (file) => file === "package.json",
    readFileSync: () => JSON.stringify({}),
  };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join("\n")).toMatch(/main|missing|required|secret-looking/);
});

test("reports inspection failures from Git and malformed metadata", () => {
  const exec = jest.fn((command, args) => {
    if (args[0] !== "status") throw new Error("inspection failed");
    return "";
  });
  const fs = { existsSync: jest.fn(() => false), readFileSync: jest.fn(() => "{bad") };
  const failures = [];
  validateRepository(exec, fs, failures);
  expect(failures.join("\n")).toMatch(
    /branch validation|package metadata validation|tracked-file validation/,
  );
});

test("reports a detached worktree explicitly", () => {
  const failures = [];
  validateRepository(
    (command, args) => (args[0] === "branch" ? "" : ""),
    {
      existsSync: () => true,
      readFileSync: (file) =>
        file === ".tagit-exceptions.json"
          ? '{"inapplicable":{}}'
          : JSON.stringify({ name: "x", version: "1", description: "x", license: "MIT" }),
    },
    failures,
  );
  expect(failures.join("\n")).toContain("detached");
});

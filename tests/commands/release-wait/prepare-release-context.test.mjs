import { jest } from "@jest/globals";
import { prepareReleaseContext } from "../../../src/commands/release-wait/prepare-release-context.mjs";

const options = {
  version: "1.2.3",
  release: { commitSha: "abc" },
  maxPolls: 2,
  npmRetries: 2,
  pollMs: 1,
  npmRetryMs: 1,
};

function packageFs(profiles = ["general"]) {
  return {
    existsSync: (file) =>
      file === "package.json" ||
      (profiles.includes("npm-published") && file === ".github/workflows/npm.yaml") ||
      (profiles.includes("ghcr-published") && file === ".github/workflows/ghcr.yaml"),
    readFileSync: () =>
      JSON.stringify({
        name: "demo",
        private: false,
        eliware: { apply: profiles },
      }),
  };
}

function gitMock() {
  const execFileSync = jest.fn((_command, args) => {
    if (args[0] === "rev-parse") return "abc";
    if (args[0] === "remote") return "https://github.com/eliware/demo.git";
    if (args[0] === "show") return "jobs:\n  validate:\n    runs-on: ubuntu-latest";
    return "";
  });
  return execFileSync;
}

test("prepares the release identity and runner label context", () => {
  const execFileSync = gitMock();
  expect(prepareReleaseContext(execFileSync, packageFs(), options)).toMatchObject({
    repo: "eliware/demo",
    tag: "v1.2.3",
    headSha: "abc",
    publication: { applicable: false, workflows: [] },
    runnerLabelsByJobName: { validate: ["ubuntu"] },
  });
});

test("rejects invalid inputs before reading Git context", () => {
  const execFileSync = jest.fn();
  const fs = { existsSync: jest.fn(), readFileSync: jest.fn() };
  expect(() =>
    prepareReleaseContext(execFileSync, fs, {
      version: "next",
      release: { commitSha: "abc" },
      maxPolls: 2,
      npmRetries: 2,
      pollMs: 1,
      npmRetryMs: 1,
    }),
  ).toThrow("must be valid");
  expect(execFileSync).not.toHaveBeenCalled();
  expect(fs.existsSync).not.toHaveBeenCalled();
});

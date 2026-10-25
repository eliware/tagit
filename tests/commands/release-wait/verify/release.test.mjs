import { jest } from "@jest/globals";

const verifyReleaseCompletion = jest.fn(async () => ({ ci: true }));
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/verify/release/completion.mjs",
  () => ({ verifyReleaseCompletion }),
);

const { verifyRelease } = await import("../../../../src/commands/release-wait/verify/release.mjs");

const log = { info: jest.fn() };
const input = {
  version: "1.0.0",
  release: { commitSha: "abc" },
  maxPolls: 1,
  pollMs: 0,
  npmRetries: 1,
  npmRetryMs: 0,
};
const fs = {
  existsSync: (file) => file === "package.json",
  readFileSync: (file) =>
    file === "package.json" ? JSON.stringify({ name: "demo", private: false }) : "publish",
};

function execFileSync(_command, args) {
  if (args[0] === "remote") return "git@github.com:eliware/demo.git";
  if (args[0] === "show") return "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
  return "abc";
}

beforeEach(() => {
  jest.clearAllMocks();
  verifyReleaseCompletion.mockResolvedValue({ ci: true });
});

test("coordinates complete release verification", async () => {
  const execFile = jest.fn();
  await expect(verifyRelease(execFileSync, fs, log, { ...input, execFile })).resolves.toEqual({
    ci: true,
  });
  expect(verifyReleaseCompletion).toHaveBeenCalledWith(
    expect.objectContaining({
      repo: "eliware/demo",
      tag: "v1.0.0",
      headSha: "abc",
      version: "1.0.0",
      checkPublish: false,
      publication: {
        applicable: false,
        ghcrApplicable: false,
        workflows: [],
        packageName: null,
        isPrivate: false,
      },
      execFile,
    }),
  );
});

test("propagates full verification failures", async () => {
  verifyReleaseCompletion.mockRejectedValue(new Error("release check failed"));
  await expect(verifyRelease(execFileSync, fs, log, input)).rejects.toThrow("release check failed");
});

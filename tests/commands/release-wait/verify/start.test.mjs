import { jest } from "@jest/globals";

const reportReleaseVerificationStart = jest.fn(async (options) => ({
  ...options,
  linksOnly: true,
}));
jest.unstable_mockModule(
  "../../../../src/commands/release-wait/report/release/start-verification.mjs",
  () => ({ reportReleaseVerificationStart }),
);

const { startReleaseVerification } =
  await import("../../../../src/commands/release-wait/verify/start.mjs");

const log = { info: jest.fn() };
const input = { version: "1.0.0", release: { commitSha: "abc" }, pollMs: 0, maxPolls: 1 };
const baseFs = () => ({
  existsSync: (file) => file === "package.json",
  readFileSync: () => JSON.stringify({ name: "demo", private: false }),
});

function execFileSync(_command, args) {
  if (args[0] === "remote") return "git@github.com:eliware/demo.git";
  if (args[0] === "show") return "jobs:\n  validate:\n    runs-on: ubuntu-latest\n";
  return "abc";
}

beforeEach(() => jest.clearAllMocks());

test("starts CI link checks for the prepared release", async () => {
  const execFile = jest.fn();
  await expect(
    startReleaseVerification(execFileSync, baseFs(), log, { ...input, execFile }),
  ).resolves.toMatchObject({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    linksOnly: true,
  });
  expect(reportReleaseVerificationStart).toHaveBeenCalledWith(
    expect.objectContaining({
      repo: "eliware/demo",
      tag: "v1.0.0",
      headSha: "abc",
      checkPublish: false,
      publicationWorkflows: [],
      execFile,
    }),
  );
});

test("starts publication link checks when an npm workflow applies", async () => {
  const fs = baseFs();
  fs.existsSync = (file) => file === "package.json" || file === ".github/workflows/npm.yaml";
  fs.readFileSync = (file) =>
    file === "package.json"
      ? JSON.stringify({
          name: "@eliware/demo",
          private: false,
          eliware: { apply: ["npm-published"] },
        })
      : "publish";
  await startReleaseVerification(execFileSync, fs, log, {
    version: input.version,
    release: input.release,
  });
  expect(reportReleaseVerificationStart).toHaveBeenCalledWith(
    expect.objectContaining({
      checkPublish: true,
      publicationWorkflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
    }),
  );
});

test("rejects omitted options before inspecting the repository", async () => {
  const inspect = jest.fn();
  await expect(startReleaseVerification(inspect, baseFs(), log)).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
});

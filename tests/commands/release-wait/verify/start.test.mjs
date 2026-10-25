import { jest } from "@jest/globals";
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

function releasePoller() {
  return jest.fn((_command, args, _options, callback) => {
    const workflow = args[args.indexOf("--workflow") + 1];
    if (args[1] === "list") {
      const databaseId = workflow.endsWith("npm.yaml") ? 102 : 101;
      return callback(
        null,
        JSON.stringify([{ databaseId, headSha: "abc", headBranch: "v1.0.0" }]),
        "",
      );
    }
    const databaseId = Number(args[2]);
    return callback(
      null,
      JSON.stringify({
        databaseId,
        status: "completed",
        conclusion: "success",
        headSha: "abc",
        jobs: [{ name: "validate", status: "completed", conclusion: "success" }],
        url: `https://example.test/runs/${databaseId}`,
      }),
      "",
    );
  });
}

beforeEach(() => log.info.mockClear());

test("starts CI link checks for the prepared release", async () => {
  const execFile = releasePoller();
  await expect(
    startReleaseVerification(execFileSync, baseFs(), log, { ...input, execFile }),
  ).resolves.toMatchObject({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ciRunId: 101,
    publishRunId: null,
    linksOnly: true,
  });
  expect(log.info).toHaveBeenCalledWith(
    "CI: [https://example.test/runs/101](https://example.test/runs/101)",
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
  const execFile = releasePoller();
  await expect(
    startReleaseVerification(execFileSync, fs, log, {
      version: input.version,
      release: input.release,
      maxPolls: 1,
      execFile,
    }),
  ).resolves.toMatchObject({ ciRunId: 101, publishRunId: 102, linksOnly: true });
  expect(log.info).toHaveBeenCalledWith(
    "npm: [https://example.test/runs/102](https://example.test/runs/102)",
  );
});

test("rejects omitted options before inspecting the repository", async () => {
  const inspect = jest.fn();
  await expect(startReleaseVerification(inspect, baseFs(), log)).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
});

import { jest } from "@jest/globals";
const { startReleaseVerification } =
  await import("../../../../src/commands/release-wait/verify/start.mjs");

const log = { info: jest.fn() };
const input = { version: "1.0.0", release: { commitSha: "abc" }, pollMs: 0, maxPolls: 1 };
function execFileSync(_command, args) {
  if (args[0] === "remote") return "git@github.com:eliware/demo.git";
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

test("starts CI link checks for the release without checking publication", async () => {
  const execFile = releasePoller();
  await expect(
    startReleaseVerification(execFileSync, log, { ...input, execFile }),
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

test.each(["npm", "ghcr", "none"])(
  "does not check %s publication during release start",
  async () => {
    const execFile = releasePoller();
    await expect(
      startReleaseVerification(execFileSync, log, { ...input, execFile }),
    ).resolves.toMatchObject({ ciRunId: 101, publishRunId: null, linksOnly: true });
    expect(execFile.mock.calls.filter(([, args]) => args[1] === "list")).toHaveLength(1);
    expect(execFile.mock.calls[0][1]).toContain(".github/workflows/ci.yaml");
  },
);

test("rejects omitted options before inspecting the repository", async () => {
  const inspect = jest.fn();
  await expect(startReleaseVerification(inspect, log)).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
});

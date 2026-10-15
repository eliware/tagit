import { jest } from "@jest/globals";
import { verifyRelease } from "../../../src/commands/release-wait/verify-release.mjs";

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
  existsSync: jest.fn((file) => file === "package.json"),
  readFileSync: jest.fn((file) =>
    file === "package.json" ? JSON.stringify({ name: "demo", private: false }) : "publish",
  ),
  readdirSync: jest.fn(() => ["ci.yaml"]),
};

function execFileSync(command, args) {
  if (args[0] === "remote") return "git@github.com:eliware/demo.git";
  if (args[0] === "show")
    return "jobs:\n  validate:\n    runs-on: ubuntu-latest\n  publish:\n    runs-on: ubuntu-latest\n";
  return args[0] === "describe" ? "v1.0.0" : "abc";
}

const execFile = jest.fn((_command, args, _options, callback) => {
  if (args[1] === "list")
    return callback(
      null,
      JSON.stringify([{ databaseId: 1, headSha: "abc", headBranch: "v1.0.0" }]),
      "",
    );
  if (args[1] === "view")
    return callback(
      null,
      JSON.stringify({
        databaseId: 1,
        status: "completed",
        conclusion: "success",
        headSha: "abc",
        jobs: [
          { name: "validate", status: "completed", conclusion: "success" },
          { name: "publish", status: "completed", conclusion: "success" },
        ],
      }),
      "",
    );
  return callback(null, JSON.stringify("1.0.0"), "");
});

beforeEach(() => execFile.mockClear());

test.each([
  ["invalid release input", { version: "next", release: { commitSha: "abc" } }],
  ["omitted release options", undefined],
])("rejects %s before external inspection", async (_case, options) => {
  const inspect = jest.fn();
  await expect(verifyRelease(inspect, fs, log, options)).rejects.toThrow();
  expect(inspect).not.toHaveBeenCalled();
});

test("returns links-only CI evidence without registry verification", async () => {
  await expect(
    verifyRelease(execFileSync, fs, log, { ...input, linksOnly: true, execFile }),
  ).resolves.toMatchObject({
    ciRunId: 1,
    publishRunId: null,
  });
});

test("ends after successful CI when no publish workflow applies", async () => {
  await expect(verifyRelease(execFileSync, fs, log, { ...input, execFile })).resolves.toBeDefined();
});

test("checks the publish workflow and npm when the profile and workflow exist", async () => {
  const publishFs = {
    ...fs,
    existsSync: (file) => file === "package.json" || file === ".github/workflows/publish.yaml",
    readFileSync: (file) =>
      file === "package.json"
        ? JSON.stringify({ name: "demo", private: false, eliware: { apply: ["npm-published"] } })
        : "publish",
  };
  const info = jest.fn();
  const result = await verifyRelease(execFileSync, publishFs, { info }, { ...input, execFile });
  expect(result).toMatchObject({ ci: true, npm: true, ghcr: false });
  expect(
    execFile.mock.calls.some(([, args]) => args.includes(".github/workflows/publish.yaml")),
  ).toBe(true);
  expect(info).toHaveBeenCalledWith("npm verified: demo@1.0.0.");
});

test("checks GHCR publication from a GHCR profile and publish workflow", async () => {
  const ghcrFs = {
    ...fs,
    existsSync: (file) => file === "package.json" || file === ".github/workflows/publish.yaml",
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  const result = await verifyRelease(execFileSync, ghcrFs, log, {
    ...input,
    linksOnly: true,
    execFile,
  });
  expect(result).toMatchObject({ ciRunId: 1, publishRunId: 1 });
  expect(
    execFile.mock.calls.some(([, args]) => args.includes(".github/workflows/publish.yaml")),
  ).toBe(true);
});

test("ignores publish.yaml when no publication profile applies", async () => {
  const optionalFs = {
    ...fs,
    existsSync: (file) => file === "package.json" || file === ".github/workflows/publish.yaml",
    readFileSync: () => JSON.stringify({ name: "demo", eliware: { apply: ["general"] } }),
  };
  await verifyRelease(execFileSync, optionalFs, log, { ...input, execFile });
  expect(
    execFile.mock.calls.some(([, args]) => args.includes(".github/workflows/publish.yaml")),
  ).toBe(false);
});

test("rejects when CI details are invalid or the release identity is unavailable", async () => {
  const bad = jest.fn((_command, args, _options, callback) => {
    if (args[1] === "list")
      return callback(
        null,
        JSON.stringify([{ databaseId: 2, headSha: "abc", headBranch: "v1.0.0" }]),
        "",
      );
    return callback(
      null,
      JSON.stringify({
        databaseId: 2,
        status: "completed",
        conclusion: "failure",
        headSha: "abc",
        jobs: [],
      }),
      "",
    );
  });
  await expect(verifyRelease(execFileSync, fs, log, { ...input, execFile: bad })).rejects.toThrow();
});

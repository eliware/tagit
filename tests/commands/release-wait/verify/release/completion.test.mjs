import { jest } from "@jest/globals";
import { verifyReleaseCompletion } from "../../../../../src/commands/release-wait/verify/release/completion.mjs";

const base = {
  fs: { existsSync: () => false },
  runnerLabelsByJobName: { validate: ["ubuntu"] },
  execFile: (_command, _args, _options, callback) => callback(null, '"1.0.0"', ""),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  tag: "v1.0.0",
  headSha: "abc",
  version: "1.0.0",
  release: {},
  publication: {
    applicable: false,
    ghcrApplicable: false,
    packageName: null,
    isPrivate: null,
    workflows: [],
  },
  maxPolls: 1,
  npmRetries: 1,
  pollMs: 0,
  npmRetryMs: 0,
  sleep: jest.fn(),
};

test("ends after CI when no publication profile applies", async () => {
  const poll = jest.fn(async () => ({
    databaseId: 1,
    url: "ci-url",
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    ],
  }));
  await expect(verifyReleaseCompletion({ ...base, checkPublish: false, poll })).resolves.toEqual({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ci: true,
    npm: false,
    ghcr: false,
  });
  expect(poll).toHaveBeenCalledTimes(1);
  expect(poll.mock.calls[0][0].workflowPath).toBe(".github/workflows/ci.yaml");
});

test("returns after CI when publication checks find no targets", async () => {
  const poll = jest.fn(async () => ({
    databaseId: 1,
    jobs: [
      { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
    ],
  }));
  await expect(verifyReleaseCompletion({ ...base, checkPublish: true, poll })).resolves.toEqual({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ci: true,
    npm: false,
    ghcr: false,
  });
  expect(poll).toHaveBeenCalledTimes(1);
});

test("uses the default CI poller when no poll override is supplied", async () => {
  const execFile = jest.fn((_command, args, _options, callback) => {
    if (args[1] === "list")
      return callback(
        null,
        JSON.stringify([{ databaseId: 4, headSha: "abc", headBranch: "v1.0.0" }]),
        "",
      );
    return callback(
      null,
      JSON.stringify({
        databaseId: 4,
        status: "completed",
        conclusion: "success",
        headSha: "abc",
        jobs: [{ name: "validate", status: "completed", conclusion: "success" }],
        url: "ci-url",
      }),
      "",
    );
  });
  await expect(
    verifyReleaseCompletion({
      ...base,
      execFile,
      checkPublish: false,
    }),
  ).resolves.toMatchObject({ ci: true, npm: false, ghcr: false });
});

test("checks publication and registry after CI when the profile applies", async () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/npm.yaml",
    readFileSync: () =>
      JSON.stringify({ name: "demo", private: false, eliware: { apply: ["npm-published"] } }),
  };
  const poll = jest
    .fn()
    .mockResolvedValueOnce({
      databaseId: 1,
      jobs: [
        { name: "validate", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      ],
    })
    .mockResolvedValueOnce({
      databaseId: 2,
      jobs: [
        { name: "publish", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
      ],
    });
  const log = { info: jest.fn() };
  await expect(
    verifyReleaseCompletion({
      ...base,
      fs,
      log,
      checkPublish: true,
      publication: {
        applicable: true,
        ghcrApplicable: false,
        packageName: "demo",
        isPrivate: false,
        workflows: [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
      },
      poll,
    }),
  ).resolves.toMatchObject({
    ci: true,
    npm: true,
    ghcr: false,
  });
  expect(poll).toHaveBeenCalledTimes(2);
  expect(poll.mock.calls[1][0].workflowPath).toBe(".github/workflows/npm.yaml");
  expect(log.info).toHaveBeenCalledWith("npm verified: demo@1.0.0.");
});

test("checks GHCR publication when ghcr.yaml and its profile apply", async () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".github/workflows/ghcr.yaml",
    readFileSync: () => JSON.stringify({ eliware: { apply: ["ghcr-published"] } }),
  };
  const jobs = [
    { name: "publish", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" },
  ];
  const poll = jest.fn(async ({ workflowPath }) => ({
    databaseId: workflowPath.endsWith("ghcr.yaml") ? 2 : 1,
    url: "run-url",
    jobs,
  }));
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(null, JSON.stringify([{ metadata: { container: { tags: ["v1.0.0"] } } }]), ""),
  );
  await expect(
    verifyReleaseCompletion({
      ...base,
      fs,
      execFile,
      checkPublish: true,
      publication: {
        applicable: false,
        ghcrApplicable: true,
        packageName: null,
        isPrivate: false,
        workflows: [{ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" }],
      },
      poll,
    }),
  ).resolves.toMatchObject({ ci: true, npm: false, ghcr: true });
  expect(poll.mock.calls[1][0].workflowPath).toBe(".github/workflows/ghcr.yaml");
});

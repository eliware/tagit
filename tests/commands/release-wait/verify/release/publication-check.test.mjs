import { jest } from "@jest/globals";
import { checkReleasePublication } from "../../../../../src/commands/release-wait/verify/release/publication-check.mjs";

const base = {
  fs: { existsSync: () => false },
  common: { repo: "eliware/demo", tag: "v1.0.0" },
  execFile: jest.fn(),
  log: { info: jest.fn() },
  repo: "eliware/demo",
  tag: "v1.0.0",
  headSha: "abc",
  version: "1.0.0",
  release: {},
  maxPolls: 1,
  npmRetries: 1,
  pollMs: 0,
  npmRetryMs: 0,
  sleep: jest.fn(),
};

test("finishes without polls when no publication workflows apply", async () => {
  const poll = jest.fn();
  await expect(
    checkReleasePublication({ ...base, poll, publicationWorkflows: [] }),
  ).resolves.toEqual({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ci: true,
    npm: false,
    ghcr: false,
  });
  expect(poll).not.toHaveBeenCalled();
});

test("polls configured publication workflows before verifying targets", async () => {
  const poll = jest.fn(async () => ({ jobs: [] }));
  const publicationWorkflows = [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }];
  await expect(
    checkReleasePublication({ ...base, poll, publicationWorkflows }),
  ).resolves.toMatchObject({ ci: true, npm: false, ghcr: false });
  expect(poll).toHaveBeenCalledWith({
    ...base.common,
    workflowPath: ".github/workflows/npm.yaml",
    workflowLabel: "npm",
  });
});

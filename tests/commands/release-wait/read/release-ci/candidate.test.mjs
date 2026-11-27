import { jest } from "@jest/globals";
import readReleaseCiCandidate from "../../../../../src/commands/release-wait/read/release-ci/candidate.mjs";

test("reads and selects the release workflow candidate", async () => {
  const execFile = jest.fn((_command, _args, _options, callback) =>
    callback(
      null,
      JSON.stringify([
        { databaseId: 7, createdAt: "2026-01-01", headSha: "abc", headBranch: "v1.0.0" },
      ]),
      "",
    ),
  );
  await expect(
    readReleaseCiCandidate(execFile, "eliware/demo", "abc", "v1.0.0"),
  ).resolves.toMatchObject({
    databaseId: 7,
  });
  expect(execFile.mock.calls[0][1]).toContain("--branch");
  expect(execFile.mock.calls[0][1]).toContain("v1.0.0");
});

test("marks invalid candidate JSON as a release CI list error", async () => {
  const execFile = jest.fn((_command, _args, _options, callback) => callback(null, "{bad", ""));
  await expect(
    readReleaseCiCandidate(execFile, "eliware/demo", "abc", "v1.0.0"),
  ).rejects.toMatchObject({ code: "ERR_RELEASE_CI_LIST_JSON" });
});

test("preserves candidate read errors that are not JSON errors", async () => {
  const error = new Error("GitHub unavailable");
  const execFile = jest.fn((_command, _args, _options, callback) => callback(error, "", ""));
  await expect(readReleaseCiCandidate(execFile, "eliware/demo", "abc", "v1.0.0")).rejects.toBe(
    error,
  );
});

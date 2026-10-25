import { jest } from "@jest/globals";
import { verifyReleasePublicationWorkflow } from "../../../../../../src/commands/release-wait/verify/release/publication/workflow.mjs";

test("verifies publication workflow jobs and reports links", () => {
  const log = { info: jest.fn() };
  const publishJob = {
    name: "publish",
    status: "completed",
    conclusion: "success",
    url: "publish-url",
  };
  expect(
    verifyReleasePublicationWorkflow({
      targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
      publicationRuns: [{ profile: "npm", run: { jobs: [publishJob] } }],
      applicable: true,
      isPrivate: false,
      repo: "eliware/demo",
      tag: "v1.0.0",
      log,
    }),
  ).toEqual([{ profile: "npm", publishJobs: [publishJob] }]);
  expect(log.info).toHaveBeenCalledWith("npm: [publish-url](publish-url)");
});

test("does not report links when workflow job verification fails", () => {
  const log = { info: jest.fn() };
  expect(() =>
    verifyReleasePublicationWorkflow({
      targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
      publicationRuns: [],
      applicable: true,
      isPrivate: false,
      repo: "eliware/demo",
      tag: "v1.0.0",
      log,
    }),
  ).toThrow("Release npm workflow did not complete.");
  expect(log.info).not.toHaveBeenCalledWith(expect.stringContaining("[publish-url]"));
});
